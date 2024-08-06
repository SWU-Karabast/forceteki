import AbilityDsl from '../../../abilitydsl';
import DrawCard from '../../../drawcard';

export default class ShibaRyuu extends DrawCard {
    static id = 'shiba-ryuu';

    public setupCardAbilities() {
        this.persistentEffect({
            condition: (context) => context.source.isParticipating(),
            effect: AbilityDsl.effects.changeConflictSkillFunction(
                (card: DrawCard) => card.getMilitarySkill() + card.getPoliticalSkill()
            )
        });
    }
}
