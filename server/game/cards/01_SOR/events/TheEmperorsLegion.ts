import type { IAbilityHelper } from '../../../AbilityHelper';
import type { StateWatcherRegistrar } from '../../../core/stateWatcher/StateWatcherRegistrar';
import type { CardsDefeatedThisPhaseWatcher } from '../../../stateWatchers/CardsDefeatedThisPhaseWatcher';
import { EventCard } from '../../../core/card/EventCard';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';

export default class TheEmperorsLegion extends EventCard {
    private cardsDefeatedThisPhaseWatcher: CardsDefeatedThisPhaseWatcher;

    protected override getImplementationId () {
        return {
            id: '9785616387',
            internalName: 'the-emperors-legion'
        };
    }

    protected override setupStateWatchers(registrar: StateWatcherRegistrar, AbilityHelper: IAbilityHelper): void {
        this.cardsDefeatedThisPhaseWatcher = AbilityHelper.stateWatchers.cardsDefeatedThisPhase();
    }

    public override setupCardAbilities(registrar: IEventAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.setEventAbility({
            title: 'Return each unit in your discard pile that was defeated this phase to your hand.',
            immediateEffect: AbilityHelper.immediateEffects.returnToHand((context) => {
                // goes by whose discard pile the unit is in, not by who controlled it when it was defeated
                const unitsDefeatedThisPhaseInDiscard = context.player.discardZone.cards
                    .filter((card) => card.isUnit() && this.cardsDefeatedThisPhaseWatcher.wasDefeatedThisPhase(card));

                return { target: unitsDefeatedThisPhaseInDiscard };
            })
        });
    }
}
