import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';

export default class T6Shuttle1974StayClose extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '2134957922',
            internalName: 't6-shuttle-1974#stay-close'
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addOnDefenseAbility({
            title: 'Give an experience token to this unit',
            optional: true,
            immediateEffect: AbilityHelper.immediateEffects.giveExperience(),
        });
    }
}
