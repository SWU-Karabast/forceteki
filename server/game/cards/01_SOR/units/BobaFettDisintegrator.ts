import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { CardsPlayedThisPhaseWatcher } from '../../../stateWatchers/CardsPlayedThisPhaseWatcher';
import { StateWatcherRegistrar } from '../../../core/stateWatcher/StateWatcherRegistrar';

export default class BobaFettDisintegrator extends NonLeaderUnitCard {
    // initiate watcher record
    private cardsPlayedThisPhaseWatcher: CardsPlayedThisPhaseWatcher;

    protected override getImplementationId() {
        return {
            id: '4156799805',
            internalName: 'boba-fett#disintegrator'
        };
    }

    // setup watcher
    protected override setupStateWatchers(registrar: StateWatcherRegistrar) {
        this.cardsPlayedThisPhaseWatcher = AbilityHelper.stateWatchers.cardsPlayedThisPhase(registrar, this);
    }

    public override setupCardAbilities() {
        this.addOnAttackAbility({
            title: 'If this unit is attacking an exhausted unit that didn\'t enter play this round, deal 3 damage to the defender.',
            immediateEffect: AbilityHelper.immediateEffects.conditional((attackContext) => ({
                condition: () => {
                    // we find the cards that the opponent played this phase and check if it's the card targeted
                    const playedCardsByOpponentThisPhaseWithCriteria = this.cardsPlayedThisPhaseWatcher.getCardsPlayed((playedCardEntry) =>
                        playedCardEntry.playedBy === attackContext.source.activeAttack.target.owner && attackContext.source.activeAttack.target === playedCardEntry.card);
                    return playedCardsByOpponentThisPhaseWithCriteria.length === 0 && attackContext.source.activeAttack.target.isNonLeaderUnit() && attackContext.source.activeAttack.target.exhausted;
                },
                onTrue: AbilityHelper.immediateEffects.damage({ target: attackContext.source.activeAttack.target, amount: 3 }),
                onFalse: AbilityHelper.immediateEffects.noAction()
            })),
        });
    }
}

BobaFettDisintegrator.implemented = true;