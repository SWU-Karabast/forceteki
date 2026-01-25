import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { ZoneName, RelativePlayer, TargetMode } from '../../../core/Constants';

export default class IntimidatorCitadelOverwatch extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'intimidator#citadel-overwatch-id',
            internalName: 'intimidator#citadel-overwatch'
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addWhenPlayedAbility({
            title: 'Return up any number of friendly resources to their owners’ hands. For each resource returned this way, create a credit token',
            targetResolver: {
                mode: TargetMode.Unlimited,
                canChooseNoCards: true,
                zoneFilter: ZoneName.Resource,
                controller: RelativePlayer.Self,
                immediateEffect: AbilityHelper.immediateEffects.returnToHand()
            },
            then: (thenContext) => ({
                title: `Create ${thenContext.target?.length} Credit tokens`,
                thenCondition: (thenContext) => thenContext.target.length > 0,
                immediateEffect: AbilityHelper.immediateEffects.createCreditToken({ amount: thenContext.target.length }),
            })
        });
    }
}