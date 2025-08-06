import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { RelativePlayer, WildcardCardType } from '../../../core/Constants';

export default class EmperorPalpatineMasterOfTheDarkSide extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '9097316363',
            internalName: 'emperor-palpatine#master-of-the-dark-side',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addWhenPlayedAbility({
            title: 'Deal 6 damage divided as you choose among enemy units',
            immediateEffect: AbilityHelper.immediateEffects.distributeDamageAmong({
                amountToDistribute: 6,
                canChooseNoTargets: false,
                controller: RelativePlayer.Opponent,
                cardTypeFilter: WildcardCardType.Unit
            })
        });
    }
}
