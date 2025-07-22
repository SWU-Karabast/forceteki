import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';

export default class TIEAmbushSquadron extends NonLeaderUnitCard {
    protected override getImplementationId () {
        return {
            id: '0097256640',
            internalName: 'tie-ambush-squadron'
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addTriggeredAbility({
            title: 'Create a TIE Fighter token.',
            when: {
                whenPlayed: true,
                whenDefeated: true,
            },
            immediateEffect: AbilityHelper.immediateEffects.createTieFighter()
        });
    }
}
