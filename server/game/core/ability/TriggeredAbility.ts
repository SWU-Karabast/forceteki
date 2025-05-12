import type { ICardAbilityState } from './CardAbility';
import { CardAbility } from './CardAbility';
import { TriggeredAbilityContext } from './TriggeredAbilityContext';
import { EventName, PlayType, StandardTriggeredAbilityType } from '../Constants';
import { AbilityType, GameStateChangeRequired, RelativePlayer, Stage } from '../Constants';
import type { ITriggeredAbilityProps, WhenType, WhenTypeOrStandard } from '../../Interfaces';
import type { GameEvent } from '../event/GameEvent';
import type { Card } from '../card/Card';
import type Game from '../Game';
import type { TriggeredAbilityWindow } from '../gameSteps/abilityWindow/TriggeredAbilityWindow';
import * as Contract from '../utils/Contract';
import type { ITriggeredAbilityTargetResolver } from '../../TargetInterfaces';
import type { ICardWithTriggeredAbilities } from '../card/propertyMixins/TriggeredAbilityRegistration';

interface IEventRegistration {
    name: string;
    handler: (event: GameEvent, window: TriggeredAbilityWindow) => void;
}

export interface ITriggeredAbillityState extends ICardAbilityState {
    isRegistered: boolean;
}

/**
 * Represents a reaction ability provided by card text.
 *
 * Properties:
 * when    - object whose keys are event names to listen to for the reaction and
 *           whose values are functions that return a boolean about whether to
 *           trigger the reaction when that event is fired. For example, to
 *           trigger only at the end of the challenge phase, you would do:
 *           when: {
 *               onPhaseEnded: event => event.phase === 'conflict'
 *           }
 *           Multiple events may be specified for cards that have multiple
 *           possible triggers for the same reaction.
 * title   - string which is displayed to the player to reference this ability
 * cost    - object or array of objects representing the cost required to be
 *           paid before the action will activate. See Costs.
 * target  - object giving properties for the target API
 * handler - function that will be executed if the player chooses 'Yes' when
 *           asked to trigger the reaction. If the reaction has more than one
 *           choice, use the choices sub object instead. Defaults to
 *           {@link CardAbilityStep.executeGameActions}
 * limit   - optional AbilityLimit object that represents the max number of uses
 *           for the reaction as well as when it resets.
 * zone - string or array of strings indicating the zone the card should
 *            be in order to activate the reaction. Defaults to 'play area'.
 */

export default class TriggeredAbility extends CardAbility<ITriggeredAbillityState> {
    public readonly when?: WhenType;
    public readonly aggregateWhen?: (events: GameEvent[], context: TriggeredAbilityContext) => boolean;
    public readonly anyPlayer: boolean;
    public readonly isBounty: boolean = false;
    public readonly collectiveTrigger: boolean;
    public readonly standardTriggerTypes: StandardTriggeredAbilityType[] = [];

    protected eventRegistrations?: IEventRegistration[];
    protected eventsTriggeredFor: GameEvent[] = [];

    private readonly mustChangeGameState: GameStateChangeRequired;

    public get isOnAttackAbility() {
        return this.standardTriggerTypes.includes(StandardTriggeredAbilityType.OnAttack);
    }

    public get isWhenDefeated() {
        return this.standardTriggerTypes.includes(StandardTriggeredAbilityType.WhenDefeated);
    }

    public get isWhenPlayed() {
        return this.standardTriggerTypes.some((trigger) =>
            trigger === StandardTriggeredAbilityType.WhenPlayed ||
            trigger === StandardTriggeredAbilityType.WhenPlayedUsingSmuggle
        );
    }

    public get isWhenPlayedUsingSmuggle() {
        return this.standardTriggerTypes.includes(StandardTriggeredAbilityType.WhenPlayedUsingSmuggle);
    }

    public constructor(
        game: Game,
        card: Card,
        properties: ITriggeredAbilityProps,
        abilityType: AbilityType = AbilityType.Triggered
    ) {
        super(game, card, properties, abilityType);

        if (!card.canRegisterTriggeredAbilities()) {
            throw Error(`Card '${card.internalName}' cannot have triggered abilities`);
        }

        if ('when' in properties) {
            const { when, standardTriggerTypes } = this.parseStandardTriggerTypes(properties.when);
            this.when = when;
            this.standardTriggerTypes = standardTriggerTypes;
        } else if ('aggregateWhen' in properties) {
            this.aggregateWhen = properties.aggregateWhen;
        }

        this.collectiveTrigger = !!properties.collectiveTrigger;

        this.mustChangeGameState = !!this.properties.ifYouDo || !!this.properties.ifYouDoNot
            ? GameStateChangeRequired.MustFullyResolve
            : GameStateChangeRequired.MustFullyOrPartiallyResolve;
    }

    protected override setupDefaultState(): void {
        this.state.isRegistered = false;
    }

    public eventHandler(event, window) {
        Contract.assertNotNullLike(window);
        Contract.assertTrue(this.card.canRegisterTriggeredAbilities());

        // IMPORTANT: the below code is referenced in the debugging guide (docs/debugging-guide.md). If you make changes here, make sure to update that document as well.
        for (const player of this.game.getPlayers()) {
            const context = this.createContext(player, event);
            if (
                this.card.getTriggeredAbilities().includes(this) &&
                this.isTriggeredByEvent(event, context) &&
                this.meetsRequirements(context) === '' &&
                !this.eventsTriggeredFor.includes(event)
            ) {
                this.eventsTriggeredFor.push(event);
                window.addTriggeredAbilityToWindow(context);
            }
        }
    }

    private parseStandardTriggerTypes(when: WhenTypeOrStandard): {
        when: WhenType;
        standardTriggerTypes: StandardTriggeredAbilityType[];
    } {
        const updatedWhen: WhenType = {};
        const standardTriggerTypes = [];

        for (const [trigger, value] of Object.entries(when)) {
            if (typeof value === 'boolean') {
                switch (trigger) {
                    case StandardTriggeredAbilityType.WhenDefeated:
                        updatedWhen[EventName.OnCardDefeated] = (event, context) => event.card === context.source;
                        break;
                    case StandardTriggeredAbilityType.OnAttack:
                        updatedWhen[EventName.OnAttackDeclared] = (event, context) => event.attack.attacker === context.source;
                        break;
                    case StandardTriggeredAbilityType.WhenPlayed:
                        updatedWhen[EventName.OnCardPlayed] = (event, context) => event.card === context.source;
                        break;
                    case StandardTriggeredAbilityType.WhenPlayedUsingSmuggle:
                        updatedWhen[EventName.OnCardPlayed] = (event, context) => event.card === context.source && event.playType === PlayType.Smuggle;
                        break;
                    default:
                        Contract.fail(`Unexpected standard trigger type: ${trigger}`);
                }

                standardTriggerTypes.push(trigger);
            } else {
                updatedWhen[trigger] = value;
            }
        }

        return { when: updatedWhen, standardTriggerTypes };
    }

    protected override controllerMeetsRequirements(context): boolean {
        let controller = context.source.controller;

        // If the event's card is the source of the ability, use the last known controller of the card instead of the source's controller.
        // This is because when resolving triggered abilities like "when defeated", the defeated card is in the discard pile already
        // and it might have changed controller.
        if (context.event.card === context.source && context.event.lastKnownInformation) {
            controller = context.event.lastKnownInformation.controller;
        } else if ('newController' in context.event) {
            controller = context.event.newController;
        }

        switch (this.canBeTriggeredBy) {
            case RelativePlayer.Self:
                return context.player === controller;
            case RelativePlayer.Opponent:
                return context.player === controller.opponent;
            default:
                Contract.fail(`Unexpected value for relative player: ${this.canBeTriggeredBy}`);
        }
    }

    public override createContext(player = this.card.controller, event) {
        return new TriggeredAbilityContext({
            ...super.getContextProperties(player, event),
            event,
            stage: Stage.Trigger
        });
    }

    public override checkGameActionsForPotential(context) {
        return this.immediateEffect.hasLegalTarget(context, {}, this.mustChangeGameState);
    }

    public override buildTargetResolver(name: string, properties: ITriggeredAbilityTargetResolver) {
        const propsMustChangeGameState = { mustChangeGameState: this.mustChangeGameState, ...properties };

        return super.buildTargetResolver(name, propsMustChangeGameState);
    }

    public registerEvents() {
        if (this.eventRegistrations) {
            return;
        }

        // STATE TODO: aggregateWhen is readonly, which means we can reliably recreate the eventRegistrations array in this case.
        this.eventRegistrations = this.buildWhenEvents();

        this.eventRegistrations.forEach((event) => {
            this.game.on(event.name, event.handler);
        });
        this.state.isRegistered = true;
    }

    public unregisterEvents() {
        if (!this.eventRegistrations) {
            return;
        }

        // There is nothing unique about the event registration, as long as it's recorded as registered and supposed to be registered, we can keep it in place.
        this.eventRegistrations.forEach((event) => {
            this.game.removeListener(event.name, event.handler);
        });
        this.eventRegistrations = null;
        this.state.isRegistered = false;
    }

    private buildWhenEvents() {
        if (this.aggregateWhen) {
            const event = {
                name: 'aggregateEvent:' + this.type,
                handler: (events, window) => this.checkAggregateWhen(events, window)
            };
            return [event];
        }

        const eventNames = Object.keys(this.when);
        return eventNames.map((eventName) => {
            return {
                name: eventName + ':' + this.type,
                handler: (event, window) => this.eventHandler(event, window)
            };
        });
    }

    private isTriggeredByEvent(event, context) {
        const listener = this.when[event.name];

        return listener && listener(event, context);
    }

    // STATE TODO: When does this trigger get removed? Do we need to handle it here?
    private checkAggregateWhen(events, window) {
        for (const player of this.game.getPlayers()) {
            const context = this.createContext(player, events);
            if (
                (this.card as ICardWithTriggeredAbilities).getTriggeredAbilities().includes(this) &&
                this.aggregateWhen(events, context) &&
                this.meetsRequirements(context) === ''
            ) {
                window.addTriggeredAbilityToWindow(context);
            }
        }
    }

    protected override afterSetState(oldState: ITriggeredAbillityState): void {
        if (this.state.isRegistered !== oldState.isRegistered) {
            if (this.state.isRegistered) {
                this.registerEvents();
            } else {
                this.unregisterEvents();
            }
        }
    }
}
