import AbilityDsl from '../../../abilitydsl';
import { CardTypes, Locations, Players } from '../../../Constants';
import DrawCard from '../../../drawcard';
import type { ProvinceCard } from '../../../ProvinceCard';

export default class LayOfTheLand extends DrawCard {
    static id = 'lay-of-the-land';

    setupCardAbilities() {
        this.action({
            title: 'Reveal a province and discard status tokens',
            target: {
                activePromptTitle: 'Choose an unbroken province',
                cardType: CardTypes.Province,
                controller: Players.Any,
                location: Locations.Provinces,
                cardCondition: (card: ProvinceCard) => !card.isBroken && card.location !== Locations.StrongholdProvince,
                gameAction: [AbilityDsl.actions.reveal(), AbilityDsl.actions.turnFacedown()]
            },
            effect: '{1} {2}',
            effectArgs: ({ target }: { target: ProvinceCard }) =>
                target.isFaceup() ? ['flip facedown', target] : ['reveal', target.location]
        });
    }
}