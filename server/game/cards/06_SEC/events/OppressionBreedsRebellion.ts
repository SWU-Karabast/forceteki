import type { IAbilityHelper } from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import type { StateWatcherRegistrar } from '../../../core/stateWatcher/StateWatcherRegistrar';
import type { UnitsDefeatedThisPhaseWatcher } from '../../../stateWatchers/UnitsDefeatedThisPhaseWatcher';

export default class OppressionBreedsRebellion extends EventCard {
    private unitsDefeatedThisPhaseWatcher: UnitsDefeatedThisPhaseWatcher;
    protected override getImplementationId() {
        return {
            id: '3208071698',
            internalName: 'oppression-breeds-rebellion',
        };
    }

    protected override setupStateWatchers(registrar: StateWatcherRegistrar, AbilityHelper: IAbilityHelper): void {
        this.unitsDefeatedThisPhaseWatcher = AbilityHelper.stateWatchers.unitsDefeatedThisPhase(registrar, this);
    }

    public override setupCardAbilities(registrar: IEventAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.setEventAbility({
            title: 'If a friendly unit was defeated while attacking this phase, draw 3 cards',
            immediateEffect: AbilityHelper.immediateEffects.conditional({
                condition: (context) => this.unitsDefeatedThisPhaseWatcher.someDefeatedWhileAttackingUnitControlledByPlayer(context.player),
                onTrue: AbilityHelper.immediateEffects.draw({ amount: 3 })
            })
        });
    }
}