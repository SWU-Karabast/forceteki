import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';

export default class TheStarhawkPrototypeBattleship extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '0728753133',
            internalName: 'the-starhawk#prototype-battleship',
        };
    }

    public override setupCardAbilities() {
        this.addConstantAbility({
            title: 'While paying costs, you pay half as many resources, rounded up',
            ongoingEffect: AbilityHelper.ongoingEffects.modifyPayStageCost({
                amount: (_card, _player, _context, amount) => -Math.floor(amount / 2)
            })
        });
    }
}
