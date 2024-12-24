import { EventCard } from '../../../core/card/EventCard';
import AbilityHelper from '../../../AbilityHelper';
import { CardType, PhaseName, ZoneName } from '../../../core/Constants';
import { CostAdjustType } from '../../../core/cost/CostAdjuster';

export default class SneakAttack extends EventCard {
    protected override getImplementationId() {
        return {
            id: '3426168686',
            internalName: 'sneak-attack'
        };
    }

    public override setupCardAbilities() {
        this.setEventAbility({
            title: 'Play a unit from your hand. It costs 3 less and enters play ready. At the start of the regroup phase, defeat it.',
            immediateEffect: AbilityHelper.immediateEffects.selectCard({
                activePromptTitle: 'Play a unit, it costs 3 less and enters play ready. At the start of the regroup phase, defeat it.',
                cardTypeFilter: CardType.BasicUnit,
                zoneFilter: ZoneName.Hand,
                innerSystem: AbilityHelper.immediateEffects.sequential([
                    AbilityHelper.immediateEffects.playCardFromHand({
                        entersReady: true,
                        adjustCost: { costAdjustType: CostAdjustType.Decrease, amount: 3 }
                    }),
                    AbilityHelper.immediateEffects.delayedCardEffect({
                        title: 'Defeat it.',
                        when: {
                            onPhaseStarted: (context) => context.phase === PhaseName.Regroup
                        },
                        immediateEffect: AbilityHelper.immediateEffects.defeat()
                    })
                ])
            }),
        });
    }
}

SneakAttack.implemented = true;
