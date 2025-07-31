import seedrandom from 'seedrandom';

export interface IRandomness<TRngState = object> {
    rngState: TRngState;
    next(): number;
    restore(state: TRngState): void;
    reseed(newSeed: string): void;
}

class SeedRandomRng implements IRandomness<seedrandom.PRNGState> {
    private rng: seedrandom.prng;
    private seed: string | undefined;

    public constructor(seed?: string) {
        this.seed = seed;
        this.rng = seedrandom(seed, { state: true });
    }

    public get rngState(): seedrandom.PRNGState {
        return this.rng.state();
    }

    public next(): number {
        return this.rng();
    }

    public restore(state: IRandomness['rngState']): void {
        this.rng = seedrandom(this.seed, { state });
    }

    public reseed(newSeed: string): void {
        this.seed = newSeed;
        this.rng = seedrandom(newSeed, { state: true });
    }
}

// can replace if a different RNG implementation is needed
export { SeedRandomRng as Randomness };