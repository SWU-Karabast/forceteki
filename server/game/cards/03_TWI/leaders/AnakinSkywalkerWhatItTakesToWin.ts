import AbilityHelper from '../../../AbilityHelper';
import { LeaderUnitCard } from '../../../core/card/LeaderUnitCard';
import { RelativePlayer, WildcardCardType } from '../../../core/Constants';

export default class AnakinSkywalkerWhatItTakesToWin extends LeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '8777351722',
            internalName: 'anakin-skywalker#what-it-takes-to-win',
        };
    }

    protected override setupLeaderSideAbilities() {
        this.addActionAbility({
            title: 'Deal 2 damage to your base to attack with a unit. If it is attacking a unit, it gets +2 attack for the attack',
            cost: (context) => [AbilityHelper.costs.exhaustSelf(), AbilityHelper.costs.dealDamageSpecific(2, context.source.controller.base)],
            targetResolver: {
                controller: RelativePlayer.Self,
                cardTypeFilter: WildcardCardType.Unit,
                immediateEffect: AbilityHelper.immediateEffects.attack({
                    attackerLastingEffects: {
                        condition: (attack) => attack.target.isUnit(),
                        effect: AbilityHelper.ongoingEffects.modifyStats({ power: 2, hp: 0 })
                    }
                })
            }
        });
    }

    protected override setupLeaderUnitSideAbilities() {
        this.addConstantAbility({
            title: 'Gain +1/+0 for every 5 damage on your base',
            ongoingEffect: AbilityHelper.ongoingEffects.modifyStats((target) => ({
                power: Math.floor(target.controller.base.damage / 5),
                hp: 0
            })),
        });
    }
}