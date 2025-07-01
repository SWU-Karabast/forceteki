import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { AbilityType } from '../../../core/Constants';

export default class CassianAndorThreadingTheEye extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '3475471540',
            internalName: 'cassian-andor#threading-the-eye'
        };
    }

    public override setupCardAbilities(card: this) {
        card.addPilotingGainAbilityTargetingAttached({
            type: AbilityType.Triggered,
            title: 'Discard a card from the defending player\'s deck. If that card costs 3 or less, draw a card',
            when: {
                onAttack: true,
            },
            immediateEffect: AbilityHelper.immediateEffects.discardFromDeck((context) => ({
                amount: 1,
                target: context.source.activeAttack.getDefendingPlayer(),
            })),
            ifYouDo: {
                title: 'Draw a card',
                ifYouDoCondition: (ifYouDoContext) => ifYouDoContext.events[0].card.cost <= 3,
                immediateEffect: AbilityHelper.immediateEffects.draw()
            }
        });
    }
}
