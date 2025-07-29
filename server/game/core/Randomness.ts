import seedrandom from 'seedrandom';
import type { IRandomness } from './GameInterfaces';
import type Game from './Game';

class Randomness<TRngState> implements IRandomness<TRngState> {
    private rng: seedrandom.prng;
    private readonly gameRef: Game;
    private readonly seed: string | undefined;

    public constructor(game: Game, seed?: string) {
        this.gameRef = game;
        this.seed = seed;
        this.rng = seedrandom(seed, { state: true });
    }

    public next(): number {
        const ret = this.rng();
        this.gameRef.state.rngState = this.rng.state();
        return ret;
    }

    public getState(): TRngState {
        return this.rng.state();
    }

    public restore(state: TRngState): void {
        this.rng = seedrandom(this.seed, { state });
    }
}

export { Randomness };