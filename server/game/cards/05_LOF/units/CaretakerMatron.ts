import AbilityHelper from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { Trait } from '../../../core/Constants';
import type { StateWatcherRegistrar } from '../../../core/stateWatcher/StateWatcherRegistrar';
import type { CardsPlayedThisPhaseWatcher } from '../../../stateWatchers/CardsPlayedThisPhaseWatcher';

export default class CaretakerMatron extends NonLeaderUnitCard {
    private cardsPlayedThisPhaseWatcher: CardsPlayedThisPhaseWatcher;

    protected override getImplementationId() {
        return {
            id: 'caretaker-matron-id',
            internalName: 'caretaker-matron',
        };
    }

    protected override setupStateWatchers(registrar: StateWatcherRegistrar) {
        this.cardsPlayedThisPhaseWatcher = AbilityHelper.stateWatchers.cardsPlayedThisPhase(registrar, this);
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar) {
        registrar.addActionAbility({
            title: 'Draw a card',
            cost: AbilityHelper.costs.exhaustSelf(),
            immediateEffect: AbilityHelper.immediateEffects.conditional({
                condition: (context) => this.cardsPlayedThisPhaseWatcher.someCardPlayed((entry) => entry.playedBy === context.player && entry.card.hasSomeTrait(Trait.Force)),
                onTrue: AbilityHelper.immediateEffects.draw(),
            })
        });
    }
}