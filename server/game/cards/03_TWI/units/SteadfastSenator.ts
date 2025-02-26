import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';

export default class SteadfastSenator extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '3258646001',
            internalName: 'steadfast-senator',
        };
    }

    public override setupCardAbilities () {
        this.addActionAbility({
            title: 'Attack with a unit. It gets +2/+0 for this attack',
            cost: [AbilityHelper.costs.abilityResourceCost(2), AbilityHelper.costs.exhaustSelf()],
            initiateAttack: {
                attackerLastingEffects: {
                    effect: AbilityHelper.ongoingEffects.modifyStats({ power: 2, hp: 0 }),
                }
            }
        });
    }
}