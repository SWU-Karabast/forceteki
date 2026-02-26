import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { EventName, Trait, WildcardCardType } from '../../../core/Constants';
import { CostAdjustType } from '../../../core/cost/CostAdjuster';
import type { UnitsDefeatedThisPhaseWatcher } from '../../../stateWatchers/UnitsDefeatedThisPhaseWatcher';
import type { StateWatcherRegistrar } from '../../../core/stateWatcher/StateWatcherRegistrar';
import * as AttackHelpers from '../../../core/attack/AttackHelpers';

export default class TheInvisibleHandCrawlingWithVultures extends NonLeaderUnitCard {
    private unitsDefeatedThisPhaseWatcher: UnitsDefeatedThisPhaseWatcher;

    protected override getImplementationId() {
        return {
            id: '7138400365',
            internalName: 'the-invisible-hand#crawling-with-vultures'
        };
    }

    protected override setupStateWatchers(registrar: StateWatcherRegistrar, AbilityHelper: IAbilityHelper): void {
        this.unitsDefeatedThisPhaseWatcher = AbilityHelper.stateWatchers.unitsDefeatedThisPhase();
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addTriggeredAbility({
            title: 'Search the top 8 cards of your deck for a Droid unit, reveal it, and draw it. If it costs 2 or less, you may play it for free.',
            when: {
                whenPlayed: true,
                onAttackEnd: (event, context) => event.attack.attacker === context.source
            },
            immediateEffect: AbilityHelper.immediateEffects.conditional({
                condition: (context) =>
                    context.event.name !== EventName.OnAttackEnd ||
                    AttackHelpers.attackerSurvived(context.event.attack, this.unitsDefeatedThisPhaseWatcher),
                onTrue: AbilityHelper.immediateEffects.deckSearch({
                    searchCount: 8,
                    cardCondition: (card, _context) => card.isUnit() && card.hasSomeTrait(Trait.Droid),
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
                                            immediateEffect: AbilityHelper.immediateEffects.playCardFromHand({ target: drawnDroid, adjustCost: { costAdjustType: CostAdjustType.Free }, playAsType: WildcardCardType.Unit })
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
            }),
            ifYouDo: {
                title: 'Play the card for free',
                ifYouDoCondition: (context) => context.events[0]?.card?.cost <= 2,
                optional: true,
                immediateEffect: AbilityHelper.immediateEffects.playCardFromHand((context) => ({ target: context.events[0].card,
                    adjustCost: { costAdjustType: CostAdjustType.Free }, playAsType: WildcardCardType.Unit }
                ))
            }
        });
    }
}
