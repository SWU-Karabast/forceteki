import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';

export default class LieutenantGornIDeserveWorse extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'lieutenant-gorn#i-deserve-worse-id',
            internalName: 'lieutenant-gorn#i-deserve-worse',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper): void {
        registrar.addOnAttackAbility({
            title: 'Take control of an enemy Credit token',
            immediateEffect: AbilityHelper.immediateEffects.conditional((context) => ({
                condition: context.player.opponent.creditTokenCount > 0,
                onTrue: AbilityHelper.immediateEffects.takeControlOfCreditToken({
                    target: context.player.opponent.baseZone.credits[0],
                    newController: context.player
                })
            }))
        });
    }
}