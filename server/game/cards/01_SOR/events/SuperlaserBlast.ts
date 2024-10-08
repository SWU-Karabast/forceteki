import AbilityHelper from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import { AttacksThisPhaseWatcher } from '../../../stateWatchers/AttacksThisPhaseWatcher';
import { StateWatcherRegistrar } from '../../../core/stateWatcher/StateWatcherRegistrar';

export default class SuperlaserBlast extends EventCard {
    private attacksThisPhaseWatcher: AttacksThisPhaseWatcher;

    protected override getImplementationId() {
        return {
            id: '1353201082',
            internalName: 'superlaser-blast',
        };
    }

    protected override setupStateWatchers(registrar: StateWatcherRegistrar) {
        this.attacksThisPhaseWatcher = AbilityHelper.stateWatchers.attacksThisPhase(registrar, this);
    }

    public override setupCardAbilities() {
        this.setEventAbility({
            title: 'Defeat all units',
            immediateEffect: AbilityHelper.immediateEffects.defeat((context) => {
                const allUnits = context.player.getUnitsInPlay().concat(context.player.opponent.getUnitsInPlay());
                return { target: allUnits };
            })
        });
    }
}

SuperlaserBlast.implemented = true;