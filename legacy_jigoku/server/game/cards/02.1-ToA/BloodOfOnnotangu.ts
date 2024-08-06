import { Players } from '../../Constants';
import { ProvinceCard } from '../../ProvinceCard';
import AbilityDsl from '../../abilitydsl';

export default class BloodOfOnnotangu extends ProvinceCard {
    static id = 'blood-of-onnotangu';

    setupCardAbilities() {
        this.persistentEffect({
            targetController: Players.Any,
            condition: (context) => context.source.isConflictProvince(),
            effect: AbilityDsl.effects.playerCannot('spendFate')
        });
    }
}
