import { StateWatcherName } from '../core/Constants';
import type { StateWatcherRegistrar } from '../core/stateWatcher/StateWatcherRegistrar';
import type { Game } from '../core/Game';
import { registerState } from '../core/GameObjectUtils';
import { CardsPlayedWatcherBase } from './CardsPlayedThisPhaseWatcher';

/**
 * Same as CardsPlayedThisPhaseWatcher, but keeps the cards played until the end of the round, for card text
 * that says "each round". A round includes the regroup phase, where cards can be played too (e.g. through a Bounty).
 */
@registerState()
export class CardsPlayedThisRoundWatcher extends CardsPlayedWatcherBase {
    public constructor(
        game: Game,
        registrar: StateWatcherRegistrar) {
        super(game, StateWatcherName.CardsPlayedThisRound, registrar, true);
    }
}
