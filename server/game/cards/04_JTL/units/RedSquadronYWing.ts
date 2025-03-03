import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';

export default class RedSquadronYWing extends NonLeaderUnitCard {
    protected override getImplementationId () {
        return {
            id: '7831643253',
            internalName: 'red-squadron-ywing',
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