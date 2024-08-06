import { CardTypes, Locations, Phases } from '../../../Constants';
import type { ProvinceCard } from '../../../ProvinceCard';
import AbilityDsl from '../../../abilitydsl';
import DrawCard from '../../../drawcard';

export default class FortifiedLumberCamp extends DrawCard {
    static id = 'fortified-lumber-camp';

    setupCardAbilities() {
        this.action({
            title: 'Discard all cards in and attached to a province ',
            cost: AbilityDsl.costs.sacrificeSelf(),
            target: {
                location: Locations.Provinces,
                cardType: CardTypes.Province
            },
            gameAction: AbilityDsl.actions.multipleContext((context) => ({
                gameActions: [
                    AbilityDsl.actions.moveCard({
                        destination: Locations.DynastyDiscardPile,
                        target: this.#cardsInProvince(context.target)
                    }),
                    AbilityDsl.actions.discardFromPlay({ target: context.target.attachments })
                ]
            })),
            effect: 'discard {1}',
            effectArgs: (context) => [this.#cardsInProvince(context.target).concat(context.target.attachments)]
        });
    }

    #cardsInProvince(targetProvince: ProvinceCard) {
        return targetProvince.controller.getDynastyCardsInProvince(targetProvince.location);
    }
}