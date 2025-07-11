import AbilityHelper from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import type { StateWatcherRegistrar } from '../../../core/stateWatcher/StateWatcherRegistrar';
import type { CardsEnteredPlayThisPhaseWatcher } from '../../../stateWatchers/CardsEnteredPlayThisPhaseWatcher';

export default class HoundsToothReliableAndDeadly extends NonLeaderUnitCard {
    private cardsEnteredPlayThisPhaseWatcher: CardsEnteredPlayThisPhaseWatcher;

    protected override getImplementationId() {
        return {
            id: '3876470102',
            internalName: 'hounds-tooth#reliable-and-deadly'
        };
    }

    protected override setupStateWatchers(registrar: StateWatcherRegistrar) {
        this.cardsEnteredPlayThisPhaseWatcher = AbilityHelper.stateWatchers.cardsEnteredPlayThisPhase(registrar, this);
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar) {
        registrar.addConstantAbility({
            title: 'While attacking an exhausted unit that didn\'t enter play this phase, this unit deals combat damage before the defender',
            condition: (context) =>
                context.source.isAttacking() &&
                context.source.activeAttack?.targetIsUnit((card) => card.exhausted) &&
                this.cardsEnteredPlayThisPhaseWatcher.getCardsEnteredPlay((entry) => entry.card === context.source.activeAttack?.getSingleTarget()).length === 0,
            ongoingEffect: AbilityHelper.ongoingEffects.dealsDamageBeforeDefender()
        });
    }
}
