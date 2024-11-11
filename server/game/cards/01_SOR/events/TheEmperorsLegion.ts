import AbilityHelper from '../../../AbilityHelper';
import { StateWatcherRegistrar } from '../../../core/stateWatcher/StateWatcherRegistrar';
import { UnitsDefeatedThisPhaseWatcher } from '../../../stateWatchers/UnitsDefeatedThisPhaseWatcher';
import { EventCard } from '../../../core/card/EventCard';
import { Location } from '../../../core/Constants';

export default class TheEmperorsLegion extends EventCard {
    private unitsDefeatedThisPhaseWatcher: UnitsDefeatedThisPhaseWatcher;

    protected override getImplementationId () {
        return {
            id: '9785616387',
            internalName: 'the-emperors-legion'
        };
    }

    protected override setupStateWatchers(registrar: StateWatcherRegistrar): void {
        this.unitsDefeatedThisPhaseWatcher = AbilityHelper.stateWatchers.unitsDefeatedThisPhase(registrar, this);
    }

    public override setupCardAbilities () {
        this.setEventAbility({
            title: 'Return each unit in your discard pile that was defeated this phase to your hand.',
            immediateEffect: AbilityHelper.immediateEffects.returnToHand((context) => {
                const friendlyUnitsDefeatedThisPhaseInDiscard =
                    this.unitsDefeatedThisPhaseWatcher.getDefeatedUnitsControlledByPlayer(context.source.controller)
                        .filter((card) => card.location === Location.Discard);
                return { target: friendlyUnitsDefeatedThisPhaseInDiscard };
            })
        });
    }
}

TheEmperorsLegion.implemented = true;
