import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';

export default class RodianBondsman extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: 'rodian-bondsman-id',
            internalName: 'rodian-bondsman',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addWhenDefeatedAbility({
            title: 'Each player creates a Credit token',
            immediateEffect: AbilityHelper.immediateEffects.simultaneous([
                AbilityHelper.immediateEffects.createCreditToken(),
                AbilityHelper.immediateEffects.createCreditToken((context) => ({ target: context.player.opponent })),
            ]),
        });
    }
}