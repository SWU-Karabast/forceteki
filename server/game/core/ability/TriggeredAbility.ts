import CardAbility from './CardAbility';
import { TriggeredAbilityContext } from './TriggeredAbilityContext';
import { Stage, CardType, EffectName, AbilityType } from '../Constants';
import { ITriggeredAbilityProps, ITriggeredAbilityWhenProps, WhenType } from '../../Interfaces';
import { Event } from '../event/Event';
import Card from '../card/Card';
import Game from '../Game';
import { TriggeredAbilityWindow } from '../gameSteps/abilityWindow/TriggeredAbilityWindow';
import Contract from '../utils/Contract';

interface IEventRegistration {
    name: string;
    handler: (event: Event, window: TriggeredAbilityWindow) => void;
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
 *           choice, use the choices sub object instead.
 * limit   - optional AbilityLimit object that represents the max number of uses
 *           for the reaction as well as when it resets.
 * location - string or array of strings indicating the location the card should
 *            be in in order to activate the reaction. Defaults to 'play area'.
 */

export default class TriggeredAbility extends CardAbility {
    when?: WhenType;
    aggregateWhen?: (events: Event[], context: TriggeredAbilityContext) => boolean;
    anyPlayer: boolean;
    collectiveTrigger: boolean;
    eventRegistrations?: IEventRegistration[];

    constructor(game: Game, card: Card, properties: ITriggeredAbilityProps) {
        super(game, card, properties, AbilityType.TriggeredAbility);

        if ('when' in properties) {
            this.when = properties.when;
        } else if ('aggregateWhen' in properties) {
            this.aggregateWhen = properties.aggregateWhen;
        }
        this.anyPlayer = !!properties.anyPlayer;
        this.collectiveTrigger = !!properties.collectiveTrigger;
    }

    override meetsRequirements(context, ignoredRequirements = []) {
        const canOpponentTrigger =
            this.card.anyEffect(EffectName.CanBeTriggeredByOpponent) &&
            this.abilityType !== AbilityType.ForcedReaction;
        const canPlayerTrigger = this.anyPlayer || context.player === this.card.controller || canOpponentTrigger;

        if (!ignoredRequirements.includes('player') && !canPlayerTrigger) {
            if (
                this.card.type !== CardType.Event ||
                !context.player.isCardInPlayableLocation(this.card, context.playType)
            ) {
                return 'player';
            }
        }

        return super.meetsRequirements(context, ignoredRequirements);
    }

    eventHandler(event, window) {
        if (!Contract.assertNotNullLike(window)) {
            return;
        }

        for (const player of this.game.getPlayers()) {
            const context = this.createContext(player, event);
            //console.log(event.name, this.card.name, this.isTriggeredByEvent(event, context), this.meetsRequirements(context));
            if (
                this.card.triggeredAbilities.includes(this) &&
                this.isTriggeredByEvent(event, context) &&
                this.meetsRequirements(context) === ''
            ) {
                window.addToWindow(context);
            }
        }
    }

    private checkAggregateWhen(events, window) {
        for (const player of this.game.getPlayers()) {
            const context = this.createContext(player, events);
            //console.log(events.map(event => event.name), this.card.name, this.aggregateWhen(events, context), this.meetsRequirements(context));
            if (
                this.card.triggeredAbilities.includes(this) &&
                this.aggregateWhen(events, context) &&
                this.meetsRequirements(context) === ''
            ) {
                window.addToWindow(context);
            }
        }
    }

    override createContext(player = this.card.controller, event: Event) {
        return new TriggeredAbilityContext({
            event: event,
            game: this.game,
            source: this.card,
            player: player,
            ability: this,
            stage: Stage.PreTarget
        });
    }

    isTriggeredByEvent(event, context) {
        const listener = this.when[event.name];

        return listener && listener(event, context);
    }

    registerEvents() {
        if (this.eventRegistrations) {
            return;
        } else if (this.aggregateWhen) {
            const event = {
                name: 'aggregateEvent:' + this.abilityType,
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
                name: eventName + ':' + this.abilityType,
                handler: (event, window) => this.eventHandler(event, window)
            };
            this.game.on(event.name, event.handler);
            this.eventRegistrations.push(event);
        });
    }

    unregisterEvents() {
        if (this.eventRegistrations) {
            this.eventRegistrations.forEach((event) => {
                this.game.removeListener(event.name, event.handler);
            });
            this.eventRegistrations = null;
        }
    }
}
