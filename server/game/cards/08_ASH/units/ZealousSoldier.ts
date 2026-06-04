import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';

export default class ZealousSoldier extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '4169022992',
            internalName: 'zealous-soldier'
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addWhenPlayedAbility({
            title: 'Give an Advantage token to this unit',
            immediateEffect: AbilityHelper.immediateEffects.giveAdvantage()
        });
    }
}
