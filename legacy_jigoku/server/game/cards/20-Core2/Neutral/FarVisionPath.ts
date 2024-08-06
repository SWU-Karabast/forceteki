import { CardTypes, Locations } from '../../../Constants';
import { ProvinceCard } from '../../../ProvinceCard';
import AbilityDsl from '../../../abilitydsl';

export default class FarVisionPath extends ProvinceCard {
    static id = 'far-vision-path';

    public setupCardAbilities() {
        this.reaction({
            title: 'Move the conflict',
            when: {
                onCardRevealed: (event, context) => event.card === context.source
            },
            target: {
                cardType: CardTypes.Province,
                location: Locations.Provinces,
                gameAction: AbilityDsl.actions.moveConflict()
            }
        });
    }

    cannotBeStrongholdProvince() {
        return true;
    }
}
