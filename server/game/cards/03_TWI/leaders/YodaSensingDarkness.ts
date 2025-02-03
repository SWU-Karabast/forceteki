import AbilityHelper from '../../../AbilityHelper';
import { LeaderUnitCard } from '../../../core/card/LeaderUnitCard';
import { RelativePlayer, WildcardCardType, WildcardZoneName, ZoneName } from '../../../core/Constants';
import type { StateWatcherRegistrar } from '../../../core/stateWatcher/StateWatcherRegistrar';
import type { CardsLeftPlayThisPhaseWatcher } from '../../../stateWatchers/CardsLeftPlayThisPhaseWatcher';

export default class YodaSensingDarkness extends LeaderUnitCard {
    private cardsLeftPlayThisPhaseWatcher: CardsLeftPlayThisPhaseWatcher;

    protected override getImplementationId() {
        return {
            id: '2847868671',
            internalName: 'yoda#sensing-darkness',
        };
    }

    protected override setupStateWatchers(registrar: StateWatcherRegistrar): void {
        this.cardsLeftPlayThisPhaseWatcher = AbilityHelper.stateWatchers.cardsLeftPlayThisPhase(registrar, this);
    }

    protected override setupLeaderSideAbilities() {
        this.addActionAbility({
            title: 'If a unit left play this phase, draw a card, then put a card from your hand on the top or bottom of your deck.',
            cost: [AbilityHelper.costs.exhaustSelf()],
            immediateEffect: AbilityHelper.immediateEffects.conditional({
                condition: () => this.cardsLeftPlayThisPhaseWatcher.someCardLeftPlay({ filter: (entry) => entry.card.isUnit() }),
                onFalse: AbilityHelper.immediateEffects.noAction(),
                onTrue: AbilityHelper.immediateEffects.draw({ amount: 1 })
            }),
            then: {
                title: 'Select a card from your hand to put on the top or bottom of your deck',
                thenCondition: () => this.cardsLeftPlayThisPhaseWatcher.someCardLeftPlay({ filter: (entry) => entry.card.isUnit() }),
                targetResolver: {
                    activePromptTitle: 'Select a card to put on the top or bottom of your deck',
                    controller: RelativePlayer.Self,
                    zoneFilter: ZoneName.Hand,
                    canChooseNoCards: false,
                    immediateEffect: AbilityHelper.immediateEffects.chooseModalEffects((context) => ({
                        amountOfChoices: 1,
                        choices: () => ({
                            ['Top']: AbilityHelper.immediateEffects.moveToTopOfDeck({ target: context.target }),
                            ['Bottom']: AbilityHelper.immediateEffects.moveToBottomOfDeck({ target: context.target }),
                        })
                    }))
                }
            }
        });
    }

    protected override setupLeaderUnitSideAbilities() {
        this.addTriggeredAbility({
            title: 'You may discard the top card from your deck. If you do, defeat an enemy non-leader unit with cost equal to or less than the cost of the discarded card.',
            optional: true,
            when: {
                onLeaderDeployed: (event, context) => event.card === context.source
            },
            immediateEffect: AbilityHelper.immediateEffects.sequential((context) => ([
                AbilityHelper.immediateEffects.discardFromDeck({ amount: 1, target: context.source.controller }),
                AbilityHelper.immediateEffects.selectCard((selectContext) => ({
                    title: 'Defeat a non-leader unit that costs equal to or less than the discarded card',
                    controller: RelativePlayer.Opponent,
                    zoneFilter: WildcardZoneName.AnyArena,
                    // TODO: if I move the card type check to the cardCondition, i get 'Cannot read properties of undefined (reading 'cardCondition')' - ask Veld about this
                    cardTypeFilter: WildcardCardType.NonLeaderUnit,
                    cardCondition: (card) => card.hasCost() && card.cost <= selectContext.events[0].card.printedCost,
                    innerSystem: AbilityHelper.immediateEffects.defeat()
                }))
            ]))
        });
    }
}
