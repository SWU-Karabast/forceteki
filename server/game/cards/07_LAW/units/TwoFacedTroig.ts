import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';

export default class TwoFacedTroig extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'twofaced-troig-id',
            internalName: 'twofaced-troig',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addWhenPlayedAbility({
            title: 'Give control of Two-Faced Troig to the opponent and create 2 Credit tokens',
            optional: true,
            immediateEffect: AbilityHelper.immediateEffects.takeControlOfUnit((context) => ({
                newController: context.player.opponent,
                target: context.source
            })),
            ifYouDo: {
                title: 'Create 2 Credit token',
                immediateEffect: AbilityHelper.immediateEffects.createCreditToken({ amount: 2 })
            }
        });
    }
}