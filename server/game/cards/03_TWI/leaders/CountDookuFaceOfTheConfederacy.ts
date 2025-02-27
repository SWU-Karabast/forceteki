import AbilityHelper from '../../../AbilityHelper';
import { LeaderUnitCard } from '../../../core/card/LeaderUnitCard';
import { RelativePlayer, Trait, ZoneName } from '../../../core/Constants';

export default class CountDookuFaceOfTheConfederacy extends LeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '5683908835',
            internalName: 'count-dooku#face-of-the-confederacy',
        };
    }

    protected override setupLeaderSideAbilities() {
        this.addActionAbility({
            title: 'Play a Separatist card from your hand. It gains Exploit 1.',
            cost: AbilityHelper.costs.exhaustSelf(),
            targetResolver: {
                controller: RelativePlayer.Self,
                zoneFilter: ZoneName.Hand,
                cardCondition: (card) => card.hasSomeTrait(Trait.Separatist),
                immediateEffect: AbilityHelper.immediateEffects.playCardFromHand({
                    exploitValue: 1
                })
            }
        });
    }

    protected override setupLeaderUnitSideAbilities() {
        this.addOnAttackAbility({
            title: 'The next Separatist card you play this phase gains Exploit 3',
            immediateEffect: AbilityHelper.immediateEffects.forThisPhasePlayerEffect({
                effect: AbilityHelper.ongoingEffects.addExploit({
                    match: (card) => card.hasSomeTrait(Trait.Separatist),
                    limit: AbilityHelper.limit.perGame(1),
                    exploitKeywordAmount: 3
                })
            })
        });
    }
}
