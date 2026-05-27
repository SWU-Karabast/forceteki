import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';

export default class FerryDroid extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'ferry-droid-id',
            internalName: 'ferry-droid',
        };
    }

    public override setupCardAbilities (registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addWhenPlayedAbility({
            title: 'Give 4 Advantage tokens to this unit',
            immediateEffect: abilityHelper.immediateEffects.giveAdvantage((context) => ({
                target: context.source,
                amount: 4
            }))
        });
    }
}
