import Player from '../../Player';
import { Event } from '../../event/Event';
import EventWindow from '../../event/EventWindow';
import { AbilityType, WildcardLocation } from '../../Constants';
import Contract from '../../utils/Contract';
import { TriggeredAbilityContext } from '../../ability/TriggeredAbilityContext';
import TriggeredAbility from '../../ability/TriggeredAbility';
import Card from '../../card/Card';
import { TriggeredAbilityWindowTitle } from './TriggeredAbilityWindowTitle';
import { BaseStep } from '../BaseStep';
import { AbilityContext } from '../../ability/AbilityContext';

export class TriggeredAbilityWindow extends BaseStep {
    /** Triggered effects / abilities that have not yet been resolved, organized by owning player */
    protected unresolved = new Map<Player, TriggeredAbilityContext[]>();

    /** Already resolved effects / abilities */
    protected resolved: { ability: TriggeredAbilityContext, event: Event }[] = [];

    /** Chosen order of players to resolve in (SWU 6.10), null if not yet chosen */
    private resolvePlayerOrder?: Player[] = null;

    /** The events that were triggered as part of this window */
    private triggeringEvents: Event[];

    private eventWindow: EventWindow;
    private eventsToExclude: Event[];
    private eventsEmitted = false;
    private choosePlayerResolutionOrderComplete = false;

    // UP NEXT: go through and clean up files so that properties appear before ctor in files
    get currentlyResolvingPlayer(): Player | null {
        return this.resolvePlayerOrder?.[0] ?? null;
    }

    constructor(game, window, eventsToExclude = []) {
        super(game);
        this.eventWindow = window;
        this.eventsToExclude = eventsToExclude ?? [];
    }

    addToWindow(context: TriggeredAbilityContext) {
        this.assertWindowResolutionNotStarted('ability', context.source);

        if (!context.event.cancelled && context.ability) {
            if (!this.unresolved.has(context.player)) {
                this.unresolved.set(context.player, [context]);
            } else {
                this.unresolved.get(context.player).push(context);
            }
        }
    }

    override continue() {
        this.game.currentAbilityWindow = this;

        if (!this.eventsEmitted) {
            // emit events and then triggered abilities will be automatically added to this.unresolvedTriggeredAbilities via addToWindow
            this.emitEvents();

            // if no abilities trigged, continue with game flow
            if (this.unresolved.size === 0) {
                return true;
            }

            // if more than one player has triggered abilities, need to prompt for resolve order (SWU 6.10)
            if (this.unresolved.size > 1) {
                this.promptForResolvePlayerOrder();
                return false;
            }

            // if only one player, that player is automatically the resolving player
            this.resolvePlayerOrder = [this.unresolved.keys().next().value];
            this.choosePlayerResolutionOrderComplete = true;
        }

        if (!this.choosePlayerResolutionOrderComplete) {
            return false;
        }

        // prompt for any abilities not yet resolved, otherwise we're done
        if (this.promptUnresolvedAbilities()) {
            this.game.currentAbilityWindow = null;
            return true;
        }

        return false;
    }

    protected assertWindowResolutionNotStarted(triggerTypeName: string, source: Card) {
        if (!Contract.assertFalse(this.choosePlayerResolutionOrderComplete, `Attempting to add new triggered ${triggerTypeName} from source '${source.internalName}' to a window that has already started resolution`)) {
            return;
        }
    }

    private promptUnresolvedAbilities() {
        if (!Contract.assertNotNullLike(this.currentlyResolvingPlayer)) {
            return false;
        }

        this.choosePlayerResolutionOrderComplete = true;

        let abilitiesToResolve = this.unresolved.get(this.currentlyResolvingPlayer);
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

    protected resolveAbility(context: TriggeredAbilityContext) {
        const resolver = this.game.resolveAbility(context);
        this.game.queueSimpleStep(() => {
            if (resolver.passPriority) {
                this.postResolutionUpdate(resolver);
            }
        });
    }

    /** Get the set of yet-unresolved abilities for the player whose turn it is to do resolution */
    private getCurrentlyResolvingAbilities() {
        if (
            !Contract.assertNotNullLike(this.currentlyResolvingPlayer) ||
            !Contract.assertHasKey(this.unresolved, this.currentlyResolvingPlayer)
        ) {
            return null;
        }

        return this.unresolved.get(this.currentlyResolvingPlayer);
    }

    private promptForNextAbilityToResolve() {
        const abilitiesToResolve = this.getCurrentlyResolvingAbilities();
        const choices = abilitiesToResolve.map((context, index) => {
            return { text: (context.ability as TriggeredAbility).title, method: 'resolveAbility', arg: context };
        });

        this.game.promptWithHandlerMenu(this.currentlyResolvingPlayer, {
            activePromptTitle: 'Choose an ability to resolve:',
            source: 'Choose Triggered Ability Resolution Order',
            choices: choices
        });

        this.game.promptForSelect(this.currentlyResolvingPlayer, Object.assign(this.getPromptForSelectProperties(), {
            onSelect: (player, card) => {
                this.resolveAbility(abilitiesToResolve.find((context) => context.source === card));
                return true;
            }
        }));
    }

    protected getPromptForSelectProperties() {
        return Object.assign({ location: WildcardLocation.Any }, this.getPromptProperties());
    }

    private getPromptProperties() {
        return {
            source: 'Triggered Abilities',
            availableCards: this.getAbilityResolutionCards(),
            activePromptTitle: TriggeredAbilityWindowTitle.getTitle(this.triggeringEvents),
            waitingPromptTitle: 'Waiting for opponent'
        };
    }

    private postResolutionUpdate(resolver) {
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
            if (!Contract.assertNotNullLike(abilityContext.source)) {
                continue;
            }

            // TODO: fill out this implementation. see forcedtriggeredabilitywindow.js in the L5R code for reference
            if (triggeringCards.has(abilityContext.source)) {
                throw Error(`The card ${abilityContext.source} has had multiple abilities triggered in the same event window (or one ability triggered multiple times). This is not yet implemented.`);
            }

            triggeringCards.add(abilityContext.source);
        }

        return Array.from(triggeringCards);
    }

    private promptForResolvePlayerOrder() {
        this.game.promptWithHandlerMenu(this.game.actionPhaseActivePlayer, {
            activePromptTitle: 'Both players have triggered abilities in response. Choose a player to resolve all of their abilities first:',
            source: 'Choose Triggered Ability Resolution Order',
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

    private emitEvents() {
        this.eventsEmitted = true;

        const events = this.eventWindow.events.filter((event) => !this.eventsToExclude.includes(event));
        events.forEach((event) => {
            this.game.emit(event.name + ':' + AbilityType.TriggeredAbility, event, this);
        });
        this.game.emit('aggregateEvent:' + AbilityType.TriggeredAbility, events, this);

        this.triggeringEvents = events;
    }
}