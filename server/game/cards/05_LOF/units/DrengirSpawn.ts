import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { DefeatCardSystem } from '../../../gameSystems/DefeatCardSystem';

export default class DrengirSpawn extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '3092212109',
            internalName: 'drengir-spawn',
        };
    }

    public override setupCardAbilities() {
        this.addTriggeredAbility({
            title: 'Give a number of Experience tokens to this unit equal to the defeated unit\'s cost',
            when: {
                onCardDefeated: (event, context) =>
                    event.isDefeatedByAttacker && DefeatCardSystem.defeatSourceCard(event) === context.source
            },
            immediateEffect: AbilityHelper.immediateEffects.giveExperience((context) => ({ amount: context.event.card.cost }))
        });
    }
}
