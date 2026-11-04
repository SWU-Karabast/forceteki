import { SWUPGN_WRITER_STATS } from '../../../env';

/**
 * Process-wide writer work counters for the CPU benchmark, counted only when `SWUPGN_WRITER_STATS=1`: the writer checks
 * `countSwuPgnWriterStats` (a constant) before touching them, so they cost nothing when off. Nothing in production reads them.
 */
export interface ISwuPgnWriterStats {

    /** Writers constructed (games recorded). */
    writers: number;

    /** `step` records written. */
    steps: number;

    /** Board projections: every flush, whether or not the board changed. */
    projections: number;

    /** Flushes whose projection differed from the previous board, so records were appended. */
    flushes: number;
}

export const countSwuPgnWriterStats: boolean = SWUPGN_WRITER_STATS;

export const swuPgnWriterStats: ISwuPgnWriterStats = { writers: 0, steps: 0, projections: 0, flushes: 0 };
