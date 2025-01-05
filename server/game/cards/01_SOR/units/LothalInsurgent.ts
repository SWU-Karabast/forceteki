import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import type { StateWatcherRegistrar } from '../../../core/stateWatcher/StateWatcherRegistrar';
import type { CardsPlayedThisPhaseWatcher } from '../../../stateWatchers/CardsPlayedThisPhaseWatcher';


export default class LothalInsurgent extends NonLeaderUnitCard {
    private cardsPlayedThisWatcher: CardsPlayedThisPhaseWatcher;

    protected override getImplementationId() {
        return {
            id: '1880931426',
            internalName: 'lothal-insurgent',
        };
    }

    protected override setupStateWatchers(registrar: StateWatcherRegistrar) {
        this.cardsPlayedThisWatcher = AbilityHelper.stateWatchers.cardsPlayedThisPhase(registrar, this);
    }

    public override setupCardAbilities() {
        this.addWhenPlayedAbility({
            title: 'The opponent draws a discard and discards a random card',
            immediateEffect: AbilityHelper.immediateEffects.conditional({
                // this card going into play a previous time this phase then being re-played with e.g. Waylay counts as a separately played card
                condition: (context) => this.cardsPlayedThisWatcher.someCardPlayed(
                    (cardPlay) =>
                        cardPlay.playedBy === context.source.controller &&
                        (cardPlay.card !== context.source || cardPlay.inPlayId !== context.source.inPlayId)
                ),
                onTrue: AbilityHelper.immediateEffects.sequential([
                    AbilityHelper.immediateEffects.draw((context) => ({ target: context.source.controller.opponent })),
                    AbilityHelper.immediateEffects.discardCardsFromOwnHand((context) => ({
                        target: context.source.controller.opponent,
                        amount: 1,
                        random: true
                    }))
                ]),
                onFalse: AbilityHelper.immediateEffects.noAction()
            })
        });
    }
}

LothalInsurgent.implemented = true;
