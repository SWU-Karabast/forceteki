import { ProvinceCard } from '../../ProvinceCard';
import AbilityDsl from '../../abilitydsl';

export default class MassingAtTwilight extends ProvinceCard {
    static id = 'massing-at-twilight';

    setupCardAbilities() {
        this.persistentEffect({
            condition: (context) => context.source.isConflictProvince(),
            effect: AbilityDsl.effects.changeConflictSkillFunction(
                (card) => card.getMilitarySkill() + card.getPoliticalSkill()
            )
        });
    }
}
