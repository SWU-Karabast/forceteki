import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';

export default class PhaseiiiDarkTrooper extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '4843225228',
            internalName: 'phaseiii-dark-trooper'
        };
    }

    public override setupCardAbilities() {
        this.addTriggeredAbility({
            title: 'When combat damage is dealt to this unit: Give an Experience token to this unit.',
            when: {
                onDamageDealt: (event, context) => event.isCombatDamage && event.card === context.source
            },
            immediateEffect: AbilityHelper.immediateEffects.giveExperience(),
        });
    }
}
PhaseiiiDarkTrooper.implemented = true;