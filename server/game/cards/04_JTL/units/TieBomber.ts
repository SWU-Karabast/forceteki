import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';

export default class TieBomber extends NonLeaderUnitCard {
    protected override getImplementationId () {
        return {
            id: '3504944818',
            internalName: 'tie-bomber',
        };
    }

    public override setupCardAbilities () {
        this.addOnAttackAbility({
            title: 'Deal 3 indirect damage to the defending player',
            immediateEffect: AbilityHelper.immediateEffects.indirectDamageToPlayer((context) => ({
                amount: 3,
                target: context.player.opponent,
            })),
        });
    }
}
