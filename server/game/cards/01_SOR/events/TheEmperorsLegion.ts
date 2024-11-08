import AbilityHelper from '../../../AbilityHelper';
import {StateWatcherRegistrar} from '../../../core/stateWatcher/StateWatcherRegistrar';
import {UnitsDefeatedThisPhaseWatcher} from '../../../stateWatchers/UnitsDefeatedThisPhaseWatcher';
import {EventCard} from '../../../core/card/EventCard';
import {KeywordName, Location, WildcardCardType} from '../../../core/Constants';
import {UnitCard} from '../../../core/card/CardTypes';

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
            targetResolver: {
                locationFilter: Location.Discard,
                cardTypeFilter: WildcardCardType.Unit,
                cardCondition: (card) => this.unitsDefeatedThisPhaseWatcher.getDefeatedUnitsControlledByPlayer(this.controller).includes(card as UnitCard),
                immediateEffect: AbilityHelper.immediateEffects.returnToHand()
            },
            // immediateEffect: AbilityHelper.immediateEffects.returnToHand({
            //     target: this.unitsDefeatedThisPhaseWatcher.getDefeatedUnitsControlledByPlayer(this.controller)
            // })
        });
    }
}

TheEmperorsLegion.implemented = true;
