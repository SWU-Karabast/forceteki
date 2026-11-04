import { validate } from '@swupgn/format/validate';
import type { SwuPgnFileView } from '../../../server/game/core/swupgn/SwuPgnWriter';
import { playScriptedGame, scriptedGameNames } from './scriptedGames';

/**
 * The scripted games (`scriptedGames.ts`) as the writer's long-board spec: every game's `full` file and all three views
 * of it validate, and the writer caught no failure. No golden files: the normative vectors stay in the package.
 *
 * The same spec is workload A of `scripts/swupgn-benchmark.js`, which runs it in each writer mode: with
 * `SWUPGN_WRITER=off` there is no writer and only the game is played, and with `SWUPGN_BENCHMARK=1` the views are still
 * written (as a finished game's are) but not validated, so the timings hold no validator work.
 */
describe('SWU-PGN scripted games', function() {
    integration(function(contextRef) {
        const views: SwuPgnFileView[] = ['full', 1, 2, 'public'];
        const benchmarking = process.env.SWUPGN_BENCHMARK === '1';

        for (const name of scriptedGameNames) {
            it(`${name}: every view of the file validates and the writer caught no failure`, async function () {
                await playScriptedGame(contextRef, name);

                const writer = contextRef.context.game.swuPgnWriter;
                if (writer === null) {
                    expect(benchmarking).withContext('only the benchmark runs with no writer (SWUPGN_WRITER=off)')
                        .toBeTrue();
                    return;
                }
                for (const view of views) {
                    const file = writer.fileFor(view);
                    if (!benchmarking) {
                        const report = validate(file);
                        expect(report.level).withContext(`${name}: validate(fileFor(${view})): ${JSON.stringify(report.issues)}`)
                            .toBe('valid');
                    }
                }
                expect(writer.errors).withContext(`${name}: writer errors`)
                    .toBe(0);
            });
        }
    });
});
