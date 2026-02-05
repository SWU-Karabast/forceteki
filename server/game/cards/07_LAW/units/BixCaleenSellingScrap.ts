import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { RelativePlayer, ZoneName } from '../../../core/Constants';

export default class BixCaleenSellingScrap extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '5249469281',
            internalName: 'bix-caleen#selling-scrap'
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addTriggeredAbility({
            title: 'Discard a card from your hand to create a Credit token',
            when: {
                whenPlayed: true,
                onAttack: true,
            },
            optional: true,
            targetResolver: {
                zoneFilter: ZoneName.Hand,
                controller: RelativePlayer.Self,
                immediateEffect: abilityHelper.immediateEffects.discardSpecificCard()
            },
            ifYouDo: {
                title: 'Create a Credit token',
                immediateEffect: abilityHelper.immediateEffects.createCreditToken()
            }
        });
    }
}
