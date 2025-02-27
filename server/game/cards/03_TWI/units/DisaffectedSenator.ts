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

    public override setupCardAbilities() {
        this.addActionAbility({
            title: 'Deal 2 damage to a base.',
            cost: [AbilityHelper.costs.abilityResourceCost(2), AbilityHelper.costs.exhaustSelf()],
            targetResolver: {
                cardTypeFilter: CardType.Base,
                immediateEffect: AbilityHelper.immediateEffects.damage({ amount: 2 })
            }
        });
    }
}
