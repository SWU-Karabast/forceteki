import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';

export default class LieutenantGornIDeserveWorse extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '8232418666',
            internalName: 'lieutenant-gorn#i-deserve-worse',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper): void {
        registrar.addOnAttackAbility({
            title: 'Take control of an enemy Credit token',
            immediateEffect: AbilityHelper.immediateEffects.takeControlOfCreditToken((context) => ({
                newController: context.player
            }))
        });
    }
}