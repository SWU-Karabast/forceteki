import AbilityHelper from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import { WildcardCardType } from '../../../core/Constants';
import type { StateWatcherRegistrar } from '../../../core/stateWatcher/StateWatcherRegistrar';
import type { UnitsDefeatedThisPhaseWatcher } from '../../../stateWatchers/UnitsDefeatedThisPhaseWatcher';

export default class LastWords extends EventCard {
    private unitsDefeatedThisPhaseWatcher: UnitsDefeatedThisPhaseWatcher;

    protected override getImplementationId() {
        return {
            id: '4371455331',
            internalName: 'last-words',
        };
    }

    protected override setupStateWatchers(registrar: StateWatcherRegistrar): void {
        this.unitsDefeatedThisPhaseWatcher = AbilityHelper.stateWatchers.unitsDefeatedThisPhase(registrar, this);
    }

    public override setupCardAbilities(card: this) {
        card.setEventAbility({
            title: 'If a friendly unit has been defeated this phase, give 2 Experience tokens to a unit',
            targetResolver: {
                cardTypeFilter: WildcardCardType.Unit,
                immediateEffect: AbilityHelper.immediateEffects.conditional({
                    condition: (context) => this.unitsDefeatedThisPhaseWatcher.someDefeatedUnitControlledByPlayer(context.player),
                    onTrue: AbilityHelper.immediateEffects.giveExperience({ amount: 2 }),
                })
            }
        });
    }
}
