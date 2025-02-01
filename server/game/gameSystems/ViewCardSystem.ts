import type { AbilityContext } from '../core/ability/AbilityContext';
import type { GameEvent } from '../core/event/GameEvent';
import type { ICardTargetSystemProperties } from '../core/gameSystem/CardTargetSystem';
import { CardTargetSystem } from '../core/gameSystem/CardTargetSystem';
import type Player from '../core/Player';
import * as Helpers from '../core/utils/Helpers';

// TODO: Need some future work to fully implement Thrawn
export interface IViewCardProperties extends ICardTargetSystemProperties {
    viewType: ViewCardMode;
    message?: string | ((context) => string);
    messageArgs?: (cards: any) => any[];

    /** The player who is viewing or revealing the card. */
    player?: Player;

    /** Temporary parameter while we are migrating everything to the new display prompt */
    useDisplayPrompt?: boolean;
}

export enum ViewCardMode {

    /** A player looks at card(s) */
    LookAt = 'lookAt',

    /** A player reveals card(s) to all players */
    Reveal = 'reveal'
}

export abstract class ViewCardSystem<TContext extends AbilityContext = AbilityContext> extends CardTargetSystem<TContext, IViewCardProperties> {
    protected override defaultProperties: IViewCardProperties = {
        useDisplayPrompt: false,
        viewType: null
    };

    public override eventHandler(event, _additionalProperties = {}): void {
        const context = event.context;
        if (event.sendChatMessage) {
            context.game.addMessage(this.getMessage(event.message, context), ...event.messageArgs);
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
        super.addPropertiesToEvent(event, cards, context, additionalProperties);
        const properties = this.generatePropertiesFromContext(context, additionalProperties);

        if (!cards) {
            cards = properties.target;
        }
        if (!Array.isArray(cards)) {
            cards = [cards];
        }

        event.cards = cards;
        event.sendChatMessage = !properties.useDisplayPrompt || properties.viewType === ViewCardMode.Reveal;
        event.message = properties.message;
        event.messageArgs = this.getMessageArgs(event, context, additionalProperties);
    }

    public getMessage(message, context: TContext): string {
        if (typeof message === 'function') {
            return message(context);
        }
        return message;
    }

    public abstract getMessageArgs(event: any, context: TContext, additionalProperties);
}
