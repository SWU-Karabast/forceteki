import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';

export default class VanguardInfantry extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '5575681343',
            internalName: 'vanguard-infantry',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addWhenDefeatedAbility({
            title: 'Give an Experience token to a unit',
            optional: true,
            targetResolver: {
                immediateEffect: AbilityHelper.immediateEffects.giveExperience()
            }
        });
    }
}
