import AbilityHelper from '../../../AbilityHelper';
import { UpgradeCard } from '../../../core/card/UpgradeCard';
import { KeywordName, PhaseName, PlayType } from '../../../core/Constants';
import type { Card } from '../../../core/card/Card';
import { CostAdjustType } from '../../../core/cost/CostAdjuster';

export default class UnrefusableOffer extends UpgradeCard {
    protected override getImplementationId() {
        return {
            id: '7270736993',
            internalName: 'unrefusable-offer',
        };
    }

    public override canAttach(targetCard: Card): boolean {
        return !targetCard.isLeaderUnit();
    }

    public override setupCardAbilities() {
        this.addGainKeywordTargetingAttached({
            keyword: KeywordName.Bounty,
            ability: {
                title: 'Play this unit for free (under your control). It enters play ready. At the start of the regroup phase, defeat it',
                immediateEffect: AbilityHelper.immediateEffects.playCard({
                    entersReady: true,
                    adjustCost: { costAdjustType: CostAdjustType.Free },
                    playType: PlayType.PlayFromOutOfPlay,
                    canPlayFromAnyZone: true,
                }),
                ifYouDo: (ifYouDoContext) => ({
                    title: 'At the start of the regroup phase, defeat it',
                    immediateEffect: AbilityHelper.immediateEffects.delayedCardEffect({
                        title: 'Defeat it',
                        target: ifYouDoContext.events[0].card,
                        when: {
                            onPhaseStarted: (context) => context.phase === PhaseName.Regroup
                        },
                        immediateEffect: AbilityHelper.immediateEffects.defeat()
                    })
                })
            }
        });
    }
}
