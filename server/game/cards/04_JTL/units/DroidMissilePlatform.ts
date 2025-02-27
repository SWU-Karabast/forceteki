import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { TargetMode } from '../../../core/Constants';

export default class DroidMissilePlatform extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '8287246260',
            internalName: 'droid-missile-platform',
        };
    }

    public override setupCardAbilities() {
        this.addWhenDefeatedAbility({
            title: 'Deal 3 indirect damage to a player',
            targetResolver: {
                mode: TargetMode.Player,
                immediateEffect: AbilityHelper.immediateEffects.indirectDamageToPlayer({ amount: 3 }),
            }
        });
    }
}
