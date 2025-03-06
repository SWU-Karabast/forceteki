import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { AbilityType } from '../../../core/Constants';

export default class AnakinsSkywalkerIllTrySpinning extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '8523415830',
            internalName: 'anakin-skywalker#ill-try-spinning',
        };
    }

    public override setupCardAbilities() {
        this.addPilotingAbility({
            type: AbilityType.Triggered,
            title: 'Return this upgrade to its owner\'s hand',
            when: {
                onAttackCompleted: (event, context) => event.attack.attacker.upgrades.filter((upgrade) => upgrade === context.source).length > 0
            },
            immediateEffect: AbilityHelper.immediateEffects.chooseModalEffects({
                amountOfChoices: 1,
                choices: (context) => ({
                    [`Return ${this.title} to your hand`]: AbilityHelper.immediateEffects.returnToHand({
                        target: context.source,
                    }),
                    [`Keep ${this.title} attached`]: AbilityHelper.immediateEffects.noAction({
                    })
                })
            })
        });
    }
}
