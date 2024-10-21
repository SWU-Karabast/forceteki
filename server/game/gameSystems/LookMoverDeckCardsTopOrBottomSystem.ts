import type { AbilityContext } from '../core/ability/AbilityContext';
import type { Card } from '../core/card/Card';
import { CardTargetSystem, type ICardTargetSystemProperties } from '../core/gameSystem/CardTargetSystem';
import { GameEvent } from '../core/event/GameEvent';
import { Location } from '../core/Constants';
import { lookAt, moveCard } from './GameSystemLibrary';

export interface ILookMoveDeckCardsTopOrBottomProperties extends ICardTargetSystemProperties {
    amount: number;
}

export class LookMoveDeckCardsTopOrBottomSystem<TContext extends AbilityContext = AbilityContext> extends CardTargetSystem<TContext, ILookMoveDeckCardsTopOrBottomProperties> {
    public override readonly name = 'LookMoveDeckCardsTopOrBottomSystem';

    protected override defaultProperties: ILookMoveDeckCardsTopOrBottomProperties = {
        amount: 1,
    };

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    public override eventHandler(event): void { }

    public override queueGenerateEventGameSteps(events: GameEvent[], context: TContext): void {
        const player = context.player;
        const { amount } = this.generatePropertiesFromContext(context);
        const deckLength = player.drawDeck.length;
        if (deckLength === 1) {
            events.push(lookAt({
                target: player.drawDeck[0],
                sendChatMessage: true,
            }).generateEvent(context.target, context));
        } else {
            const actual_amount = amount > deckLength ? deckLength : amount;
            let cards = player.drawDeck.slice(0, actual_amount);

            // @ts-ignore
            const choiceHandler = (player) => {
                if (cards.length > 0) {
                    context.game.promptWithHandlerMenu(player, {
                        activePromptTitle: 'Select card to move to the top or bottom of the deck',
                        choices: cards.map((card: Card) => [
                            'Put ' + card.internalName + ' on top',
                            'Put ' + card.internalName + ' to bottom',
                        ]).flat(),
                        handlers: cards.map((card: Card) => [(() => {
                            events.push(moveCard({
                                target: card,
                                bottom: false,
                                destination: Location.Deck
                            }).generateEvent(context.target, context));
                            // get rid of the card from cards
                            cards = cards.filter((a) => a !== card);
                            choiceHandler(context.player);
                        }),
                        (() => {
                            events.push(moveCard({
                                target: card,
                                bottom: true,
                                destination: Location.Deck
                            }).generateEvent(context.target, context));
                            // get rid of the card from cards
                            cards = cards.filter((a) => a !== card);
                            choiceHandler(context.player);
                        })]).flat()
                    });
                } else {
                    return true;
                }
            };

            choiceHandler(context.player);
        }
    }

    public override getEffectMessage(context: TContext): [string, any[]] {
        const properties = this.generatePropertiesFromContext(context);
        const message =
            properties.amount > 0
                ? `look at the top ${properties.amount === 1 ? 'card' : `${properties.amount} cards`} of your deck. ${properties.amount === 1 ? 'You may put it on the bottom of your deck' : 'Put any number of them on the bottom of your deck and the rest on top in any order'}` : '';
        return [message, []];
    }
}