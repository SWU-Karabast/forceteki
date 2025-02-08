import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { RelativePlayer, TargetMode, WildcardCardType, ZoneName } from '../../../core/Constants';
import { CostAdjustType } from '../../../core/cost/CostAdjuster';

export default class FennRauProtectorOfConcordDawn extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '3399023235',
            internalName: 'fenn-rau#protector-of-concord-dawn'
        };
    }

    public override setupCardAbilities() {
        this.addWhenPlayedAbility({
            title: 'You may play an upgrade from your hand. It costs 2 less',
            optional: true,
            targetResolver: {
                cardTypeFilter: WildcardCardType.Upgrade,
                mode: TargetMode.Single,
                zoneFilter: ZoneName.Hand,
                controller: RelativePlayer.Self,
                immediateEffect: AbilityHelper.immediateEffects.playCardFromHand({
                    adjustCost: { costAdjustType: CostAdjustType.Decrease, amount: 2 }
                })
            }
        });

        this.addTriggeredAbility({
            title: 'Give an enemy unit -2/-2 for this phase.',
            when: {
                onUpgradeAttached: (event, context) => event.card === context.source
            },
            targetResolver: {
                cardTypeFilter: WildcardCardType.Unit,
                controller: RelativePlayer.Opponent,
                immediateEffect: AbilityHelper.immediateEffects.forThisPhaseCardEffect({
                    effect: AbilityHelper.ongoingEffects.modifyStats({ power: -2, hp: -2 }),
                })
            }
        });
    }
}
