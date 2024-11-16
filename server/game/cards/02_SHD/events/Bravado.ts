import AbilityHelper from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import { WildcardCardType } from '../../../core/Constants';
import { StateWatcherRegistrar } from '../../../core/stateWatcher/StateWatcherRegistrar';
import { UnitsDefeatedThisPhaseWatcher } from '../../../stateWatchers/UnitsDefeatedThisPhaseWatcher';

export default class Bravado extends EventCard {
    private unitsDefeatedThisPhaseWatcher: UnitsDefeatedThisPhaseWatcher;

    protected override getImplementationId() {
        return {
            id: '7212445649',
            internalName: 'bravado',
        };
    }

    protected override setupStateWatchers(registrar: StateWatcherRegistrar) {
        this.unitsDefeatedThisPhaseWatcher = AbilityHelper.stateWatchers.unitsDefeatedThisPhase(registrar, this);
    }

    public override setupCardAbilities() {
        this.addDecreaseCostAbility({
            title: 'If you’ve defeated an enemy unit this phase, this event costs 2 resources less to play',
            condition: (context) => this.unitsDefeatedThisPhaseWatcher.getDefeatedUnits(context.source.controller.opponent, context.source.controller).length > 0,
            amount: 2
        });

        this.setEventAbility({
            title: 'Ready a unit',
            targetResolver: {
                cardTypeFilter: WildcardCardType.Unit,
                immediateEffect: AbilityHelper.immediateEffects.ready(),
            }
        });
    }
}

Bravado.implemented = true;
