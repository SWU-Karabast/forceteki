import { AbilityContext } from '../core/ability/AbilityContext';
import { BaseCard } from '../core/card/BaseCard';
import { GameEvent } from '../core/event/GameEvent';
import { CardTargetSystem, ICardTargetSystemProperties } from '../core/gameSystem/CardTargetSystem';
import Player from '../core/Player';
import * as Helpers from '../core/utils/Helpers';

// TODO: Need some future work to fully implement Thrawn
export interface IViewCardProperties extends ICardTargetSystemProperties {
    viewType: ViewCardMode;
    sendChatMessage?: boolean;
    message?: string | ((context) => string);
    messageArgs?: (cards: any) => any[];

    /** The player who is viewing or revealing the card. */
    player?: Player;
}

export enum ViewCardMode {

    /** A player looks at card(s) */
    LookAt = 'lookAt',

    /** A player reveals card(s) to all players */
    Reveal = 'reveal'
}

export abstract class ViewCardSystem<TContext extends AbilityContext = AbilityContext> extends CardTargetSystem<TContext, IViewCardProperties> {
    public override eventHandler(event, additionalProperties = {}): void {
        const context = event.context;
        const properties = this.generatePropertiesFromContext(context, additionalProperties);
        if (properties.sendChatMessage) {
            const messageArgs = this.getMessageArgs(event, context, additionalProperties);
            context.game.addMessage(this.getMessage(properties.message, context), ...messageArgs);
        }
    }

    public override queueGenerateEventGameSteps(events: GameEvent[], context: TContext, additionalProperties = {}): void {
        const { target } = this.generatePropertiesFromContext(context, additionalProperties);
        const cards = Helpers.asArray(target).filter((card) => this.canAffect(card, context));
        if (cards.length === 0) {
            return;
        }
        const event = this.createEvent(null, context, additionalProperties);
        this.updateEvent(event, cards, context, additionalProperties);
        events.push(event);
    }

    public override addPropertiesToEvent(event, cards, context: TContext, additionalProperties): void {
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

    public getMessage(message, context: TContext): string {
        if (typeof message === 'function') {
            return message(context);
        }
        return message;
    }

    public abstract getMessageArgs(event: any, context: TContext, additionalProperties);
}
