import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';

export default class ChewbaccaLoyalCompanion extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '8918765832',
            internalName: 'chewbacca#loyal-companion',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addOnDefenseAbility({
            title: 'Ready Chewbacca',
            immediateEffect: AbilityHelper.immediateEffects.ready()
        });
    }
}
