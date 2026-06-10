import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import type { StateWatcherRegistrar } from '../../../core/stateWatcher/StateWatcherRegistrar';
import type { CardsDefeatedThisPhaseWatcher } from '../../../stateWatchers/CardsDefeatedThisPhaseWatcher';

export default class TantiveIVCarryingHope extends NonLeaderUnitCard {
    private cardsDefeatedThisPhaseWatcher: CardsDefeatedThisPhaseWatcher;

    protected override getImplementationId() {
        return {
            id: '4287527709',
            internalName: 'tantive-iv#carrying-hope',
        };
    }

    protected override setupStateWatchers (registrar: StateWatcherRegistrar, AbilityHelper: IAbilityHelper): void {
        this.cardsDefeatedThisPhaseWatcher = AbilityHelper.stateWatchers.cardsDefeatedThisPhase();
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, abilityHelper: IAbilityHelper) {
        registrar.addWhenPlayedAbility({
            title: 'Heal 4 damage from your base',
            immediateEffect: abilityHelper.immediateEffects.conditional({
                condition: (context) => this.cardsDefeatedThisPhaseWatcher.someDefeatedUnitControlledByPlayer(context.player),
                onTrue: abilityHelper.immediateEffects.heal((context) => ({
                    target: context.player.base,
                    amount: 4
                }))
            })
        });
    }
}