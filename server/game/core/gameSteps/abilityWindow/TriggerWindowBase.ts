import type { Player } from '../../Player';
import type { GameEvent } from '../../event/GameEvent';
import type { EventWindow } from '../../event/EventWindow';
import { AbilityType, SubStepCheck } from '../../Constants';
import { Contract } from '../../utils/Contract';
import type { TriggeredAbilityContext } from '../../ability/TriggeredAbilityContext';
import type { TriggeredAbilityBase } from '../../ability/TriggeredAbility';
import type { Card } from '../../card/Card';
import { TriggeredAbilityWindowTitle } from './TriggeredAbilityWindowTitle';
import { BaseStep } from '../BaseStep';
import type { Game } from '../../Game';
import { TriggeredAbilityResolutionPrompt } from '../prompts/TriggeredAbilityResolutionPrompt';
import { BatchTriggerResolutionPrompt } from '../prompts/BatchTriggerResolutionPrompt';
import type { IResolutionChoice, ITriggerWindowSourceCard } from '../PromptInterfaces';

export abstract class TriggerWindowBase extends BaseStep {
    /** Triggered effects / abilities that have not yet been resolved, organized by owning player */
    protected unresolved = new Map<Player, TriggeredAbilityContext[]>();

    /** Already resolved effects / abilities */
    protected resolved: { ability: TriggeredAbilityBase; event: GameEvent }[] = [];

    /** Map tracking which events have triggered which abilities (for duplicate prevention) */
    protected triggeredAbilityEvents = new Map<TriggeredAbilityBase, GameEvent[]>();

    /** Chosen order of players to resolve in (SWU 7.6.10), null if not yet chosen */
    private resolvePlayerOrder?: Player[] = null;

    /** The events that were triggered as part of this window */
    protected triggeringEvents: GameEvent[] = [];

    protected choosePlayerResolutionOrderComplete = false;

    /**
     * Set while a player is resolving all remaining instances of a grouped trigger "all at once". Each
     * matching instance is then resolved without re-prompting, so nested triggers from one instance still
     * resolve before the next (SWU 7.6.11), and cleared once the group is exhausted.
     */
    private pendingBatchResolve?: { player: Player; groupKey: string } = null;

    protected readonly triggerAbilityType: AbilityType.Triggered | AbilityType.ReplacementEffect | AbilityType.DelayedEffect;

    protected readonly eventWindow?: EventWindow;

    public get currentlyResolvingPlayer(): Player | null {
        return this.resolvePlayerOrder?.[0] ?? null;
    }

    public get triggeredAbilities(): TriggeredAbilityContext[] {
        return Array.from(this.unresolved.values()).flat();
    }

    public constructor(
        game: Game,
        triggerAbilityType: AbilityType.Triggered | AbilityType.ReplacementEffect | AbilityType.DelayedEffect,
        eventWindow?: EventWindow
    ) {
        super(game);

        this.triggerAbilityType = triggerAbilityType;
        this.eventWindow = eventWindow;

        if (eventWindow) {
            this.triggeringEvents = [...this.eventWindow.events];
        }
    }

    public addTriggeringEvents(newEvents: GameEvent[] = []) {
        for (const event of newEvents) {
            if (!this.triggeringEvents.includes(event)) {
                this.triggeringEvents.push(event);
            }
        }
    }

    public emitEvents(specificEvents = null) {
        let events;
        if (specificEvents) {
            for (const event of specificEvents) {
                Contract.assertArrayIncludes(this.triggeringEvents, event, `Event ${event.name} not found in triggering events: ${this.triggeringEvents.map((e) => e.name).join(', ')}`);
            }

            events = specificEvents;
        } else {
            events = this.triggeringEvents;
        }

        events = events.filter((event) => !event.isCancelledOrReplaced);

        for (const event of events) {
            this.game.emit(event.name + ':' + this.triggerAbilityType, event, this);
        }

        this.game.emit('aggregateEvent:' + this.triggerAbilityType, events, this);
    }

    public abstract shouldCleanUpTriggers(): boolean;

    protected abstract resolveAbility(context: TriggeredAbilityContext): void;

    public override continue() {
        if (this.shouldCleanUpTriggers()) {
            this.cleanUpTriggers();
            // if no abilities trigged, continue with game flow
            if (this.unresolved.size === 0) {
                return true;
            }

            if (!this.choosePlayerResolutionOrderComplete) {
                // if more than one player has triggered abilities, need to prompt for resolve order (SWU 7.6.10)
                if (this.unresolved.size > 1) {
                    this.promptForResolvePlayerOrder();
                    return false;
                }

                // if only one player, that player is automatically the resolving player
                this.resolvePlayerOrder = [this.unresolved.keys().next().value];
                this.choosePlayerResolutionOrderComplete = true;
            }
        }

        if (!this.choosePlayerResolutionOrderComplete) {
            return false;
        }

        // prompt for any abilities not yet resolved, otherwise we're done
        if (this.promptUnresolvedAbilities()) {
            return true;
        }

        return false;
    }

    public addTriggeredAbilityToWindow(context: TriggeredAbilityContext) {
        if ((context.event.canResolve || context.event.isResolved) && context.ability) {
            // Check if this ability has already been triggered by this event (duplicate prevention)
            const existingEvents = this.triggeredAbilityEvents.get(context.ability) || [];
            if (existingEvents.includes(context.event)) {
                return;
            }

            // Track that this ability was triggered by this event
            existingEvents.push(context.event);
            this.triggeredAbilityEvents.set(context.ability, existingEvents);

            if (!this.unresolved.has(context.player)) {
                this.unresolved.set(context.player, [context]);
            } else {
                this.unresolved.get(context.player).push(context);
            }
        }
    }

    protected assertWindowResolutionNotStarted(triggerTypeName: string, source: Card) {
        Contract.assertFalse(this.choosePlayerResolutionOrderComplete, `Attempting to add new triggered ${triggerTypeName} from source '${source.internalName}' to a window that has already started resolution`);
    }

    protected promptUnresolvedAbilities() {
        Contract.assertNotNullLike(this.currentlyResolvingPlayer);

        this.choosePlayerResolutionOrderComplete = true;

        let abilitiesToResolve = this.unresolved.get(this.currentlyResolvingPlayer);

        // if none of the player's remaining abilities can resolve, skip to the next player
        if (!abilitiesToResolve || !this.canAnyAbilitiesResolve(abilitiesToResolve)) {
            this.unresolved.set(this.currentlyResolvingPlayer, []);
            abilitiesToResolve = [];
        }

        if (abilitiesToResolve.length === 0) {
            this.resolvePlayerOrder.shift();

            if (this.resolvePlayerOrder.length === 0) {
                if (this.triggeredAbilities.length === 0) {
                    // if the last resolving player is out of abilities to resolve, we're done
                    return true;
                }

                // If there are still unresolved abilities, reset the player order and continue
                // (this should only happen if new replacement abilities were added during resolution)
                this.resolvePlayerOrder = Array.from(this.unresolved.keys());
            }

            abilitiesToResolve = this.unresolved.get(this.currentlyResolvingPlayer);
        }

        // Check to if we're dealing with a multi-selection of the 'same' ability
        const repeatedAbilities = this.getRepeatedAbilityTriggers(abilitiesToResolve);

        for (const repeatedAbility of repeatedAbilities) {
            // if an ability is triggered multiple times and uses a collective trigger, filter down to one instance of it
            if (repeatedAbility.collectiveTrigger) {
                const abilityTriggers = abilitiesToResolve.filter((context) => context.ability === repeatedAbility);
                abilitiesToResolve = abilitiesToResolve.filter((context) => context.ability !== repeatedAbility);
                abilitiesToResolve.push(abilityTriggers[0]);
                this.unresolved.set(this.currentlyResolvingPlayer, abilitiesToResolve);
                continue;
            }

            // if an ability is triggered multiple times but does not use a collective trigger, we need to treat it as a multi-select
            // so we can differentiate which instance is being resolved. If the ability defines a contextTitle, it usually
            // already differentiates the instances (e.g. by naming the affected card), so we don't append the override title
            // unless the ability explicitly opts in via appendOverrideTitle.
            if (!repeatedAbility.shouldAppendOverrideTitle) {
                continue;
            }

            for (const context of abilitiesToResolve.filter((context) => context.ability === repeatedAbility)) {
                if (!context.overrideTitle) {
                    context.setOverrideTitle(this.getOverrideTitle(context));
                }
            }
        }

        // if the player chose to resolve a grouped trigger "all at once", keep resolving the next matching
        // instance without re-prompting until the group is exhausted (nested triggers still interleave)
        if (this.pendingBatchResolve?.player === this.currentlyResolvingPlayer) {
            const nextInBatch = abilitiesToResolve.find((context) => this.getGroupKey(context) === this.pendingBatchResolve.groupKey);
            if (nextInBatch) {
                this.resolveAbility(nextInBatch);
                return false;
            }

            // group exhausted; fall through to normal prompting for any remaining triggers
            this.pendingBatchResolve = null;
        }

        const resolutionChoices = this.buildResolutionChoices(abilitiesToResolve);

        // if there's more than one choice still unresolved, prompt for next selection
        if (resolutionChoices.length > 1) {
            this.promptForNextAbilityToResolve(resolutionChoices);
            return false;
        }

        resolutionChoices[0].handler();
        return false;
    }

    /**
     * Builds the list of selectable resolution choices for the currently resolving player. Similar triggers
     * (same base title and source card) are grouped into a single choice so the player isn't asked to order
     * several identical triggers one at a time; selecting a group lets them resolve the next instance or all
     * remaining instances at once. Each grouped instance still resolves as its own trigger.
     */
    protected buildResolutionChoices(abilitiesToResolve: TriggeredAbilityContext[]): IResolutionChoice[] {
        const groupsByKey = new Map<string, TriggeredAbilityContext[]>();
        const orderedKeys: string[] = [];

        for (const context of abilitiesToResolve) {
            const key = this.getGroupKey(context);
            if (!groupsByKey.has(key)) {
                groupsByKey.set(key, []);
                orderedKeys.push(key);
            }
            groupsByKey.get(key).push(context);
        }

        return orderedKeys.map((key) => {
            const members = groupsByKey.get(key);
            return members.length === 1 ? this.buildContextChoice(members[0]) : this.buildGroupChoice(members);
        });
    }

    /** Builds the resolution choice for a single triggered ability context. */
    protected buildContextChoice(context: TriggeredAbilityContext): IResolutionChoice {
        return {
            getTitle: () => context.ability.getTitle(context),
            getSourceCard: () => this.getSourceCardSummary(context.source),
            hasLegalEffects: () => context.ability.hasAnyLegalEffects(context, SubStepCheck.All),
            handler: () => this.resolveAbility(context),
        };
    }

    /**
     * Builds a single choice representing several similar triggers. Selecting it opens a modal to resolve
     * the next instance or all remaining instances. The displayed title uses the ability's grouping title
     * (see `getGroupingTitle`), so the per-instance override/context suffixes that distinguish individual
     * triggers are intentionally ignored when they are collapsed into a group.
     */
    protected buildGroupChoice(members: TriggeredAbilityContext[]): IResolutionChoice {
        const first = members[0];
        return {
            getTitle: () => this.getGroupingTitle(first),
            getSourceCard: () => this.getSourceCardSummary(first.source),
            hasLegalEffects: () => members.some((context) => context.ability.hasAnyLegalEffects(context, SubStepCheck.All)),
            count: members.length,
            handler: () => this.promptBatchResolution(members),
        };
    }

    /**
     * Groups similar triggers together. Keyed by the ability's grouping title and the source card's internal
     * name, which incorporates subtitles so that distinct unique cards sharing a title aren't grouped, while
     * identical token copies (e.g. Advantage) are.
     */
    protected getGroupKey(context: TriggeredAbilityContext): string {
        const source = context.source;
        const sourceKey = source?.isCard?.() ? source.internalName : 'no-source-card';
        return `${this.getGroupingTitle(context)}::${sourceKey}`;
    }

    /**
     * The title used to compare and display grouped triggers. It resolves the ability's title with no
     * context, which yields the statically-authored title and skips both the per-instance override suffix
     * (e.g. ": <card name>") and any dynamic `contextTitle`. Ignoring those keeps grouping side-effect-free
     * and safe even when the source has left play (a `contextTitle` may read now-invalid in-play state), and
     * matches the intent that per-instance differentiation shouldn't split otherwise-identical triggers.
     */
    protected getGroupingTitle(context: TriggeredAbilityContext): string {
        return context.ability.getTitle();
    }

    private promptBatchResolution(members: TriggeredAbilityContext[]) {
        const first = members[0];
        const groupKey = this.getGroupKey(first);
        const player = this.currentlyResolvingPlayer;

        this.game.queueStep(new BatchTriggerResolutionPrompt(this.game, player, {
            sourceCard: this.getSourceCardSummary(first.source),
            title: this.getGroupingTitle(first),
            remainingCount: members.length,
            onResolveNext: () => {
                const next = this.unresolved.get(player)?.find((context) => this.getGroupKey(context) === groupKey);
                if (next) {
                    this.resolveAbility(next);
                }
            },
            onResolveAll: () => {
                this.pendingBatchResolve = { player, groupKey };
                this.promptUnresolvedAbilities();
            },
        }));
    }

    protected getSourceCardSummary(card: Card): ITriggerWindowSourceCard | undefined {
        if (!card?.isCard?.()) {
            return undefined;
        }

        return {
            ...card.getShortSummary(),
            type: card.type
        };
    }

    /** Get the set of yet-unresolved abilities for the player whose turn it is to do resolution */
    private getCurrentlyResolvingAbilities() {
        Contract.assertNotNullLike(this.currentlyResolvingPlayer);
        Contract.assertMapHasKey(this.unresolved, this.currentlyResolvingPlayer);

        return this.unresolved.get(this.currentlyResolvingPlayer);
    }

    private getOverrideTitle(context: TriggeredAbilityContext) {
        return `${context.ability.getTitle(context)}: ${context.event.card.title}`;
    }

    private getRepeatedAbilityTriggers(abilitiesToResolve: TriggeredAbilityContext[]) {
        const repeatedAbilities = new Set<TriggeredAbilityBase>();
        const allAbilitiesByPlayer = new Map<Player, Set<TriggeredAbilityBase>>();

        function addAbilityForPlayer(player: Player, ability: TriggeredAbilityBase) {
            if (!allAbilitiesByPlayer.has(player)) {
                allAbilitiesByPlayer.set(player, new Set([ability]));
            } else {
                allAbilitiesByPlayer.get(player).add(ability);
            }
        }

        for (const entry of this.resolved) {
            const player = entry.event['player'] as Player;
            addAbilityForPlayer(player, entry.ability);
        }

        for (const abilityContext of abilitiesToResolve) {
            const ability = abilityContext.ability;
            const player = abilityContext.event['player'] as Player;

            // Only count abilities as "repeated" if they were triggered by the same player
            if (allAbilitiesByPlayer.has(player) && allAbilitiesByPlayer.get(player).has(ability)) {
                repeatedAbilities.add(ability);
            } else {
                addAbilityForPlayer(player, ability);
            }
        }

        return repeatedAbilities;
    }

    private promptForNextAbilityToResolve(resolutionChoices: IResolutionChoice[]) {
        this.game.queueStep(new TriggeredAbilityResolutionPrompt(
            this.game,
            this.currentlyResolvingPlayer,
            resolutionChoices
        ));
    }

    // this is here to allow for overriding in subclasses
    protected getPromptForSelectProperties() {
        return this.getPromptProperties();
    }

    private getPromptProperties() {
        return {
            source: 'Triggered Abilities',
            availableCards: this.getAbilityResolutionCards(),
            activePromptTitle: TriggeredAbilityWindowTitle.getTitle(this.triggeringEvents),
            waitingPromptTitle: 'Waiting for opponent'
        };
    }

    protected postResolutionUpdate(resolver) {
        const unresolvedAbilitiesForPlayer = this.getCurrentlyResolvingAbilities();

        const justResolvedAbility = unresolvedAbilitiesForPlayer.find((context) =>
            context.ability === resolver.context.ability &&
            context.event === resolver.context.event
        );

        // if we can't find the ability to remove from the list, we have to error or else get stuck in an infinite loop
        if (justResolvedAbility == null) {
            throw Error(`Could not find the resolved ability '${resolver.context.ability?.title}' on card ${resolver.context.source?.internalName} in the list of unresolved abilities for player ${this.currentlyResolvingPlayer.name}`);
        }

        unresolvedAbilitiesForPlayer.splice(unresolvedAbilitiesForPlayer.indexOf(justResolvedAbility), 1);
        this.resolved.push({ ability: resolver.context.ability, event: resolver.context.event });
    }

    /**
     * Builds a list of all the cards that own one or more of the triggered abilities
     * that are currently being evaluated
     */
    private getAbilityResolutionCards(): Card[] {
        const triggeringCards = new Set<Card>();
        const abilitiesAvailableForPlayer = this.getCurrentlyResolvingAbilities();

        for (const abilityContext of abilitiesAvailableForPlayer) {
            Contract.assertNotNullLike(abilityContext.source);
            triggeringCards.add(abilityContext.source);
        }

        return Array.from(triggeringCards);
    }

    private promptForResolvePlayerOrder() {
        const activePlayer = this.game.getActivePlayer();
        this.game.promptWithHandlerMenu(activePlayer, {
            activePromptTitle: 'Both players have triggered abilities in response. Choose a player to resolve all of their abilities first:',
            waitingPromptTitle: 'Waiting for opponent to choose a player to resolve their triggers first',
            choices: ['You', 'Opponent'],
            handlers: [
                () => {
                    this.resolvePlayerOrder = [activePlayer, activePlayer.opponent];
                    this.promptUnresolvedAbilities();
                },
                () => {
                    this.resolvePlayerOrder = [activePlayer.opponent, activePlayer];
                    this.promptUnresolvedAbilities();
                }
            ]
        });
    }

    protected cleanUpTriggers() {
        // remove any triggered abilities from cancelled events
        // this is necessary because we trigger abilities before any events in the window are executed, so if any were cancelled at execution time we need to clean up
        const preCleanupTriggers: [Player, TriggeredAbilityContext<Card>[]][] = [...this.unresolved];
        this.unresolved = new Map<Player, TriggeredAbilityContext[]>();

        for (const [player, triggeredAbilities] of preCleanupTriggers) {
            const cleanedAbilities = this.triggerAbilityType === AbilityType.Triggered
                ? triggeredAbilities.filter((context) => context.event.isResolved)
                : this.triggerAbilityType === AbilityType.ReplacementEffect
                    ? triggeredAbilities.filter((context) => context.event.canResolve)
                    : Contract.fail(`Unexpected trigger ability type ${this.triggerAbilityType}`);

            if (cleanedAbilities.length > 0) {
                this.unresolved.set(player, cleanedAbilities);
            }
        }

        if (this.unresolved.size === 0) {
            return;
        }

        const anyWithLegalTargets = this.canAnyAbilitiesResolve(
            [...this.unresolved].map(([player, triggeredAbilityList]) => triggeredAbilityList).flat()
        );

        if (!anyWithLegalTargets) {
            this.unresolved = new Map();
            return;
        }
    }

    private canAnyAbilitiesResolve(triggeredAbilities: TriggeredAbilityContext[]) {
        return triggeredAbilities?.some((triggeredAbilityContext) => triggeredAbilityContext.ability.hasAnyLegalEffects(triggeredAbilityContext, SubStepCheck.All));
    }

    public abstract override toString(): string;
}
