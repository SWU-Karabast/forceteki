import { Players } from '../../Constants';
import { ProvinceCard } from '../../ProvinceCard';
import AbilityDsl from '../../abilitydsl';

export default class SilentOnesMonastery extends ProvinceCard {
    static id = 'silent-ones-monastery';

    setupCardAbilities() {
        this.persistentEffect({
            targetController: Players.Opponent,
            effect: AbilityDsl.effects.limitHonorGainPerPhase(2)
        });
    }
}
