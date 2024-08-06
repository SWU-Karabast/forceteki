import { Players } from '../../Constants';
import { ProvinceCard } from '../../ProvinceCard';
import AbilityDsl from '../../abilitydsl';

export default class UnbridledAmbition extends ProvinceCard {
    static id = 'unbridled-ambition';

    setupCardAbilities() {
        this.persistentEffect({
            condition: (context) => context.source.isConflictProvince(),
            targetController: Players.Any,
            effect: AbilityDsl.effects.cannotContribute(() => (card) => card.isDishonored)
        });
    }

    cannotBeStrongholdProvince() {
        return true;
    }
}
