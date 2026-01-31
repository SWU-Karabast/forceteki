import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';

export default class ChampionsKT9Podracer extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'champions-kt9-podracer-id',
            internalName: 'champions-kt9-podracer',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addWhenPlayedAbility({
            title: 'Create a Credit token',
            immediateEffect: abilityHelper.immediateEffects.createCreditToken()
        });
    }
}