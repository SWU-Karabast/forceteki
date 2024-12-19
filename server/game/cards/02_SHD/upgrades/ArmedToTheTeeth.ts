import AbilityHelper from '../../../AbilityHelper';
import { UpgradeCard } from '../../../core/card/UpgradeCard';
import { RelativePlayer, WildcardCardType, WildcardZoneName } from '../../../core/Constants';

export default class ArmedToTheTeeth extends UpgradeCard {
    protected override getImplementationId() {
        return {
            id: '1938453783',
            internalName: 'armed-to-the-teeth',
        };
    }

    public override setupCardAbilities() {
        this.addGainOnAttackAbilityTargetingAttached({
            title: 'Give another friendly unit +2/+0 for this phase',
            targetResolver: {
                cardTypeFilter: WildcardCardType.Unit,
                zoneFilter: WildcardZoneName.AnyArena,
                controller: RelativePlayer.Self,
                cardCondition: (card, context) => card !== context.source,
                immediateEffect: AbilityHelper.immediateEffects.forThisPhaseCardEffect({
                    effect: AbilityHelper.ongoingEffects.modifyStats({ power: 2, hp: 0 })
                })
            }
        });
    }
}

ArmedToTheTeeth.implemented = true;
