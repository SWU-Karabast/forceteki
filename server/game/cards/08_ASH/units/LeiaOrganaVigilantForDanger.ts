import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';

export default class LeiaOrganaVigilantForDanger extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'leia-organa#vigilant-for-danger-id',
            internalName: 'leia-organa#vigilant-for-danger',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper): void {
        registrar.addOnAttackAbility({
            title: 'Deal 1 damage to this unit to heal 2 damage from your base',
            optional: true,
            immediateEffect: abilityHelper.immediateEffects.damage((context) => ({ amount: 1, target: context.source })),
            ifYouDo: {
                title: 'Heal 2 damage from your base',
                immediateEffect: abilityHelper.immediateEffects.heal((context) => ({ amount: 2, target: context.player.base }))
            }
        });
    }
}