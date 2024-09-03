import { AbilityContext } from '../core/ability/AbilityContext';
import { BaseCard } from '../core/card/BaseCard';
import { ViewCardType } from '../core/Constants';
import { GameEvent } from '../core/event/GameEvent';
import { CardTargetSystem, ICardTargetSystemProperties } from '../core/gameSystem/CardTargetSystem';
import Player from '../core/Player';

export interface IViewCardProperties extends ICardTargetSystemProperties {
    viewType: ViewCardType;
    sendChatMessage?: boolean;
    message?: string | ((context) => string);
    messageArgs?: (cards: any) => any[];

    /** The player who is viewing or revealing the card. */
    player?: Player;
}

export abstract class ViewCardSystem extends CardTargetSystem<IViewCardProperties> {
    public override eventHandler(event, additionalProperties = {}): void {
        const context = event.context;
        const properties = this.generatePropertiesFromContext(context, additionalProperties);
        if (properties.sendChatMessage) {
            context.game.addMessage(this.getMessage(properties.message, context), this.getMessageArgs(event, context, additionalProperties));
        }
    }

    public override canAffect(card: BaseCard, context: AbilityContext) {
        // TODO: What situations would mean that a card cannot be looked at?
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
            return [];
        }
        const event = this.createEvent(null, context, additionalProperties);
        this.updateEvent(event, cards, context, additionalProperties);
        events.push(event);

        return events;
    }

    public override addPropertiesToEvent(event, cards, context: AbilityContext, additionalProperties): void {
        const properties = this.generatePropertiesFromContext(context, additionalProperties);

        if (!cards) {
            cards = properties.target;
        }
        if (!Array.isArray(cards)) {
            cards = [cards];
        }
        event.cards = cards;
        event.context = context;
    }

    public getMessage(message, context: AbilityContext): string {
        if (typeof message === 'function') {
            return message(context);
        }
        return message;
    }

    public getMessageArgs(event: any, context: AbilityContext, additionalProperties) {
        const properties = this.generatePropertiesFromContext(context, additionalProperties);
        const messageArgs = properties.messageArgs ? properties.messageArgs(event.cards) : [context.source, event.cards];
        return messageArgs;
    }
}
