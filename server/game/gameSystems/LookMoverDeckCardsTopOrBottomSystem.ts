import type { AbilityContext } from '../core/ability/AbilityContext';
import type { Card } from '../core/card/Card';
import { CardTargetSystem, type ICardTargetSystemProperties } from '../core/gameSystem/CardTargetSystem';
import { GameEvent } from '../core/event/GameEvent';
import { Location } from '../core/Constants';
import { LookAtSystem } from './LookAtSystem';
import { MoveCardSystem } from './MoveCardSystem';

export interface ILookMoveDeckCardsTopOrBottomProperties extends ICardTargetSystemProperties {
    amount: number;
}

export class LookMoveDeckCardsTopOrBottomSystem<TContext extends AbilityContext = AbilityContext> extends CardTargetSystem<TContext, ILookMoveDeckCardsTopOrBottomProperties> {
    public override readonly name = 'lookMoveDeckCardsTopOrBottomSystem';

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    public override eventHandler(event): void { }

    public override queueGenerateEventGameSteps(events: GameEvent[], context: TContext): void {
        const player = context.player;
        const { amount } = this.generatePropertiesFromContext(context);
        const deckLength = player.drawDeck.length;

        if (deckLength === 1) {
            const lookAtEvent = new LookAtSystem({
                target: player.drawDeck[0],
                sendChatMessage: true
            }).generateEvent(context.target, context);
            events.push(lookAtEvent);
        } else {
            const actualAmount = Math.min(amount, deckLength);
            const cards = player.drawDeck.slice(0, actualAmount);

            // Each card has two options to be put on top or on bottom for each option we have a handler whcih
            // recursively calls the function and removes handlers from the list until the card pool reaches 0.
            const choiceHandler = (player, cards: any[]) => {
                if (cards.length === 0) {
                    return;
                }
                // setup the choices for each card top and bottom
                const choices = cards.map((card: Card) => [
                    'Put ' + card.title + ' on top',
                    'Put ' + card.title + ' on bottom',
                ]).flat();

                context.game.promptWithHandlerMenu(player, {
                    activePromptTitle: 'Select card to move to the top or bottom of the deck',
                    choices,
                    handlers: cards.map((card: Card) => [
                        () => this.pushMoveEvent(false, card, cards, events, context, choiceHandler),
                        () => this.pushMoveEvent(true, card, cards, events, context, choiceHandler),
                    ]).flat()
                });
            };

            choiceHandler(context.player, cards);
        }
    }

    // Helper method for pushing the move card event into the events array.
    private pushMoveEvent(
        bottom: boolean,
        card: Card,
        cards: any[],
        events: GameEvent[],
        context: TContext,
        choiceHandler: (player: any, cards: any[]) => void
    ) {
        // create a new card event
        const moveCardEvent = new MoveCardSystem({
            target: card,
            bottom: bottom,
            destination: Location.Deck
        }).generateEvent(context.target, context);
        events.push(moveCardEvent);

        // get rid of the card from cards
        cards = cards.filter((a) => a !== card);
        choiceHandler(context.player, cards);
    }

    public override getEffectMessage(context: TContext): [string, any[]] {
        const properties = this.generatePropertiesFromContext(context);
        const message =
            properties.amount > 0
                ? `look at the top ${properties.amount === 1 ? 'card' : `${properties.amount} cards`} of your deck. 
                ${properties.amount === 1 ? 'You may put it on the bottom of your deck'
                    : 'Put any number of them on the bottom of your deck and the rest on top in any order'}` : '';
        return [message, []];
    }
}