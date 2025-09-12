import type { IAbilityHelper } from '../../../AbilityHelper';
import type {
    ILeaderUnitLeaderSideAbilityRegistrar
} from '../../../core/card/AbilityRegistrationInterfaces';
import { LeaderUnitCard } from '../../../core/card/LeaderUnitCard';
import { WildcardCardType, WildcardRelativePlayer } from '../../../core/Constants';

export default class SatineKryzeStandingOnPrinciples extends LeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'satine-kryze#standing-on-principles-id',
            internalName: 'satine-kryze#standing-on-principles'
        };
    }

    protected override setupLeaderSideAbilities(registrar: ILeaderUnitLeaderSideAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addActionAbility({
            title: 'Heal up to 2 damage from a unit. If you do, deal that much damage to your base',
            cost: [abilityHelper.costs.exhaustSelf()],
            immediateEffect: abilityHelper.immediateEffects.distributeHealingAmong({
                amountToDistribute: 2,
                controller: WildcardRelativePlayer.Any,
                canChooseNoTargets: true,
                cardTypeFilter: WildcardCardType.Unit,
                maxTargets: 1
            }),
            ifYouDo: (ifYouDoContext) => ({
                title: 'Deal that much damage to your base',
                immediateEffect: abilityHelper.immediateEffects.damage({
                    amount: ifYouDoContext.events[0].totalDistributed,
                    target: ifYouDoContext.player.base,
                }),
            })
        });
    }
}
