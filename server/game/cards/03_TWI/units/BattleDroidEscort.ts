import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';

export default class BattleDroidEscort extends NonLeaderUnitCard {
    protected override getImplementationId () {
        return {
            id: '5584601885',
            internalName: 'battle-droid-escort',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addTriggeredAbility({
            title: 'Create a Battle Droid token.',
            when: {
                whenPlayed: true,
                whenDefeated: true,
            },
            immediateEffect: AbilityHelper.immediateEffects.createBattleDroid()
        });
    }
}
