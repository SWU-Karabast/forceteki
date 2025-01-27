import AbilityHelper from '../../../AbilityHelper';
import { LeaderUnitCard } from '../../../core/card/LeaderUnitCard';
import { CardType, RelativePlayer, Trait, WildcardCardType } from '../../../core/Constants';
import type { AttacksThisPhaseWatcher } from '../../../stateWatchers/AttacksThisPhaseWatcher';

export default class AnakinSkywalkerWhatItTakesToWin extends LeaderUnitCard {
    private attacksThisPhaseWatcher: AttacksThisPhaseWatcher;

    protected override getImplementationId() {
        return {
            id: '8777351722',
            internalName: 'anakin-skywalker#what-it-takes-to-win',
        };
    }

    protected override setupLeaderSideAbilities() {
        this.addActionAbility({
            title: 'Deal 2 damage to your base to attack with a unit. If it is attacking a unit, it gets +2 attack for the attack',
            cost: [AbilityHelper.costs.exhaustSelf(), AbilityHelper.costs.dealDamage(2, {
                cardTypeFilter: CardType.Base,
                controller: RelativePlayer.Self
            })],
            targetResolver: {
                controller: RelativePlayer.Self,
                cardTypeFilter: WildcardCardType.Unit,
                immediateEffect: AbilityHelper.immediateEffects.attack({
                    attackerLastingEffects: {
                        condition: (_, context) => context.player.getUnitsInPlay().length > context.player.opponent.getUnitsInPlay().length,
                        effect: AbilityHelper.ongoingEffects.modifyStats({ power: 2, hp: 0 })
                    }
                })
            }
        });
    }

    protected override setupLeaderUnitSideAbilities() {
        this.addTriggeredAbility({
            title: 'Create a Clone Trooper token.',
            when: {
                onLeaderDeployed: (event, context) => event.card === context.source
            },
            immediateEffect: AbilityHelper.immediateEffects.createCloneTrooper()
        });

        this.addConstantAbility({
            title: 'Each other friendly Trooper unit gets +0/+1.',
            matchTarget: (card, context) => card !== context.source && card.isUnit() && card.hasSomeTrait(Trait.Trooper),
            ongoingEffect: AbilityHelper.ongoingEffects.modifyStats({ power: 0, hp: 1 })
        });
    }
}

AnakinSkywalkerWhatItTakesToWin.implemented = true;