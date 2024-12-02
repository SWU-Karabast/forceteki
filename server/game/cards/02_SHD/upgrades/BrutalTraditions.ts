import AbilityHelper from '../../../AbilityHelper';
import { StateWatcherRegistrar } from '../../../core/stateWatcher/StateWatcherRegistrar';
import { ZoneName } from '../../../core/Constants';
import { UpgradeCard } from '../../../core/card/UpgradeCard';
import { UnitsDefeatedThisPhaseWatcher } from '../../../stateWatchers/UnitsDefeatedThisPhaseWatcher';

export default class BrutalTraditions extends UpgradeCard {
    private unitsDefeatedThisPhaseWatcher: UnitsDefeatedThisPhaseWatcher;

    protected override getImplementationId() {
        return {
            id: '4843813137',
            internalName: 'brutal-traditions'
        };
    }

    protected override setupStateWatchers(registrar: StateWatcherRegistrar): void {
        this.unitsDefeatedThisPhaseWatcher = AbilityHelper.stateWatchers.unitsDefeatedThisPhase(registrar, this);
    }

    public override setupCardAbilities() {
        this.addActionAbility({
            title: 'If an enemy unit was defeated this phase, play this upgrade from your discard pile',
            condition: (context) => this.unitsDefeatedThisPhaseWatcher.someDefeatedUnitsControlledByPlayer(context.source.controller.opponent),
            immediateEffect: AbilityHelper.immediateEffects.playCardFromOutOfPlay(),
            zoneFilter: ZoneName.Discard
        });
    }
}

BrutalTraditions.implemented = true;
