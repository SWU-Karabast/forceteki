import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import type { StateWatcherRegistrar } from '../../../core/stateWatcher/StateWatcherRegistrar';
import type { CardsEnteredPlayThisPhaseWatcher } from '../../../stateWatchers/CardsEnteredPlayThisPhaseWatcher';

export default class DisposableB1 extends NonLeaderUnitCard {
    private cardsEnteredPlayThisPhaseWatcher: CardsEnteredPlayThisPhaseWatcher;

    protected override getImplementationId() {
        return {
            id: 'disposable-b1-id',
            internalName: 'disposable-b1'
        };
    }

    protected override setupStateWatchers(registrar: StateWatcherRegistrar, AbilityHelper: IAbilityHelper) {
        this.cardsEnteredPlayThisPhaseWatcher = AbilityHelper.stateWatchers.cardsEnteredPlayThisPhase();
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addWhenPlayedAbility({
            title: 'If another friendly unit entered play this phase, draw a card',
            immediateEffect: AbilityHelper.immediateEffects.conditional({
                condition: (context) => this.cardsEnteredPlayThisPhaseWatcher.someCardEnteredPlay((entry) =>
                    entry.playedBy === context.player && entry.card !== context.source
                ),
                onTrue: AbilityHelper.immediateEffects.draw()
            })
        });
    }
}
