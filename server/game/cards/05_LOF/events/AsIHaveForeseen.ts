import AbilityHelper from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { CostAdjustType } from '../../../core/cost/CostAdjuster';
import { ResolutionMode } from '../../../gameSystems/SimultaneousOrSequentialSystem';
import { WildcardCardType } from '../../../core/Constants';

export default class AsIHaveForeseen extends EventCard {
    protected override getImplementationId() {
        return {
            id: '8569501777',
            internalName: 'as-i-have-foreseen',
        };
    }

    public override setupCardAbilities(registrar: IEventAbilityRegistrar) {
        registrar.setEventAbility({
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
                                            adjustCost: { costAdjustType: CostAdjustType.Decrease, amount: 4 },
                                            playAsType: WildcardCardType.Any,
                                        })
                                    ],
                                    resolutionMode: ResolutionMode.AlwaysResolve,
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