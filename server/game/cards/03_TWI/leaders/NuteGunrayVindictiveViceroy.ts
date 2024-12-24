import AbilityHelper from '../../../AbilityHelper';
import { LeaderUnitCard } from '../../../core/card/LeaderUnitCard';
import { StateWatcherRegistrar } from '../../../core/stateWatcher/StateWatcherRegistrar';
import { UnitsDefeatedThisPhaseWatcher } from '../../../stateWatchers/UnitsDefeatedThisPhaseWatcher';

export default class NuteGunrayVindictiveViceroy extends LeaderUnitCard {
    private unitsDefeatedThisPhaseWatcher: UnitsDefeatedThisPhaseWatcher;

    protected override getImplementationId() {
        return {
            id: '6064906790',
            internalName: 'nute-gunray#vindictive-viceroy',
        };
    }

    protected override setupStateWatchers(registrar: StateWatcherRegistrar): void {
        this.unitsDefeatedThisPhaseWatcher = AbilityHelper.stateWatchers.unitsDefeatedThisPhase(registrar, this);
    }

    protected override setupLeaderSideAbilities() {
        this.addActionAbility({
            title: 'Create a Battle Droid token.',
            cost: AbilityHelper.costs.exhaustSelf(),
            immediateEffect: AbilityHelper.immediateEffects.conditional({
                condition: (context) => this.unitsDefeatedThisPhaseWatcher.getDefeatedUnitsControlledByPlayer(context.source.controller).length >= 2,
                onTrue: AbilityHelper.immediateEffects.createBattleDroid(),
                onFalse: AbilityHelper.immediateEffects.noAction()
            })
        });
    }

    protected override setupLeaderUnitSideAbilities() {
        this.addOnAttackAbility({
            title: 'create a Battle Droid token.',
            immediateEffect: AbilityHelper.immediateEffects.createBattleDroid()
        });
    }
}

NuteGunrayVindictiveViceroy.implemented = true;
