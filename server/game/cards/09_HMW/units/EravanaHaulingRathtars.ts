import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';

export default class EravanaHaulingRathtars extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'eravana#hauling-rathtars-id',
            internalName: 'eravana#hauling-rathtars',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addOnAttackAbility({
            title: 'Create a Beast token and ready it',
            immediateEffect: abilityHelper.immediateEffects.sequential([
                abilityHelper.immediateEffects.createBeast(),
                abilityHelper.immediateEffects.ready((context) => ({ target: context.resolvedEvents[0]?.generatedTokens }))
            ])
        });
    }
}