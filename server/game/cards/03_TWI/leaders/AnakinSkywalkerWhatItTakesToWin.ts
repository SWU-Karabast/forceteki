import type { IAbilityHelper } from '../../../AbilityHelper';
import type { ILeaderUnitAbilityRegistrar, ILeaderUnitLeaderSideAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { LeaderUnitCard } from '../../../core/card/LeaderUnitCard';
import { RelativePlayer, WildcardCardType } from '../../../core/Constants';

export default class AnakinSkywalkerWhatItTakesToWin extends LeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '8777351722',
            internalName: 'anakin-skywalker#what-it-takes-to-win',
        };
    }

    protected override setupLeaderSideAbilities(registrar: ILeaderUnitLeaderSideAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addActionAbility({
            title: 'Deal 2 damage to your base to attack with a unit. If it is attacking a unit, it gets +2 attack for the attack',
            cost: (context) => [AbilityHelper.costs.exhaustSelf(), AbilityHelper.costs.dealDamageSpecific(2, context.player.base)],
            targetResolver: {
                controller: RelativePlayer.Self,
                cardTypeFilter: WildcardCardType.Unit,
                immediateEffect: AbilityHelper.immediateEffects.attack({
                    attackerLastingEffects: {
                        condition: (attack) => attack.targetIsUnit(() => true, true),
                        effect: AbilityHelper.ongoingEffects.modifyStats({ power: 2, hp: 0 })
                    }
                })
            }
        });
    }

    protected override setupLeaderUnitSideAbilities(registrar: ILeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addConstantAbility({
            title: 'Gain +1/+0 for every 5 damage on your base',
            ongoingEffect: AbilityHelper.ongoingEffects.modifyStats((target) => ({
                power: Math.floor(target.controller.base.damage / 5),
                hp: 0
            })),
        });
    }
}
