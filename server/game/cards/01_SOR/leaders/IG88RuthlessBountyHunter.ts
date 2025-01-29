import AbilityHelper from '../../../AbilityHelper';
import { LeaderUnitCard } from '../../../core/card/LeaderUnitCard';
import { KeywordName, RelativePlayer, WildcardCardType } from '../../../core/Constants';

export default class IG88RuthlessBountyHunter extends LeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '8600121285',
            internalName: 'ig88#ruthless-bounty-hunter',
        };
    }

    protected override setupLeaderSideAbilities() {
        this.addActionAbility({
            title: 'Attack with a unit. If you control more units than the defending player, the attacker gets +1/+0 for this attack',
            cost: AbilityHelper.costs.exhaustSelf(),
            targetResolver: {
                controller: RelativePlayer.Self,
                cardTypeFilter: WildcardCardType.Unit,
                immediateEffect: AbilityHelper.immediateEffects.attack({
                    attackerLastingEffects: {
                        condition: (_, context) => context.player.getUnitsInPlay().length > context.player.opponent.getUnitsInPlay().length,
                        effect: AbilityHelper.ongoingEffects.modifyStats({ power: 1, hp: 0 })
                    }
                })
            }
        });
    }

    protected override setupLeaderUnitSideAbilities() {
        this.addConstantAbility({
            title: 'Each other friendly unit gains Raid 1',
            matchTarget: (card, context) => card !== context.source && card.isUnit(),
            ongoingEffect: AbilityHelper.ongoingEffects.gainKeyword({
                keyword: KeywordName.Raid,
                amount: 1
            })
        });
    }
}
