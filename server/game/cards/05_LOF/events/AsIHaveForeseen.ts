import AbilityHelper from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import { CostAdjustType } from '../../../core/cost/CostAdjuster';
import { AggregateSystemTargetingEnforcement } from '../../../core/gameSystem/AggregateSystem';

export default class AsIHaveForeseen extends EventCard {
    protected override getImplementationId() {
        return {
            id: '8569501777',
            internalName: 'as-i-have-foreseen',
        };
    }

    public override setupCardAbilities() {
        this.setEventAbility({
            title: 'Look at the top card of your deck',
            immediateEffect: AbilityHelper.immediateEffects.conditional((context) => {
                const topCardOfDeck = context.player.getTopCardOfDeck();
                return {
                    condition: (context) => context.player.hasTheForce,
                    onTrue: AbilityHelper.immediateEffects.lookAtAndChooseOption({
                        target: topCardOfDeck,
                        perCardButtons: [
                            {
                                text: 'Use the Force and play for 4 less',
                                arg: 'play-discount',
                                immediateEffect: AbilityHelper.immediateEffects.sequential({
                                    gameSystems: [
                                        AbilityHelper.immediateEffects.useTheForce({ target: context.player }),
                                        AbilityHelper.immediateEffects.playCardFromOutOfPlay({
                                            target: topCardOfDeck,
                                            adjustCost: { costAdjustType: CostAdjustType.Decrease, amount: 4 }
                                        })
                                    ],
                                    targetingEnforcement: AggregateSystemTargetingEnforcement.IgnoreAll,
                                }),
                            },
                            {
                                text: 'Leave on top',
                                arg: 'leave',
                                immediateEffect: AbilityHelper.immediateEffects.noAction({ hasLegalTarget: true })
                            }
                        ]
                    }),
                    onFalse: AbilityHelper.immediateEffects.lookAt({
                        target: topCardOfDeck,
                        useDisplayPrompt: true
                    })
                };
            })
        });
    }
}