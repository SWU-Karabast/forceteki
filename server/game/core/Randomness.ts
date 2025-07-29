import seedrandom from 'seedrandom';
import type { IRandomness } from './GameInterfaces';

class Randomness implements IRandomness {
    private rng: seedrandom.prng;
    private seed: string | undefined;
    private lastState: seedrandom.PRNGState | undefined;

    public constructor(seed?: string) {
        this.seed = seed;
        this.rng = seedrandom(seed, { state: true });
    }

    public next(): number {
        this.lastState = this.rng.state();
        return this.rng();
    }

    public restore(): void {
        this.rng = seedrandom(this.seed, { state: this.lastState });
    }

    public reseed(newSeed: string): void {
        this.seed = newSeed;
        this.rng = seedrandom(newSeed, { state: true });
    }
}

export { Randomness };