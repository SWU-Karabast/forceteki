import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';

export default class HowlerPack extends NonLeaderUnitCard {
    protected override getImplementationId () {
        return {
            id: '3609615193',
            internalName: 'howler-pack'
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addTriggeredAbility({
            title: 'Create a Beast token',
            when: {
                whenPlayed: true,
                whenDefeated: true
            },
            immediateEffect: AbilityHelper.immediateEffects.createBeast()
        });
    }
}