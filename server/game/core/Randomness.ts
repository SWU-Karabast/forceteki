import seedrandom from 'seedrandom';

export interface IRandomness<TRngState = object> {
    seed: string | undefined;
    rngState: TRngState;
    next(): number;
    restore(state: TRngState): void;
    reseed(newSeed: string): void;
}

class SeedRandomRng implements IRandomness<seedrandom.PRNGState> {
    private rng: seedrandom.prng;
    private _seed: string | undefined;

    public constructor(seed?: string) {
        this._seed = seed;
        this.rng = seedrandom(seed, { state: true });
    }

    public get seed(): string | undefined {
        return this._seed;
    }

    public get rngState(): seedrandom.PRNGState {
        return this.rng.state();
    }

    public next(): number {
        return this.rng();
    }

    public restore(state: IRandomness['rngState']): void {
        this.rng = seedrandom(this._seed, { state });
    }

    public reseed(newSeed: string): void {
        this._seed = newSeed;
        this.rng = seedrandom(newSeed, { state: true });
    }
}

// can replace if a different RNG implementation is needed
export { SeedRandomRng as Randomness };