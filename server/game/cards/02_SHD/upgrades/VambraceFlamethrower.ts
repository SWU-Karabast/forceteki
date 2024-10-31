import AbilityHelper from '../../../AbilityHelper';
import { UpgradeCard } from '../../../core/card/UpgradeCard';
import { Location, RelativePlayer, WildcardCardType } from '../../../core/Constants';

export default class VambraceFlamethrower extends UpgradeCard {
    protected override getImplementationId() {
        return {
            id: '6471336466',
            internalName: 'vambrace-flamethrower',
        };
    }

    public override setupCardAbilities() {
        this.addGainOnAttackAbilityTargetingAttached({
            title: 'Deal 3 damage divided as you choose among enemy ground units',
            immediateEffect: AbilityHelper.immediateEffects.distributeDamageAmong({
                amountToDistribute: 3,
                canChooseNoTargets: true,
                controller: RelativePlayer.Opponent,
                cardTypeFilter: WildcardCardType.Unit,
                locationFilter: Location.GroundArena,
            })
        });
    }
}

VambraceFlamethrower.implemented = true;
