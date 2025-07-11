import AbilityHelper from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { AbilityType } from '../../../core/Constants';

export default class WingmanVictorTwoMaulerMithel extends NonLeaderUnitCard {
    protected override getImplementationId () {
        return {
            id: '4921363233',
            internalName: 'wingman-victor-two#mauler-mithel',
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar) {
        registrar.addPilotingAbility({
            type: AbilityType.Triggered,
            title: 'Create a TIE Fighter',
            when: {
                whenPlayed: true,
            },
            immediateEffect: AbilityHelper.immediateEffects.createTieFighter((context) => ({
                target: context.player
            }))
        });
    }
}