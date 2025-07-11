import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import AbilityHelper from '../../../AbilityHelper';

export default class CorporateDefenseShuttle extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '4332645242',
            internalName: 'corporate-defense-shuttle',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar) {
        registrar.addConstantAbility({
            title: 'This unit can\'t attack',
            ongoingEffect: AbilityHelper.ongoingEffects.cannotAttack()
        });
    }
}
