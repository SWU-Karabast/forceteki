
import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';

export default class ExecutorMightOfTheEmpire extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '2870117979',
            internalName: 'executor#might-of-the-empire'
        };
    }

    public override setupCardAbilities() {
        this.addTriggeredAbility({
            title: 'Create 3 TIE Fighter tokens.',
            when: {
                onCardPlayed: (event, context) => event.card === context.source,
                whenDefeated: true,
                onAttackDeclared: (event, context) => event.attack.attacker === context.source
            },
            immediateEffect: AbilityHelper.immediateEffects.createTieFighter({ amount: 3 })
        });
    }
}