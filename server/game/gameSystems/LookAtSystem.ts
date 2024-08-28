import { AbilityContext } from '../core/ability/AbilityContext';
import { BaseCard } from '../core/card/BaseCard';
import { EventName } from '../core/Constants';
import { GameEvent } from '../core/event/GameEvent';
import { IPlayerTargetSystemProperties, PlayerTargetSystem } from '../core/gameSystem/PlayerTargetSystem';


export interface ILookAtProperties extends IPlayerTargetSystemProperties {
    message?: string | ((context) => string);
    messageArgs?: (cards: any) => any[];
}

export class LookAtSystem extends PlayerTargetSystem<ILookAtProperties> {
    public override readonly name = 'lookAt';
    public override readonly eventName = EventName.OnLookAtCards;
    public override readonly effectDescription = 'look at a facedown card';

    protected override defaultProperties: ILookAtProperties = {
        message: '{0} sees {1}'
    };

    public override canAffect(card: BaseCard, context: AbilityContext) {
        // TODO: What situations would mean that an event cannot be looked at?
        // if (!card.isFacedown() && (card.isInProvince() || card.location === Locations.PlayArea)) {
        //     return false;
        // }
        return super.canAffect(card, context);
    }

    public override generateEventsForAllTargets(context: AbilityContext, additionalProperties = {}): GameEvent[] {
        const events: GameEvent[] = [];

        const { target } = this.generatePropertiesFromContext(context, additionalProperties);
        const cards = (target as BaseCard[]).filter((card) => this.canAffect(card, context));
        if (cards.length === 0) {
            return;
        }
        const event = this.createEvent(null, context, additionalProperties);
        this.updateEvent(event, cards, context, additionalProperties);
        events.push(event);

        return events;
    }

    public override addPropertiesToEvent(event, cards, context: AbilityContext, additionalProperties): void {
        if (!cards) {
            cards = this.generatePropertiesFromContext(context, additionalProperties).target;
        }
        if (!Array.isArray(cards)) {
            cards = [cards];
        }
        event.cards = cards;
        const obj = { a: cards, b: context };
        event.stateBeforeResolution = cards.map((a) => {
            return { card: a, location: a.location };
        });
        event.context = context;
    }

    public eventHandler(event, additionalProperties = {}): void {
        const context = event.context;
        const properties = this.generatePropertiesFromContext(context, additionalProperties) as ILookAtProperties;
        const messageArgs = properties.messageArgs ? properties.messageArgs(event.cards) : [context.source, event.cards];
        context.game.addMessage(this.getMessage(properties.message, context), ...messageArgs);
    }

    public getMessage(message, context): string {
        if (typeof message === 'function') {
            return message(context);
        }
        return message;
    }

    public override isEventFullyResolved(event): boolean {
        return !event.cancelled && event.name === this.eventName;
    }

    public override checkEventCondition(): boolean {
        return true;
    }
}
