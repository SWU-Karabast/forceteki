import AbilityHelper from '../../../AbilityHelper';
import { NonLeaderUnitCard } from '../../../core/card/NonLeaderUnitCard';
import { WildcardCardType } from '../../../core/Constants';
import { StateWatcherRegistrar } from '../../../core/stateWatcher/StateWatcherRegistrar';
import { CardsPlayedThisPhaseWatcher } from '../../../stateWatchers/CardsPlayedThisPhaseWatcher';


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
                condition: (context) => this.cardsPlayedThisWatcher.someCardsPlayed(
                    (cardPlay) => cardPlay.playedBy === context.source.controller && cardPlay.card !== context.source
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
