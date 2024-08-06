import { CardTypes, Locations } from '../../../Constants';
import { ProvinceCard } from '../../../ProvinceCard';
import AbilityDsl from '../../../abilitydsl';

export default class ShrineOfVengeance extends ProvinceCard {
    static id = 'shrine-of-vengeance';

    public setupCardAbilities() {
        this.interrupt({
            title: 'Blank and reveal a province',
            when: {
                onBreakProvince: (event, context) => event.card === context.source
            },
            target: {
                location: Locations.Provinces,
                cardType: CardTypes.Province,
                cardCondition: (card: ProvinceCard) => card.facedown,
                gameAction: AbilityDsl.actions.sequential([
                    AbilityDsl.actions.dishonorProvince(),
                    AbilityDsl.actions.reveal({ chatMessage: true })
                ])
            }
        });
    }
}