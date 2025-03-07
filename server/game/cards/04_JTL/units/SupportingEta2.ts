import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { WildcardCardType, ZoneName } from '../../../core/Constants';
import AbilityHelper from '../../../AbilityHelper';

export default class SupportingEta2 extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '7232609585',
            internalName: 'supporting-eta2',
        };
    }

    public override setupCardAbilities() {
        this.addOnAttackAbility({
            title: 'Give a ground unit +2/+0 for this phase',
            optional: true,
            targetResolver: {
                cardTypeFilter: WildcardCardType.Unit,
                zoneFilter: ZoneName.GroundArena,
                immediateEffect: AbilityHelper.immediateEffects.forThisPhaseCardEffect({
                    effect: AbilityHelper.ongoingEffects.modifyStats({ power: 2, hp: 0 }),
                }),
            },
        });
    }
}