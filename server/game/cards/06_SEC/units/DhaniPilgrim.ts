import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';

export default class DhaniPilgrim extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '9394156877',
            internalName: 'dhani-pilgrim',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addTriggeredAbility({
            when: {
                whenPlayed: true,
                whenDefeated: true,
            },
            title: 'Heal 1 damage from your base',
            immediateEffect: abilityHelper.immediateEffects.heal((context) => ({ amount: 1, target: context.player.base }))
        });
    }
}
