import { ProvinceCard } from '../../ProvinceCard';
import AbilityDsl from '../../abilitydsl';

export default class ShrugOffDespair extends ProvinceCard {
    static id = 'shrug-off-despair';

    setupCardAbilities() {
        this.action({
            title: 'Move the conflict to this province',
            conflictProvinceCondition: () => true,
            condition: (context) => context.game.currentConflict && !context.source.isConflictProvince(),
            gameAction: AbilityDsl.actions.moveConflict((context) => ({
                target: context.source
            }))
        });
    }
}
