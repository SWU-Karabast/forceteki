import seedrandom from 'seedrandom';
import type { IRandomness, IRngState } from './GameInterfaces';

class Randomness implements IRandomness {
    private rng: seedrandom.prng;
    private seed: string | undefined;

    public constructor(seed?: string) {
        this.seed = seed;
        this.rng = seedrandom(seed, { state: true });
    }

    public next(): number {
        return this.rng();
    }

    public getState(): IRngState {
        return this.rng.state();
    }

    public restore(state: IRngState): void {
        this.rng = seedrandom(this.seed, { state });
    }
}

export { Randomness };