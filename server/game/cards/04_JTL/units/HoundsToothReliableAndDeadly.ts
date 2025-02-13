import AbilityHelper from '../../../AbilityHelper';
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

    public override setupCardAbilities() {
        this.addConstantAbility({
            title: 'While attacking an exhausted unit that didn\'t enter play this phase, this unit deals combat damage before the defender',
            condition: (context) =>
                context.source.isAttacking() &&
                context.source.activeAttack?.target.isUnit() &&
                context.source.activeAttack?.target.isInPlay() &&
                context.source.activeAttack?.target.exhausted &&
                this.cardsEnteredPlayThisPhaseWatcher.getCardsPlayed((entry) => entry.card === context.source.activeAttack?.target).length === 0,
            ongoingEffect: AbilityHelper.ongoingEffects.dealsDamageBeforeDefender()
        });
    }
}
