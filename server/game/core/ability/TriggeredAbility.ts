import { CardAbility } from './CardAbility';
import { TriggeredAbilityContext } from './TriggeredAbilityContext';
import { Stage, AbilityType, GameStateChangeRequired } from '../Constants';
import { ITriggeredAbilityProps, WhenType } from '../../Interfaces';
import { GameEvent } from '../event/GameEvent';
import { Card } from '../card/Card';
import Game from '../Game';
import { TriggeredAbilityWindow } from '../gameSteps/abilityWindow/TriggeredAbilityWindow';
import * as Contract from '../utils/Contract';
import { CardWithTriggeredAbilities } from '../card/CardTypes';
import { ITriggeredAbilityTargetResolver } from '../../TargetInterfaces';

interface IEventRegistration {
    name: string;
    handler: (event: GameEvent, window: TriggeredAbilityWindow) => void;
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
 * location - string or array of strings indicating the location the card should
 *            be in in order to activate the reaction. Defaults to 'play area'.
 */

export default class TriggeredAbility extends CardAbility {
    public when?: WhenType;
    public aggregateWhen?: (events: GameEvent[], context: TriggeredAbilityContext) => boolean;
    public anyPlayer: boolean;
    public collectiveTrigger: boolean;
    public eventRegistrations?: IEventRegistration[];
    public eventsTriggeredFor: GameEvent[] = [];

    private readonly mustChangeGameState: GameStateChangeRequired;

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
            this.when = properties.when;
        } else if ('aggregateWhen' in properties) {
            this.aggregateWhen = properties.aggregateWhen;
        }
        this.collectiveTrigger = !!properties.collectiveTrigger;

        this.mustChangeGameState = !!this.properties.ifYouDo || !!this.properties.ifYouDoNot
            ? GameStateChangeRequired.MustFullyResolve
            : GameStateChangeRequired.MustFullyOrPartiallyResolve;
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
                window.addToWindow(context);
            }
        }
    }

    public override createContext(player = this.card.controller, event: GameEvent) {
        return new TriggeredAbilityContext({
            event: event,
            game: this.game,
            source: this.card,
            player: player,
            ability: this,
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
        } else if (this.aggregateWhen) {
            const event = {
                name: 'aggregateEvent:' + this.type,
                handler: (events, window) => this.checkAggregateWhen(events, window)
            };
            this.eventRegistrations = [event];
            this.game.on(event.name, event.handler);
            return;
        }

        const eventNames = Object.keys(this.when);

        this.eventRegistrations = [];
        eventNames.forEach((eventName) => {
            const event = {
                name: eventName + ':' + this.type,
                handler: (event, window) => this.eventHandler(event, window)
            };
            this.game.on(event.name, event.handler);
            this.eventRegistrations.push(event);
        });
    }

    public unregisterEvents() {
        if (this.eventRegistrations) {
            this.eventRegistrations.forEach((event) => {
                this.game.removeListener(event.name, event.handler);
            });
            this.eventRegistrations = null;
        }
    }

    private isTriggeredByEvent(event, context) {
        const listener = this.when[event.name];

        return listener && listener(event, context);
    }

    private checkAggregateWhen(events, window) {
        for (const player of this.game.getPlayers()) {
            const context = this.createContext(player, events);
            if (
                (this.card as CardWithTriggeredAbilities).getTriggeredAbilities().includes(this) &&
                this.aggregateWhen(events, context) &&
                this.meetsRequirements(context) === ''
            ) {
                window.addToWindow(context);
            }
        }
    }
}
