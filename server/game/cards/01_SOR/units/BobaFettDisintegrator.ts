import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { StateWatcherRegistrar } from '../../../core/stateWatcher/StateWatcherRegistrar';
import { CardsEnteredPlayThisPhaseWatcher } from '../../../stateWatchers/CardsEnteredPlayThisPhaseWatcher';

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
    protected override setupStateWatchers(registrar: StateWatcherRegistrar) {
        this.cardsEnteredPlayThisPhaseWatcher = AbilityHelper.stateWatchers.cardsEnteredPlayThisPhase(registrar, this);
    }

    public override setupCardAbilities() {
        this.addOnAttackAbility({
            title: 'If this unit is attacking an exhausted unit that didn\'t enter play this round, deal 3 damage to the defender.',
            immediateEffect: AbilityHelper.immediateEffects.conditional((attackContext) => ({
                condition: () => {
                    // we find the cards that the opponent played this phase and check if it's the card targeted
                    return this.cardsEnteredPlayThisPhaseWatcher.getCardsPlayed((playedCardEntry) =>
                        playedCardEntry.playedBy === attackContext.source.activeAttack.target.owner && attackContext.source.activeAttack.target === playedCardEntry.card).length === 0 &&
                        attackContext.source.activeAttack.target.isUnit() && attackContext.source.activeAttack.target.exhausted;
                },
                onTrue: AbilityHelper.immediateEffects.damage({ target: attackContext.source.activeAttack.target, amount: 3 }),
                onFalse: AbilityHelper.immediateEffects.noAction()
            })),
        });
    }
}

BobaFettDisintegrator.implemented = true;