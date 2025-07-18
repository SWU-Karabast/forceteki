import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { WildcardRelativePlayer } from '../../../core/Constants';

export default class RedemptionMedicalFrigate extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '3896582249',
            internalName: 'redemption#medical-frigate',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addWhenPlayedAbility({
            title: 'Heal up to 8 total damage from any number of units and/or bases.',
            immediateEffect: AbilityHelper.immediateEffects.distributeHealingAmong({
                amountToDistribute: 8,
                controller: WildcardRelativePlayer.Any,
                canChooseNoTargets: true,
                canDistributeLess: true,
                cardCondition: (card) => card.isUnit() || card.isBase(),
            }),
            then: (thenContext) => ({
                title: 'Deal that much damage to this unit.',
                immediateEffect: AbilityHelper.immediateEffects.damage({ amount: thenContext.events[0].totalDistributed })
            })
        });
    }
}
