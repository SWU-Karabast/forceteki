import seedrandom from 'seedrandom';
import type { IRandomness, IRngState } from './GameInterfaces';

class Randomness implements IRandomness {
  private rng: seedrandom.prng;
  private seed: string | undefined;

  constructor(seed?: string) {
    this.seed = seed;
    this.rng = seedrandom(seed, { state: true });
  }

  next(): number {
    return this.rng();
  }

  getState(): IRngState {
    return this.rng.state();
  }

  restore(state: IRngState): void {
    this.rng = seedrandom(this.seed, { state });
  }
}

export { Randomness };