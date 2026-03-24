import type { IAbilityHelper } from '../../../AbilityHelper';
import type {
    ILeaderUnitAbilityRegistrar,
    ILeaderUnitLeaderSideAbilityRegistrar
} from '../../../core/card/AbilityRegistrationInterfaces';
import { LeaderUnitCard } from '../../../core/card/LeaderUnitCard';
import { WildcardCardType } from '../../../core/Constants';
import { CostAdjustType } from '../../../core/cost/CostAdjuster';
import { TextHelper } from '../../../core/utils/TextHelper';

export default class AhsokaTanoIHaveAnIdea extends LeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '8865072142',
            internalName: 'ahsoka-tano#i-have-an-idea',
        };
    }

    protected override setupLeaderSideAbilities(registrar: ILeaderUnitLeaderSideAbilityRegistrar, abilityHelper: IAbilityHelper): void {
        registrar.addTriggeredAbility({
            title: 'Exhaust Ahsoka Tano to look at the top card of your deck',
            when: {
                onCardPlayed: (event, context) => event.card.isEvent() && event.player === context.player
            },
            optional: true,
            immediateEffect: abilityHelper.immediateEffects.exhaust(),
            ifYouDo: {
                title: 'Look at the top card of your deck',
                immediateEffect: abilityHelper.immediateEffects.lookAtAndChooseOption((context) => {
                    const topCardOfDeck = context.player.getTopCardOfDeck();
                    return {
                        useDisplayPrompt: true,
                        target: topCardOfDeck,
                        perCardButtons: [
                            {
                                text: 'Play it',
                                arg: 'play',
                                immediateEffect: abilityHelper.immediateEffects.playCardFromOutOfPlay({
                                    target: topCardOfDeck,
                                    playAsType: WildcardCardType.Any
                                })
                            },
                            {
                                text: 'Discard it',
                                arg: 'discard',
                                immediateEffect: abilityHelper.immediateEffects.discardSpecificCard({ target: topCardOfDeck })
                            },
                            {
                                text: 'Leave on top',
                                arg: 'leave',
                                immediateEffect: abilityHelper.immediateEffects.noAction({ hasLegalTarget: true })
                            }
                        ]
                    };
                })
            }
        });
    }

    protected override setupLeaderUnitSideAbilities(registrar: ILeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper): void {
        registrar.addWhenAttackEndsAbility({
            title: `Look at the top card of your deck. If you play it, it costs ${TextHelper.resource(1)} less`,
            immediateEffect: abilityHelper.immediateEffects.lookAtAndChooseOption((context) => {
                const topCardOfDeck = context.player.getTopCardOfDeck();
                return {
                    useDisplayPrompt: true,
                    target: topCardOfDeck,
                    perCardButtons: [
                        {
                            text: `Play for ${TextHelper.resource(1)} less`,
                            arg: 'play',
                            immediateEffect: abilityHelper.immediateEffects.playCardFromOutOfPlay({
                                target: topCardOfDeck,
                                playAsType: WildcardCardType.Any,
                                adjustCost: { amount: 1, costAdjustType: CostAdjustType.Decrease }
                            })
                        },
                        {
                            text: 'Discard it',
                            arg: 'discard',
                            immediateEffect: abilityHelper.immediateEffects.discardSpecificCard({ target: topCardOfDeck })
                        },
                        {
                            text: 'Leave on top',
                            arg: 'leave',
                            immediateEffect: abilityHelper.immediateEffects.noAction({ hasLegalTarget: true })
                        }
                    ]
                };
            })
        });
    }
}
