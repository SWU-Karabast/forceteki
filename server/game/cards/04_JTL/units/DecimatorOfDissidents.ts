import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import type { StateWatcherRegistrar } from '../../../core/stateWatcher/StateWatcherRegistrar';
import type { DamageDealtThisPhaseWatcher } from '../../../stateWatchers/DamageDealtThisPhaseWatcher';

export default class DecimatorOfDissidents extends NonLeaderUnitCard {
    private damageDealtThisPhaseWatcher: DamageDealtThisPhaseWatcher;

    protected override getImplementationId() {
        return {
            id: '6576881465',
            internalName: 'decimator-of-dissidents',
        };
    }

    protected override setupStateWatchers(registrar: StateWatcherRegistrar): void {
        this.damageDealtThisPhaseWatcher = AbilityHelper.stateWatchers.damageDealtThisPhase(registrar, this);
    }

    public override setupCardAbilities() {
        this.addDecreaseCostAbility({
            title: 'If you dealt indirect damage this phase, this unit costs 1 resource less to play',
            condition: (context) => this.damageDealtThisPhaseWatcher.playerHasDealtDamage(context.player, (e) => e.isIndirect),
            amount: 1
        });
    }
}
