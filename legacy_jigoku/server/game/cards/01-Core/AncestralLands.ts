import { ProvinceCard } from '../../ProvinceCard';
import AbilityDsl from '../../abilitydsl';

export default class AncestralLands extends ProvinceCard {
    static id = 'ancestral-lands';

    setupCardAbilities() {
        this.persistentEffect({
            condition: () => this.game.isDuringConflict('political'),
            effect: AbilityDsl.effects.modifyProvinceStrength(5)
        });
    }
}
