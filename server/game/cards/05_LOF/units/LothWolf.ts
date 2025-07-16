import AbilityHelper from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';

export default class LothWolf extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '7504035101',
            internalName: 'lothwolf',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar) {
        registrar.addConstantAbility({
            title: 'This unit can\'t attack',
            ongoingEffect: AbilityHelper.ongoingEffects.cannotAttack()
        });
    }
}
