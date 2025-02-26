import AbilityHelper from '../../../AbilityHelper';
import { LeaderUnitCard } from '../../../core/card/LeaderUnitCard';
import { KeywordName, WildcardCardType } from '../../../core/Constants';
import type { StateWatcherRegistrar } from '../../../core/stateWatcher/StateWatcherRegistrar';
import type { CardsDrawnThisPhaseWatcher } from '../../../stateWatchers/CardsDrawnThisPhaseWatcher';

export default class PreVizslaPursuingTheThrone extends LeaderUnitCard {
    private cardsDrawnThisPhaseWatcher: CardsDrawnThisPhaseWatcher;

    protected override getImplementationId() {
        return {
            id: '5081383630',
            internalName: 'pre-vizsla#pursuing-the-throne',
        };
    }

    protected override setupStateWatchers(registrar: StateWatcherRegistrar): void {
        this.cardsDrawnThisPhaseWatcher = AbilityHelper.stateWatchers.cardsDrawnThisPhase(registrar, this);
    }

    protected override setupLeaderSideAbilities() {
        this.addActionAbility({
            title: 'Deal damage to a unit equal to the number of cards you\'ve drawn this phase',
            cost: [AbilityHelper.costs.exhaustSelf(), AbilityHelper.costs.abilityResourceCost(1)],
            targetResolver: {
                cardTypeFilter: WildcardCardType.Unit,
                immediateEffect: AbilityHelper.immediateEffects.damage((context) => ({
                    amount: this.cardsDrawnThisPhaseWatcher.drawnCardsAmount(context.source.controller)
                }))
            }
        });
    }

    protected override setupLeaderUnitSideAbilities() {
        this.addConstantAbility({
            title: 'While you have 3 or more cards in your hand, this unit gains Saboteur',
            condition: (context) => context.source.controller.hand.length >= 3,
            ongoingEffect: AbilityHelper.ongoingEffects.gainKeyword(KeywordName.Saboteur)
        });

        this.addConstantAbility({
            title: 'While you have 6 or more cards in your hand, this unit gets +2/+0',
            condition: (context) => context.source.controller.hand.length >= 6,
            ongoingEffect: AbilityHelper.ongoingEffects.modifyStats({ power: 2, hp: 0 })
        });
    }
}
