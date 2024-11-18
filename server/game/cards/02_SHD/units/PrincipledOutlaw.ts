import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { WildcardCardType, ZoneName } from '../../../core/Constants';

export default class PrincipledOutlaw extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '9040137775',
            internalName: 'principled-outlaw'
        };
    }

    public override setupCardAbilities() {
        this.addOnAttackAbility({
            title: 'Exhaust a ground unit.',
            optional: true,
            targetResolver: {
                cardTypeFilter: WildcardCardType.Unit,
                zoneFilter: ZoneName.GroundArena,
                immediateEffect: AbilityHelper.immediateEffects.exhaust()
            }
        });
    }
}

PrincipledOutlaw.implemented = true;
