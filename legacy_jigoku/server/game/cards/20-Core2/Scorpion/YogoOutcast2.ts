import AbilityDsl from '../../../abilitydsl';
import DrawCard from '../../../drawcard';

export default class YogoOutcast extends DrawCard {
    static id = 'yogo-outcast-2';

    setupCardAbilities() {
        this.persistentEffect({
            condition: (context) => context.player.isLessHonorable(),
            effect: AbilityDsl.effects.modifyBothSkills(1)
        });
    }
}
