import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { Trait } from '../../../core/Constants';
import { CostAdjustType } from '../../../core/cost/CostAdjuster';
import * as EnumHelpers from '../../../core/utils/EnumHelpers';

export default class TheInvisibleHandCrawlingWithVultures extends NonLeaderUnitCard {
    protected override getImplementationId() {
        return {
            id: '7138400365',
            internalName: 'the-invisible-hand#crawling-with-vultures'
        };
    }

    public override setupCardAbilities() {
        this.addTriggeredAbility({
            title: 'Search the top 8 cards of your deck for a Droid unit, reveal it, and draw it. If it costs 2 or less, you may play it for free.',
            when: {
                onCardPlayed: (event, context) => event.card === context.source,
                onAttackCompleted: (event, context) => event.attack.attacker === context.source
            },
            immediateEffect: AbilityHelper.immediateEffects.deckSearch({
                searchCount: 8,
                cardCondition: (card) => EnumHelpers.isUnit(card.type) && card.hasSomeTrait(Trait.Droid),
                selectedCardsImmediateEffect: AbilityHelper.immediateEffects.sequential([
                    AbilityHelper.immediateEffects.drawSpecificCard(),
                    AbilityHelper.immediateEffects.conditional({
                        condition: (context) => context.selectedPromptCards[0].hasCost() && context.selectedPromptCards[0].cost <= 2,
                        onTrue: AbilityHelper.immediateEffects.lookAtAndChooseOption((context) => {
                            const drawnDroid = context.selectedPromptCards[0];
                            return {
                                useDisplayPrompt: true,
                                target: drawnDroid,
                                perCardButtons: [
                                    {
                                        text: 'Play it for free',
                                        arg: 'play',
                                        immediateEffect: AbilityHelper.immediateEffects.playCardFromHand({ target: drawnDroid, adjustCost: { costAdjustType: CostAdjustType.Free } })
                                    },
                                    {
                                        text: 'Leave it in your hand',
                                        arg: 'leave',
                                        immediateEffect: AbilityHelper.immediateEffects.noAction({ hasLegalTarget: true })
                                    }
                                ]
                            };
                        }),
                    })
                ])
            }),
            ifYouDo: {
                title: 'Play the card for free',
                ifYouDoCondition: (context) => context.events[0]?.card?.cost <= 2,
                optional: true,
                immediateEffect: AbilityHelper.immediateEffects.playCardFromHand((context) => ({ target: context.events[0].card,
                    adjustCost: { costAdjustType: CostAdjustType.Free } }
                ))
            }
        });
    }
}
