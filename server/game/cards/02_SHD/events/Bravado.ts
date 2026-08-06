import type { IAbilityHelper } from '../../../AbilityHelper';
import { EventCard } from '../../../core/card/EventCard';
import type { IEventAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import type { StateWatcherRegistrar } from '../../../core/stateWatcher/StateWatcherRegistrar';
import type { CardsDefeatedThisPhaseWatcher } from '../../../stateWatchers/CardsDefeatedThisPhaseWatcher';
import { TextHelper } from '../../../core/utils/TextHelper';

export default class Bravado extends EventCard {
    private cardsDefeatedThisPhaseWatcher: CardsDefeatedThisPhaseWatcher;

    protected override getImplementationId() {
        return {
            id: '7212445649',
            internalName: 'bravado',
        };
    }

    protected override setupStateWatchers(registrar: StateWatcherRegistrar, AbilityHelper: IAbilityHelper): void {
        this.cardsDefeatedThisPhaseWatcher = AbilityHelper.stateWatchers.cardsDefeatedThisPhase();
    }

    public override setupCardAbilities(registrar: IEventAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addDecreaseCostAbility({
            title: `If you've defeated an enemy unit this phase, this event costs ${TextHelper.resource(2)} less to play`,
            condition: (context) => this.cardsDefeatedThisPhaseWatcher.playerDefeatedEnemyUnit(context.source.controller),
            amount: 2
        });

        registrar.setEventAbility({
            title: 'Ready a unit',
            targetResolver: {
                cardCondition: (card) => card.isUnit(),
                immediateEffect: AbilityHelper.immediateEffects.ready()
            }
        });
    }
}