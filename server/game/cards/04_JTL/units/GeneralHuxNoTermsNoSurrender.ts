import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { KeywordName, Trait } from '../../../core/Constants';
import type { StateWatcherRegistrar } from '../../../core/stateWatcher/StateWatcherRegistrar';
import type { CardsPlayedThisPhaseWatcher } from '../../../stateWatchers/CardsPlayedThisPhaseWatcher';

export default class GeneralHuxNoTermsNoSurrender extends NonLeaderUnitCard {
    private cardsPlayedThisPhaseWatcher: CardsPlayedThisPhaseWatcher;

    protected override getImplementationId() {
        return {
            id: '9921128444',
            internalName: 'general-hux#no-terms-no-surrender',
        };
    }

    protected override setupStateWatchers(registrar: StateWatcherRegistrar) {
        this.cardsPlayedThisPhaseWatcher = AbilityHelper.stateWatchers.cardsPlayedThisPhase(registrar, this);
    }

    public override setupCardAbilities() {
        this.addConstantAbility({
            title: 'Each other friendly First Order unit gains Raid 1',
            matchTarget: (card, context) => card !== context.source && card.isUnit() && card.hasSomeTrait(Trait.FirstOrder),
            ongoingEffect: AbilityHelper.ongoingEffects.gainKeyword({ keyword: KeywordName.Raid, amount: 1 })
        });

        this.addActionAbility({
            title: 'Draw a card',
            cost: AbilityHelper.costs.exhaustSelf(),
            immediateEffect: AbilityHelper.immediateEffects.conditional({
                condition: (context) => this.cardsPlayedThisPhaseWatcher.someCardPlayed((entry) => entry.playedBy === context.player && entry.card.hasSomeTrait(Trait.FirstOrder)),
                onTrue: AbilityHelper.immediateEffects.draw(),
                onFalse: AbilityHelper.immediateEffects.noAction(),
            })
        });
    }
}
