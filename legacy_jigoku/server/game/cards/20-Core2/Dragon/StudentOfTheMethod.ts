import AbilityDsl from '../../../abilitydsl';
import DrawCard from '../../../drawcard';

export default class StudentOfTheMethod extends DrawCard {
    static id = 'student-of-the-method';

    public setupCardAbilities() {
        this.persistentEffect({
            condition: (context) => context.player.showBid === context.player.opponent?.showBid,
            effect: AbilityDsl.effects.modifyBothSkills(+2)
        });
    }
}