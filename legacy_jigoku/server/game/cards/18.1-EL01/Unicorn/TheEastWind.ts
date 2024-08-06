import { Locations } from '../../../Constants';
import { StrongholdCard } from '../../../StrongholdCard';
import AbilityDsl from '../../../abilitydsl';
import type BaseCard from '../../../basecard';

export default class TheEastWind extends StrongholdCard {
    static id = 'the-east-wind';

    setupCardAbilities() {
        this.reaction({
            title: 'Place fate on character',
            when: {
                onCardPlayed: (event, context) =>
                    event.player === context.player && (event.card.hasTrait('gaijin') || this.#isOutOfClan(event.card))
            },
            cost: AbilityDsl.costs.bowSelf(),
            gameAction: AbilityDsl.actions.deckSearch((context) => {
                const playedCardTraits = (context as any).event.card.getTraitSet();
                return {
                    amount: 5,
                    cardCondition: (card) => {
                        for (const searchedCardTrait of card.getTraits()) {
                            if (playedCardTraits.has(searchedCardTrait)) {
                                return true;
                            }
                        }
                        return false;
                    },
                    gameAction: AbilityDsl.actions.moveCard({ destination: Locations.Hand }),
                    takesNothingGameAction: AbilityDsl.actions.gainFate()
                };
            })
        });
    }

    #isOutOfClan(card: BaseCard): boolean {
        return !card.isFaction('neutral') && !card.isFaction('unicorn');
    }
}