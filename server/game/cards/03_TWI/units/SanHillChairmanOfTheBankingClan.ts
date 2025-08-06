import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import type { StateWatcherRegistrar } from '../../../core/stateWatcher/StateWatcherRegistrar';
import type { UnitsDefeatedThisPhaseWatcher } from '../../../stateWatchers/UnitsDefeatedThisPhaseWatcher';

export default class SanHillChairmanOfTheBankingClan extends NonLeaderUnitCard {
    private unitsDefeatedThisPhaseWatcher: UnitsDefeatedThisPhaseWatcher;

    protected override getImplementationId () {
        return {
            id: '0021045666',
            internalName: 'san-hill#chairman-of-the-banking-clan'
        };
    }

    protected override setupStateWatchers(registrar: StateWatcherRegistrar, AbilityHelper: IAbilityHelper): void {
        this.unitsDefeatedThisPhaseWatcher = AbilityHelper.stateWatchers.unitsDefeatedThisPhase(registrar, this);
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addOnAttackAbility({
            title: 'For each friendly unit that was defeated this phase, ready a friendly resource.',
            immediateEffect: AbilityHelper.immediateEffects.readyResources((context) => ({
                target: context.player,
                amount: this.unitsDefeatedThisPhaseWatcher.getDefeatedUnitsControlledByPlayer(context.player).length
            }))
        });
    }
}