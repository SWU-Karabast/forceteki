import { ProvinceCard } from '../../ProvinceCard';
import AbilityDsl from '../../abilitydsl';

export default class EntrenchedPosition extends ProvinceCard {
    static id = 'entrenched-position';

    setupCardAbilities() {
        this.persistentEffect({
            condition: () => this.game.isDuringConflict('military'),
            effect: AbilityDsl.effects.modifyProvinceStrength(5)
        });
    }
}
