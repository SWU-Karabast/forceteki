import AbilityHelper from '../../../AbilityHelper';
import { StateWatcherRegistrar } from '../../../core/stateWatcher/StateWatcherRegistrar';
import { Location } from '../../../core/Constants';
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
            condition: (context) => {
                const opponentUnitsDefeatedThisPhase = this.unitsDefeatedThisPhaseWatcher.getDefeatedUnitsControlledByPlayer(context.source.controller.opponent);
                return opponentUnitsDefeatedThisPhase.length > 0;
            },
            immediateEffect: AbilityHelper.immediateEffects.playCardFromOutOfPlay(),
            locationFilter: Location.Discard
        });
    }
}

BrutalTraditions.implemented = true;
