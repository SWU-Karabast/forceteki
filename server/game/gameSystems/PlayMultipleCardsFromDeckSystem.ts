import type { IGameSystemInput } from '../core/gameSystem/GameSystem';
import type { AbilityContext } from '../core/ability/AbilityContext.js';
import type { Card } from '../core/card/Card.js';
import type { CardType, WildcardCardType } from '../core/Constants.js';
import { PlayType } from '../core/Constants.js';
import { CostAdjustType } from '../core/cost/CostAdjuster.js';
import type { IDisplayCardsSelectProperties } from '../core/gameSteps/PromptInterfaces.js';
import { PlayCardSystem } from './PlayCardSystem.js';
import { type ISearchDeckProperties, SearchDeckSystem } from './SearchDeckSystem.js';
import type { GameSystem } from '../core/gameSystem/GameSystem';

export interface IPlayMultipleCardsFromDeckProperties<TContext extends AbilityContext = AbilityContext>
    extends Omit<ISearchDeckProperties<TContext>,
      | 'revealSelected'
      | 'selectedCardsImmediateEffect'
      | 'selectedCardsHandler'
      | 'remainingCardsHandler'> {
    multiSelectCondition?: (card: Card, currentlySelectedCards: Card[], context: TContext) => boolean;
    playAsType?: WildcardCardType.Upgrade | WildcardCardType.Unit | CardType.Event;

    /**
     * Effect(s) resolved for each played units as they enter play, before any triggers and before subsequent units enter play
     * See {@link IPutIntoPlayProperties.enterPlayEffect}.
     */
    playedCardEnterPlayEffect?: GameSystem | GameSystem[];
}

export class PlayMultipleCardsFromDeckSystem<TContext extends AbilityContext = AbilityContext> extends SearchDeckSystem<TContext, IPlayMultipleCardsFromDeckProperties<TContext>> {
    protected override prepareProperties(context: TContext, properties: IPlayMultipleCardsFromDeckProperties<TContext>): void {
        super.prepareProperties(context, properties);

        const selectedCardsImmediateEffect = new PlayCardSystem({
            playType: PlayType.PlayFromOutOfPlay,
            nested: true,
            adjustCost: {
                costAdjustType: CostAdjustType.Free
            },
            playAsType: properties.playAsType,
            enterPlayEffect: properties.playedCardEnterPlayEffect,
        });

        Object.assign(properties, { selectedCardsImmediateEffect });
    }

    protected override buildPromptProperties(
        cards: Card[],
        properties: IPlayMultipleCardsFromDeckProperties<TContext>,
        context: TContext,
        title: string,
        selectAmount: number,
        event: any,
        additionalProperties: Partial<IGameSystemInput<IPlayMultipleCardsFromDeckProperties<TContext>>>
    ): IDisplayCardsSelectProperties | null {
        return {
            ...super.buildPromptProperties(cards, properties, context, title, selectAmount, event, additionalProperties),
            multiSelectCondition: (card: Card, currentlySelectedCards: Card[]) =>
                properties.multiSelectCondition(card, currentlySelectedCards, context),
            showSelectionOrder: true,
            selectedCardsButtonText: 'Play cards in selection order',
        };
    }
}
