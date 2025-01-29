import AbilityHelper from '../../../AbilityHelper';
import { LeaderUnitCard } from '../../../core/card/LeaderUnitCard';

export default class SabineWrenGalvanizedRevolutionary extends LeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '4841169874',
            internalName: 'sabine-wren#galvanized-revolutionary',
        };
    }

    protected override setupLeaderSideAbilities() {
        this.addActionAbility({
            title: 'Deal 1 damage to each base',
            cost: AbilityHelper.costs.exhaustSelf(),
            immediateEffect: AbilityHelper.immediateEffects.damage((context) => ({
                amount: 1,
                target: [context.player.base, context.player.opponent.base]
            }))
        });
    }

    protected override setupLeaderUnitSideAbilities() {
        this.addOnAttackAbility({
            title: 'Deal 1 damage to each enemy base',
            immediateEffect: AbilityHelper.immediateEffects.damage((context) => ({
                amount: 1,
                target: context.player.opponent.base
            }))
        });
    }
}
