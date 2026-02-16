import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import type { StateWatcherRegistrar } from '../../../core/stateWatcher/StateWatcherRegistrar';
import type { UnitsDefeatedThisPhaseWatcher } from '../../../stateWatchers/UnitsDefeatedThisPhaseWatcher';
import * as AttackHelpers from '../../../core/attack/AttackHelpers';

export default class FettsFiresprayInPursuit extends NonLeaderUnitCard {
    private unitsDefeatedThisPhaseWatcher: UnitsDefeatedThisPhaseWatcher;

    protected override getImplementationId() {
        return {
            id: '9215774796',
            internalName: 'fetts-firespray#in-pursuit',
        };
    }

    protected override setupStateWatchers(registrar: StateWatcherRegistrar, AbilityHelper: IAbilityHelper): void {
        this.unitsDefeatedThisPhaseWatcher = AbilityHelper.stateWatchers.unitsDefeatedThisPhase();
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addOnAttackCompletedAbility({
            title: 'If the defending unit was defeated, create a Credit token',
            immediateEffect: AbilityHelper.immediateEffects.conditional({
                condition: (context) => AttackHelpers.defenderWasDefeated(context.event.attack, this.unitsDefeatedThisPhaseWatcher),
                onTrue: AbilityHelper.immediateEffects.createCreditToken(),
            })
        });
    }
}
