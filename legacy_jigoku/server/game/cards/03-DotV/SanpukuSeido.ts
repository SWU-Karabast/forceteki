import { ProvinceCard } from '../../ProvinceCard';
import AbilityDsl from '../../abilitydsl';

export default class SanpukuSeido extends ProvinceCard {
    static id = 'sanpuku-seido';

    setupCardAbilities() {
        this.persistentEffect({
            condition: (context) => context.source.isConflictProvince(),
            effect: AbilityDsl.effects.changeConflictSkillFunction((card) => card.getGlory())
        });
    }

    cannotBeStrongholdProvince() {
        return true;
    }
}
