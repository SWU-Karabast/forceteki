import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { TargetMode, WildcardCardType, WildcardZoneName } from '../../../core/Constants';

export default class KalaniAnalyticalGeneral extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '1039176181',
            internalName: 'kalani#analytical-general',
        };
    }

    public override setupCardAbilities() {
        this.addOnAttackAbility({
            title: 'You may choose another unit. If you have the initiative, you may choose up to 2 other units instead',
            targetResolver: {
                activePromptTitle: 'Give each chosen unit +2/+2 for this phase.',
                mode: TargetMode.UpToVariable,
                cardTypeFilter: WildcardCardType.Unit,
                zoneFilter: WildcardZoneName.AnyArena,
                cardCondition: (card, context) => card !== context.source,
                canChooseNoCards: true,
                numCardsFunc: (context) => (context.source.controller.hasInitiative() ? 2 : 1),
                immediateEffect: AbilityHelper.immediateEffects.forThisPhaseCardEffect({
                    effect: AbilityHelper.ongoingEffects.modifyStats({ power: 2, hp: 2 })
                })
            }
        });
    }
}
