import { countSwuPgnWriterStats, swuPgnWriterStats } from '../../server/game/core/swupgn/SwuPgnWriterStats';

/**
 * With `SWUPGN_WRITER_STATS=1`, prints the SWU-PGN writer's work totals once, when the run ends, as one
 * `SWUPGN_WRITER_STATS {json}` line that `scripts/swupgn-benchmark.js` reads. Registers nothing otherwise.
 */
if (countSwuPgnWriterStats) {
    jasmine.getEnv().addReporter({
        jasmineDone: () => {
            console.log(`\nSWUPGN_WRITER_STATS ${JSON.stringify(swuPgnWriterStats)}`);
        }
    });
}
