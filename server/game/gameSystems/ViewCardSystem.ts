import type { AbilityContext } from '../core/ability/AbilityContext';
import type { GameEvent } from '../core/event/GameEvent';
import type { ICardTargetSystemProperties } from '../core/gameSystem/CardTargetSystem';
import { CardTargetSystem } from '../core/gameSystem/CardTargetSystem';
import type Player from '../core/Player';
import * as Helpers from '../core/utils/Helpers';

// TODO: Need some future work to fully implement Thrawn
export interface IViewCardProperties extends ICardTargetSystemProperties {
    message?: string | ((context) => string);
    messageArgs?: (cards: any) => any[];

    /** The player who is viewing or revealing the card. */
    player?: Player;

    /** Temporary parameter while we are migrating everything to the new display prompt */
    useDisplayPrompt?: boolean;

    /** If we want to display text under any cards, map their uuid(s) to the title text here */
    displayTextByCardUuid?: Map<string, string>;
}

export abstract class ViewCardSystem<TContext extends AbilityContext = AbilityContext, TProperties extends IViewCardProperties = IViewCardProperties> extends CardTargetSystem<TContext, TProperties> {
    protected override defaultProperties: IViewCardProperties = {
        useDisplayPrompt: false
    };

    public override eventHandler(event, _additionalProperties = {}): void {
        const context = event.context;
        context.game.addMessage(this.getMessage(event.message, context), ...event.messageArgs);

        if (event.useDisplayPrompt) {
            context.game.promptDisplayCardsBasic(event.promptedPlayer, {
                displayCards: event.cards,
                source: context.source,
                displayTextByCardUuid: event.displayTextByCardUuid
            });
        }
    }

    protected abstract getChatMessage(properties: IViewCardProperties): string | null;
    protected abstract getPromptedPlayer(properties: IViewCardProperties, context: TContext): Player;

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
        event.promptedPlayer = this.getPromptedPlayer(properties, context);
        event.message = this.getChatMessage(properties);
        event.messageArgs = this.getMessageArgs(event, context, additionalProperties);
        event.useDisplayPrompt = properties.useDisplayPrompt;
        event.displayTextByCardUuid = properties.displayTextByCardUuid;
    }

    public getMessage(message, context: TContext): string {
        if (typeof message === 'function') {
            return message(context);
        }
        return message;
    }

    public abstract getMessageArgs(event: any, context: TContext, additionalProperties);
}
