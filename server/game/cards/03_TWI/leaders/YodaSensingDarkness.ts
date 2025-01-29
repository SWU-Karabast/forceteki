import AbilityHelper from '../../../AbilityHelper';
import { LeaderUnitCard } from '../../../core/card/LeaderUnitCard';
import { RelativePlayer, WildcardCardType, ZoneName } from '../../../core/Constants';
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
                onTrue: AbilityHelper.immediateEffects.sequential([
                    AbilityHelper.immediateEffects.draw({ amount: 1 }),
                    AbilityHelper.immediateEffects.selectCard({
                        activePromptTitle: 'Select a card to put on the top or bottom of your deck',
                        cardTypeFilter: WildcardCardType.Any,
                        controller: RelativePlayer.Self,
                        zoneFilter: ZoneName.Hand,
                        optional: false,
                        innerSystem: AbilityHelper.immediateEffects.chooseModalEffects({
                            amountOfChoices: 1,
                            choices: () => ({
                                ['Top']: AbilityHelper.immediateEffects.moveToTopOfDeck({}),
                                ['Bottom']: AbilityHelper.immediateEffects.moveToBottomOfDeck({}),
                            })
                        })
                    })
                ])
            })
        });
    }

    protected override setupLeaderUnitSideAbilities() {
        this.addTriggeredAbility({
            title: 'You may discard the top card from your deck. If you do, defeat an enemy non-leader unit with cost equal to or less than the cost of the discarded card.',
            optional: true,
            when: {
                onLeaderDeployed: (event, context) => event.card === context.source
            },
            immediateEffect: AbilityHelper.immediateEffects.discardFromDeck({ amount: 1 }),
            ifYouDo: (ifYouDoContext) => ({
                title: 'Defeat a non-leader unit that costs equal to or less than the discarded card',
                targetResolver: {
                    controller: RelativePlayer.Opponent,
                    cardTypeFilter: WildcardCardType.NonLeaderUnit,
                    condition: (card) => card.cost <= ifYouDoContext.events[0].card.printedCost,
                    immediateEffect: AbilityHelper.immediateEffects.defeat()
                }
            })
        });
    }
}
