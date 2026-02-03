import type { IAbilityHelper } from '../../../AbilityHelper';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { EventCard } from '../../../core/card/EventCard';
import { WildcardCardType } from '../../../core/Constants';
import { CostAdjustType } from '../../../core/cost/CostAdjuster';

export default class Improvise extends EventCard {
    protected override getImplementationId () {
        return {
            id: '1925903426',
            internalName: 'improvise',
        };
    }

    public override setupCardAbilities (registrar: IEventAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.setEventAbility({
            title: 'Look at the top card of your deck. You may play it. It costs 1 less. If you don\'t, you may discard it',
            immediateEffect: AbilityHelper.immediateEffects.lookAtAndChooseOption((context) => {
                const topCardOfDeck = context.player.getTopCardOfDeck();
                return {
                    useDisplayPrompt: true,
                    target: topCardOfDeck,
                    perCardButtons: [
                        {
                            text: 'Play it (it costs 1 less)',
                            arg: 'play',
                            immediateEffect: AbilityHelper.immediateEffects.playCardFromOutOfPlay({
                                target: topCardOfDeck,
                                playAsType: WildcardCardType.Any,
                                adjustCost: { costAdjustType: CostAdjustType.Decrease, amount: 1 }
                            })
                        },
                        {
                            text: 'Discard it',
                            arg: 'discard',
                            immediateEffect: AbilityHelper.immediateEffects.discardSpecificCard({ target: topCardOfDeck })
                        },
                        {
                            text: 'Leave it on top of your deck',
                            arg: 'leave',
                            immediateEffect: AbilityHelper.immediateEffects.noAction({ hasLegalTarget: true })
                        }
                    ]
                };
            })
        });
    }
}