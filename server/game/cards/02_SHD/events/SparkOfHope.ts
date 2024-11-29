import AbilityHelper from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import { StateWatcherRegistrar } from '../../../core/stateWatcher/StateWatcherRegistrar';
import { UnitsDefeatedThisPhaseWatcher } from '../../../stateWatchers/UnitsDefeatedThisPhaseWatcher';
import { RelativePlayer, WildcardCardType, ZoneName } from '../../../core/Constants';
import { UnitCard } from '../../../core/card/CardTypes';

export default class SparkOfHope extends EventCard {
    private unitsDefeatedThisPhaseWatcher: UnitsDefeatedThisPhaseWatcher;

    protected override getImplementationId() {
        return {
            id: '9828896088',
            internalName: 'spark-of-hope',
        };
    }

    protected override setupStateWatchers(registrar: StateWatcherRegistrar): void {
        this.unitsDefeatedThisPhaseWatcher = AbilityHelper.stateWatchers.unitsDefeatedThisPhase(registrar, this);
    }

    public override setupCardAbilities() {
        this.setEventAbility({
            title: 'Put into play as a resource a unit that was defeated this phase',
            targetResolver: {
                cardTypeFilter: WildcardCardType.Unit,
                zoneFilter: ZoneName.Discard,
                controller: RelativePlayer.Self,
                // TODO CHECK UNIQUE ID WHEN IT'S DONE
                cardCondition: (card) =>
                    this.unitsDefeatedThisPhaseWatcher.getCurrentValue()
                        .map((e) => e.unit)
                        .includes(card as UnitCard),
                immediateEffect: AbilityHelper.immediateEffects.resourceCard()
            }
        });
    }
}

SparkOfHope.implemented = true;
