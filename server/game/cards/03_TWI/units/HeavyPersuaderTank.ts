import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { ZoneName } from '../../../core/Constants';

export default class HeavyPersuaderTank extends NonLeaderUnitCard {
    protected override getImplementationId () {
        return {
            id: '4210027426',
            internalName: 'heavy-persuader-tank',
        };
    }

    public override setupCardAbilities () {
        this.addWhenPlayedAbility({
            title: 'Deal 2 damage to a ground unit',
            optional: true,
            targetResolver: {
                zoneFilter: ZoneName.GroundArena,
                immediateEffect: AbilityHelper.immediateEffects.damage({ amount: 2 })
            }
        });
    }
}

HeavyPersuaderTank.implemented = true;
