import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { CardType } from '../../../core/Constants';

export default class DisaffectedSenator extends NonLeaderUnitCard {
    protected override getImplementationId () {
        return {
            id: '0595607848',
            internalName: 'disaffected-senator'
        };
    }

    public override setupCardAbilities(card: this) {
        card.addActionAbility({
            title: 'Deal 2 damage to a base.',
            cost: [AbilityHelper.costs.abilityActivationResourceCost(2), AbilityHelper.costs.exhaustSelf()],
            targetResolver: {
                cardTypeFilter: CardType.Base,
                immediateEffect: AbilityHelper.immediateEffects.damage({ amount: 2 })
            }
        });
    }
}
