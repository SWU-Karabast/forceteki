import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { TargetMode, WildcardCardType, WildcardZoneName } from '../../../core/Constants';

export default class KalaniAnalyticalGeneral extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '1039176181',
            internalName: 'kalani#analytical-general',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addOnAttackAbility({
            title: 'You may choose another unit. If you have the initiative, you may choose up to 2 other units instead. Give each chosen unit +2/+2 for this phase.',
            targetResolver: {
                mode: TargetMode.UpToVariable,
                cardTypeFilter: WildcardCardType.Unit,
                zoneFilter: WildcardZoneName.AnyArena,
                cardCondition: (card, context) => card !== context.source,
                canChooseNoCards: true,
                numCardsFunc: (context) => (context.player.hasInitiative() ? 2 : 1),
                immediateEffect: AbilityHelper.immediateEffects.forThisPhaseCardEffect({
                    effect: AbilityHelper.ongoingEffects.modifyStats({ power: 2, hp: 2 })
                })
            }
        });
    }
}
