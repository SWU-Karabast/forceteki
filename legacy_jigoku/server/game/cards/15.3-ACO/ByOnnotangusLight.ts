import { Players, Locations, CardTypes } from '../../Constants';
import { ProvinceCard } from '../../ProvinceCard';
import AbilityDsl from '../../abilitydsl';

export default class ByOnnotangusLight extends ProvinceCard {
    static id = 'by-onnotangu-s-light';

    setupCardAbilities() {
        this.persistentEffect({
            condition: (context) => context.source.isConflictProvince(),
            targetController: Players.Any,
            targetLocation: Locations.PlayArea,
            match: (card) => card.type === CardTypes.Character,
            effect: [AbilityDsl.effects.cardCannot({ cannot: 'removeFate' }), AbilityDsl.effects.setApparentFate(0)]
        });
    }
}
