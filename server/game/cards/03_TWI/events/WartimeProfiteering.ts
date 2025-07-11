import { EventCard } from '../../../core/card/EventCard';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import AbilityHelper from '../../../AbilityHelper';
import type { StateWatcherRegistrar } from '../../../core/stateWatcher/StateWatcherRegistrar';
import type { UnitsDefeatedThisPhaseWatcher } from '../../../stateWatchers/UnitsDefeatedThisPhaseWatcher';

export default class WartimeProfiteering extends EventCard {
    private unitsDefeatedThisPhaseWatcher: UnitsDefeatedThisPhaseWatcher;

    protected override getImplementationId() {
        return {
            id: '3459567689',
            internalName: 'wartime-profiteering'
        };
    }

    protected override setupStateWatchers(registrar: StateWatcherRegistrar): void {
        this.unitsDefeatedThisPhaseWatcher = AbilityHelper.stateWatchers.unitsDefeatedThisPhase(registrar, this);
    }

    public override setupCardAbilities(registrar: IEventAbilityRegistrar) {
        registrar.setEventAbility({
            title: 'Look at cards from the top of your deck equal to the number of units that were defeated this phase. Draw 1 and put the others on the bottom of your deck in a random order',
            immediateEffect: AbilityHelper.immediateEffects.deckSearch({
                revealSelected: false,
                searchCount: () => this.unitsDefeatedThisPhaseWatcher.getCurrentValue().length,
                selectedCardsImmediateEffect: AbilityHelper.immediateEffects.drawSpecificCard()
            })
        });
    }
}
