import type { IAbilityHelper } from '../../../AbilityHelper';
import type { IAttackableCard } from '../../../core/card/CardInterfaces';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import type { StateWatcherRegistrar } from '../../../core/stateWatcher/StateWatcherRegistrar';
import type { CardsEnteredPlayThisPhaseWatcher } from '../../../stateWatchers/CardsEnteredPlayThisPhaseWatcher';

export default class BobaFettDisintegrator extends NonLeaderUnitCard {
    // initiate watcher record
    private cardsEnteredPlayThisPhaseWatcher: CardsEnteredPlayThisPhaseWatcher;

    protected override getImplementationId() {
        return {
            id: '4156799805',
            internalName: 'boba-fett#disintegrator'
        };
    }

    // setup watcher
    protected override setupStateWatchers(registrar: StateWatcherRegistrar, AbilityHelper: IAbilityHelper) {
        this.cardsEnteredPlayThisPhaseWatcher = AbilityHelper.stateWatchers.cardsEnteredPlayThisPhase(registrar, this);
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addOnAttackAbility({
            title: 'If this unit is attacking an exhausted unit that didn\'t enter play this round, deal 3 damage to the defender.',
            immediateEffect: AbilityHelper.immediateEffects.conditional((attackContext) => ({
                // check if target card was played this turn and if it is a unit and exhausted
                condition: () => this.checkBobaCondition(attackContext.source.activeAttack?.getSingleTarget()),
                onTrue: AbilityHelper.immediateEffects.damage({ target: attackContext.source.activeAttack?.getSingleTarget(), amount: 3 }),
            })),
        });
    }

    private checkBobaCondition(defender: IAttackableCard): boolean {
        if (defender.isBase()) {
            return false;
        }
        if (!defender.exhausted) {
            return false;
        }
        if (this.cardsEnteredPlayThisPhaseWatcher.getCardsEnteredPlay((playedCardEntry) =>
            playedCardEntry.playedBy === defender.owner && defender === playedCardEntry.card).length > 0) {
            return false;
        }
        return true;
    }
}
