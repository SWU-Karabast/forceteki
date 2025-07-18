import type { IAbilityHelper } from '../../../AbilityHelper';
import type { INonLeaderUnitAbilityRegistrar } from '../../../core/card/AbilityRegistrationInterfaces';
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

    protected override setupStateWatchers(registrar: StateWatcherRegistrar, AbilityHelper: IAbilityHelper) {
        this.cardsPlayedThisWatcher = AbilityHelper.stateWatchers.cardsPlayedThisPhase(registrar, this);
    }

    public override setupCardAbilities(registrar: INonLeaderUnitAbilityRegistrar, AbilityHelper: IAbilityHelper) {
        registrar.addWhenPlayedAbility({
            title: 'The opponent draws a discard and discards a random card',
            immediateEffect: AbilityHelper.immediateEffects.conditional({
                // this card going into play a previous time this phase then being re-played with e.g. Waylay counts as a separately played card
                condition: (context) => this.cardsPlayedThisWatcher.someCardPlayed(
                    (cardPlay) =>
                        cardPlay.playedBy === context.player &&
                        (cardPlay.card !== context.source || cardPlay.inPlayId !== context.source.inPlayId)
                ),
                onTrue: AbilityHelper.immediateEffects.sequential([
                    AbilityHelper.immediateEffects.draw((context) => ({ target: context.player.opponent })),
                    AbilityHelper.immediateEffects.discardCardsFromOwnHand((context) => ({
                        target: context.player.opponent,
                        amount: 1,
                        random: true
                    }))
                ]),
            })
        });
    }
}
