import type Player from '../../Player';
import type { GameEvent } from '../../event/GameEvent';
import type { EventWindow } from '../../event/EventWindow';
import { AbilityType } from '../../Constants';
import * as Contract from '../../utils/Contract';
import type { TriggeredAbilityContext } from '../../ability/TriggeredAbilityContext';
import type TriggeredAbility from '../../ability/TriggeredAbility';
import type { Card } from '../../card/Card';
import { TriggeredAbilityWindowTitle } from './TriggeredAbilityWindowTitle';
import { BaseStep } from '../BaseStep';
import type Game from '../../Game';

export abstract class TriggerWindowBase extends BaseStep {
    /** Triggered effects / abilities that have not yet been resolved, organized by owning player */
    protected unresolved = new Map<Player, TriggeredAbilityContext[]>();

    /** Already resolved effects / abilities */
    protected resolved: { ability: TriggeredAbilityContext; event: GameEvent }[] = [];

    /** Chosen order of players to resolve in (SWU 7.6.10), null if not yet chosen */
    private resolvePlayerOrder?: Player[] = null;

    /** The events that were triggered as part of this window */
    protected triggeringEvents: GameEvent[] = [];

    protected choosePlayerResolutionOrderComplete = false;

    public get currentlyResolvingPlayer(): Player | null {
        return this.resolvePlayerOrder?.[0] ?? null;
    }

    public get triggeredAbilities(): TriggeredAbilityContext[] {
        return Array.from(this.unresolved.values()).flat();
    }

    public constructor(
        game: Game,
        protected readonly triggerAbilityType: AbilityType.Triggered | AbilityType.ReplacementEffect | AbilityType.DelayedEffect,
        private readonly eventWindow?: EventWindow
    ) {
        super(game);

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

    public emitEvents() {
        const events = this.triggeringEvents.filter((event) => !event.isCancelledOrReplaced);

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

    private promptUnresolvedAbilities() {
        Contract.assertNotNullLike(this.currentlyResolvingPlayer);

        this.choosePlayerResolutionOrderComplete = true;

        let abilitiesToResolve = this.unresolved.get(this.currentlyResolvingPlayer);

        // if none of the player's remaining abilities can resolve, skip to the next player
        if (!this.canAnyAbilitiesResolve(abilitiesToResolve)) {
            this.unresolved.set(this.currentlyResolvingPlayer, []);
            abilitiesToResolve = [];
        }

        if (abilitiesToResolve.length === 0) {
            // if the last resolving player is out of abilities to resolve, we're done
            if (this.resolvePlayerOrder.length === 1) {
                return true;
            }

            this.resolvePlayerOrder.shift();
            abilitiesToResolve = this.unresolved.get(this.currentlyResolvingPlayer);
        }

        // if there's more than one ability still unresolved, prompt for next selection
        if (abilitiesToResolve.length > 1) {
            this.promptForNextAbilityToResolve();
            return false;
        }

        this.resolveAbility(abilitiesToResolve[0]);
        return false;
    }

    /** Get the set of yet-unresolved abilities for the player whose turn it is to do resolution */
    private getCurrentlyResolvingAbilities() {
        Contract.assertNotNullLike(this.currentlyResolvingPlayer);
        Contract.assertHasKey(this.unresolved, this.currentlyResolvingPlayer);

        return this.unresolved.get(this.currentlyResolvingPlayer);
    }

    private promptForNextAbilityToResolve() {
        const abilitiesToResolve = this.getCurrentlyResolvingAbilities();

        // TODO: need to optionally show additional details in the ability options for more complex situations, e.g. same ability triggered multiple times in the same window.
        // (see forcedtriggeredabilitywindow.js in the L5R code for reference)
        const choices = abilitiesToResolve.map((context) => (context.ability as TriggeredAbility).title);
        const handlers = abilitiesToResolve.map((context) => () => this.resolveAbility(context));

        this.game.promptWithHandlerMenu(this.currentlyResolvingPlayer, {
            activePromptTitle: 'Choose an ability to resolve:',
            source: 'Choose Triggered Ability Resolution Order',
            choices: choices,
            handlers: handlers
        });

        // TODO: a variation of this was being used in the L5R code to choose which card to activate triggered abilities on.
        // not used now b/c we're doing a shortcut where we just present each ability text name, which doesn't work well in all cases sadly.

        // this.game.promptForSelect(this.currentlyResolvingPlayer, Object.assign(this.getPromptForSelectProperties(), {
        //     onSelect: (player, card) => {
        //         this.resolveAbility(abilitiesToResolve.find((context) => context.source === card));
        //         return true;
        //     }
        // }));
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

        const justResolvedAbility = unresolvedAbilitiesForPlayer.find((context) => context.ability === resolver.context.ability);

        // if we can't find the ability to remove from the list, we have to error or else get stuck in an infinite loop
        if (justResolvedAbility == null) {
            throw Error(`Could not find the resolved ability of card ${justResolvedAbility.source.internalName} in the list of unresolved abilities for player ${this.currentlyResolvingPlayer}`);
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
        this.game.promptWithHandlerMenu(this.game.actionPhaseActivePlayer, {
            activePromptTitle: 'Both players have triggered abilities in response. Choose a player to resolve all of their abilities first:',
            waitingPromptTitle: 'Waiting for opponent to choose a player to resolve their triggers first',
            choices: ['You', 'Opponent'],
            handlers: [
                () => {
                    this.resolvePlayerOrder = [this.game.actionPhaseActivePlayer, this.game.actionPhaseActivePlayer.opponent];
                    this.promptUnresolvedAbilities();
                },
                () => {
                    this.resolvePlayerOrder = [this.game.actionPhaseActivePlayer.opponent, this.game.actionPhaseActivePlayer];
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
        return triggeredAbilities?.some((triggeredAbilityContext) => triggeredAbilityContext.ability.hasAnyLegalEffects(triggeredAbilityContext, true));
    }

    public abstract override toString(): string;
}
