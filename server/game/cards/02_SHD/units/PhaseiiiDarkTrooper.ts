import AbilityHelper from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { DamageType } from '../../../core/Constants';

export default class PhaseiiiDarkTrooper extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '4843225228',
            internalName: 'phaseiii-dark-trooper'
        };
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar) {
        registrar.addTriggeredAbility({
            title: 'When combat damage is dealt to this unit: Give an Experience token to this unit.',
            when: {
                onDamageDealt: (event, context) => event.type === DamageType.Combat && event.card === context.source
            },
            immediateEffect: AbilityHelper.immediateEffects.giveExperience(),
        });
    }
}