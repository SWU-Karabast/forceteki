import type { AbilityContext } from '../core/ability/AbilityContext';
import type { Card } from '../core/card/Card';
import { CardType, Location, WildcardCardType } from '../core/Constants';
import { CardTargetSystem, type ICardTargetSystemProperties } from '../core/gameSystem/CardTargetSystem';
import { GameEvent } from '../core/event/GameEvent';
import { moveCard } from './GameSystemLibrary';

export interface IScryProperties extends ICardTargetSystemProperties {
    amount: number;
}

export class ScrySystem<TContext extends AbilityContext = AbilityContext> extends CardTargetSystem<TContext, IScryProperties> {
    public override readonly name = 'scry';
    public override targetTypeFilter = [WildcardCardType.Unit, WildcardCardType.Upgrade, CardType.Event];

    protected override defaultProperties: IScryProperties = {
        amount: 1,
    };

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    public override eventHandler(event): void { }

    public override queueGenerateEventGameSteps(events: GameEvent[], context: TContext): void {
        const player = context.player;
        const { amount } = this.generatePropertiesFromContext(context) as IScryProperties;
        const deckLength = player.drawDeck.length;
        const actual_amount = amount === -1 ? deckLength : (amount > deckLength ? deckLength : amount);
        const cards = player.drawDeck.slice(0, actual_amount);
        let decision_mapper = cards.map((card: Card) => [
            card.internalName + '-top',
            card.internalName + '-bottom',
        ]).reduce((acc, val) => acc.concat(val), []);

        // @ts-ignore
        const cardHandler = (player, card) => {
            decision_mapper = decision_mapper.filter((a) => a !== card + '-top' && a !== card + '-bottom');
            if (decision_mapper.length > 0) {
                context.game.promptWithHandlerMenu(player, {
                    activePromptTitle: 'Select card to move to the top or bottom of the deck',
                    context: context,
                    choices: decision_mapper,
                    choiceHandler: (choice) => {
                        // we get the card position and card name position is either (top or bottom)
                        const position = choice.split('-')[choice.split('-').length - 1];
                        const card_name = choice.split('-' + position)[0];
                        const actual_card = cards.filter((a) => a.internalName === card_name)[0];
                        if (position === 'bottom') {
                            events.push(moveCard({ target: actual_card, bottom: true, destination: Location.Deck }).generateEvent(context.target, context));
                        } else {
                            events.push(moveCard({ target: actual_card, bottom: false, destination: Location.Deck }).generateEvent(context.target, context));
                        }
                        cardHandler(context.player, card_name);
                    }
                });
            } else {
                return true;
            }
        };
        context.game.promptWithHandlerMenu(player, {
            activePromptTitle: 'Select card to move to the top or bottom of the deck',
            context: context,
            choices: decision_mapper,
            choiceHandler: (choice) => {
                const position = choice.split('-')[choice.split('-').length - 1];
                const card_name = choice.split('-' + position)[0];
                const actual_card = cards.filter((a) => a.internalName === card_name)[0];
                if (position === 'bottom') {
                    events.push(moveCard({ target: actual_card, bottom: true, destination: Location.Deck }).generateEvent(context.target, context));
                } else {
                    events.push(moveCard({ target: actual_card, bottom: false, destination: Location.Deck }).generateEvent(context.target, context));
                }
                cardHandler(context.player, card_name);
            }
        });
    }

    public override getEffectMessage(context: TContext): [string, any[]] {
        const properties = this.generatePropertiesFromContext(context);
        const message =
            properties.amount > 0
                ? `look at the top ${properties.amount === 1 ? 'card' : `${properties.amount} cards`} of your deck. ${properties.amount === 1 ? 'You may put it on the bottom of your deck' : 'Put any number of them on the bottom of your deck and the rest on top in any order'}` : '';
        return [message, []];
    }
}