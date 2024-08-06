import { ProvinceCard } from '../../ProvinceCard';
import AbilityDsl from '../../abilitydsl';

export default class BeforeTheThrone extends ProvinceCard {
    static id = 'before-the-throne';

    setupCardAbilities() {
        this.interrupt({
            title: 'Take 2 honor',
            when: {
                onBreakProvince: (event, context) => event.card === context.source
            },
            gameAction: AbilityDsl.actions.takeHonor({ amount: 2 })
        });
    }

    cannotBeStrongholdProvince() {
        return true;
    }
}
