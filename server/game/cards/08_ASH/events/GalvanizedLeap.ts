import type { IAbilityHelper } from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { WildcardCardType } from '../../../core/Constants';
import type { StateWatcherRegistrar } from '../../../core/stateWatcher/StateWatcherRegistrar';
import type { UnitsDamagedThisPhaseWatcher } from '../../../stateWatchers/UnitsDamagedThisPhaseWatcher';

export default class GalvanizedLeap extends EventCard {
    private unitsDamagedThisPhaseWatcher: UnitsDamagedThisPhaseWatcher;

    protected override getImplementationId() {
        return {
            id: '9496039852',
            internalName: 'galvanized-leap',
        };
    }

    protected override setupStateWatchers(registrar: StateWatcherRegistrar, AbilityHelper: IAbilityHelper): void {
        this.unitsDamagedThisPhaseWatcher = AbilityHelper.stateWatchers.unitsDamagedThisPhase();
    }

    public override setupCardAbilities(registrar: IEventAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.setEventAbility({
            title: 'Ready a unit that was damaged this phase',
            targetResolver: {
                cardTypeFilter: WildcardCardType.Unit,
                cardCondition: (card) => card.isUnit() && this.unitsDamagedThisPhaseWatcher.wasDamagedThisPhase(card, card.inPlayId),
                immediateEffect: AbilityHelper.immediateEffects.ready(),
            }
        });
    }
}