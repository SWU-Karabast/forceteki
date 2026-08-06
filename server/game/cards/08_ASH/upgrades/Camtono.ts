import type { IAbilityHelper } from '../../../AbilityHelper';
import type { IUpgradeAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { UpgradeCard } from '../../../core/card/UpgradeCard';
import { WildcardCardType } from '../../../core/Constants';
import { CostAdjustType } from '../../../core/cost/CostAdjuster';

export default class Camtono extends UpgradeCard {
    protected override getImplementationId() {
        return {
            id: '6192547438',
            internalName: 'camtono',
        };
    }

    public override setupCardAbilities(registrar: IUpgradeAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addGainWhenAttackEndsAbilityTargetingAttached({
            title: 'Look at the top card of your deck. If it costs 2 or less, you may play it for free',
            immediateEffect: abilityHelper.immediateEffects.conditional({
                condition: (context) => context.player.getTopCardOfDeck() != null,
                onTrue: abilityHelper.immediateEffects.conditional({
                    condition: (context) => context.player.getTopCardOfDeck().cost <= 2,
                    onTrue: abilityHelper.immediateEffects.lookAtAndChooseOption((context) => {
                        const topCardOfDeck = context.player.getTopCardOfDeck();

                        return ({
                            target: topCardOfDeck,
                            useDisplayPrompt: true,
                            perCardButtons: [
                                {
                                    text: 'Play it for free',
                                    arg: 'play',
                                    immediateEffect: abilityHelper.immediateEffects.playCardFromOutOfPlay({
                                        target: topCardOfDeck,
                                        playAsType: WildcardCardType.Any,
                                        adjustCost: {
                                            costAdjustType: CostAdjustType.Free
                                        }
                                    })
                                },
                                {
                                    text: 'Leave it on top of your deck',
                                    arg: 'leave',
                                    immediateEffect: abilityHelper.immediateEffects.noAction({ hasLegalTarget: true })
                                }
                            ]
                        });
                    }),
                    onFalse: abilityHelper.immediateEffects.lookAt((context) => ({
                        target: context.player.getTopCardOfDeck(),
                        useDisplayPrompt: true
                    }))
                })
            })
        });
    }
}
