import { EventCard } from '../../../core/card/EventCard';
import AbilityHelper from '../../../AbilityHelper';
import { WildcardCardType } from '../../../core/Constants';
import type { StateWatcherRegistrar } from '../../../core/stateWatcher/StateWatcherRegistrar';
import type { CardsEnteredPlayThisPhaseWatcher } from '../../../stateWatchers/CardsEnteredPlayThisPhaseWatcher';

export default class HelloThere extends EventCard {
    private enteredPlayWatcher: CardsEnteredPlayThisPhaseWatcher;

    protected override getImplementationId() {
        return {
            id: '4036958275',
            internalName: 'hello-there'
        };
    }

    protected override setupStateWatchers(registrar: StateWatcherRegistrar): void {
        this.enteredPlayWatcher = AbilityHelper.stateWatchers.cardsEnteredPlayThisPhase(registrar, this);
    }

    public override setupCardAbilities() {
        this.setEventAbility({
            title: 'Choose a unit that entered play this phase. It gets -4/-4 for this phase.',
            targetResolver: {
                cardTypeFilter: WildcardCardType.Unit,
                cardCondition: (card) => this.enteredPlayWatcher.someCardEnteredPlay((entry) => entry.card === card),
                immediateEffect: AbilityHelper.immediateEffects.forThisPhaseCardEffect({
                    effect: AbilityHelper.ongoingEffects.modifyStats({ power: -4, hp: -4 })
                })
            }
        });
    }
}
