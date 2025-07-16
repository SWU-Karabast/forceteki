import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';

export default class GeneralsGuardian extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '3876951742',
            internalName: 'generals-guardian',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addTriggeredAbility({
            title: 'Create a Battle Droid token.',
            when: {
                onAttackDeclared: (event, context) => event.attack.getAllTargets().includes(context.source),
            },
            immediateEffect: AbilityHelper.immediateEffects.createBattleDroid()
        });
    }
}
