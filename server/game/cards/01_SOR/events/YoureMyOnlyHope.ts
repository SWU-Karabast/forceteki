import type { IAbilityHelper } from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { CostAdjustType } from '../../../core/cost/CostAdjuster';
import { WildcardCardType } from '../../../core/Constants';

export default class YoureMyOnlyHope extends EventCard {
    protected override getImplementationId() {
        return {
            id: '3509161777',
            internalName: 'youre-my-only-hope',
        };
    }

    public override setupCardAbilities(registrar: IEventAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.setEventAbility({
            title: 'Look at the top card of your deck',
            immediateEffect: AbilityHelper.immediateEffects.lookAtAndChooseOption(
                (context) => {
                    const topCardOfDeck = context.player.getTopCardOfDeck();
                    const canPlayForFree = context.player.base.remainingHp <= 5;
                    const leaveOnTopButton = {
                        text: 'Leave on top',
                        arg: 'leave',
                        immediateEffect: AbilityHelper.immediateEffects.noAction({ hasLegalTarget: true })
                    };
                    const playForFreeButton = {
                        text: 'Play for free',
                        arg: 'play-free',
                        immediateEffect: AbilityHelper.immediateEffects.playCardFromOutOfPlay({
                            target: topCardOfDeck,
                            playAsType: WildcardCardType.Any,
                            adjustCost: { costAdjustType: CostAdjustType.Free }
                        })
                    };
                    const playForDiscountButton = {
                        text: 'Play for 5 less',
                        arg: 'play-discount',
                        immediateEffect: AbilityHelper.immediateEffects.playCardFromOutOfPlay({
                            target: topCardOfDeck,
                            playAsType: WildcardCardType.Any,
                            adjustCost: { costAdjustType: CostAdjustType.Decrease, amount: 5 }
                        })
                    };

                    return {
                        target: topCardOfDeck,
                        perCardButtons: canPlayForFree
                            ? [playForFreeButton, leaveOnTopButton]
                            : [playForDiscountButton, leaveOnTopButton]
                    };
                }
            )
        });
    }
}
