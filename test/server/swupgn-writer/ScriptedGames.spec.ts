import { validate } from '@swupgn/format/validate';
import { warmEngineVersion } from '../../../server/game/core/swupgn/FileAssembler';
import type { SwuPgnFileView } from '../../../server/game/core/swupgn/SwuPgnWriter';
import { playScriptedGame, scriptedGameNames } from './scriptedGames';

/**
 * The scripted games (`scriptedGames.ts`) as the writer's long-board spec: every game's `full` file and all three views
 * of it validate, and the writer caught no failure. No golden files: the normative vectors stay in the package.
 *
 * The same spec is workload A of `scripts/swupgn-benchmark.js`, which runs it in each writer mode (`SWUPGN_WRITER=off`
 * builds no writer, and only the game is played) with `SWUPGN_BENCHMARK` set:
 *   `lobby`   A-lobby (the headline): as `record`, but after every decision the test harness builds both seats'
 *             game state (`game.getState`), as `Lobby` sends it to each player, in every mode, `off` included
 *   `record`  A-record: the games only, no file is written, so the timing is the per-decision recording cost
 *   `file`    A-file: each finished game's four views are written (not validated), and the time `fileFor` takes is
 *             printed once at the end as `SWUPGN_FILE_MS {json}`
 * In every case nothing is validated, and the engine version is warmed first, as the server does at startup.
 */
describe('SWU-PGN scripted games', function() {
    integration(function(contextRef) {
        const views: SwuPgnFileView[] = ['full', 1, 2, 'public'];
        const benchmark = process.env.SWUPGN_BENCHMARK;
        const fileTime = { games: 0, ms: 0 };

        beforeAll(function () {
            warmEngineVersion();
        });

        if (benchmark === 'file') {
            afterAll(function () {
                console.log(`\nSWUPGN_FILE_MS ${JSON.stringify(fileTime)}`);
            });
        }

        for (const name of scriptedGameNames) {
            it(`${name}: every view of the file validates and the writer caught no failure`, async function () {
                await playScriptedGame(contextRef, name);

                const writer = contextRef.context.game.swuPgnWriter;
                if (writer === null) {
                    expect(benchmark).withContext('only the benchmark runs with no writer (SWUPGN_WRITER=off)')
                        .toBeDefined();
                    return;
                }
                if (benchmark !== 'record' && benchmark !== 'lobby') {
                    const start = process.hrtime.bigint();
                    const files = views.map((view) => writer.fileFor(view));
                    fileTime.ms += Number(process.hrtime.bigint() - start) / 1e6;
                    fileTime.games++;
                    if (benchmark === undefined) {
                        files.forEach((file, i) => {
                            const report = validate(file);
                            expect(report.level).withContext(`${name}: validate(fileFor(${views[i]})): ${JSON.stringify(report.issues)}`)
                                .toBe('valid');
                        });
                    }
                }
                expect(writer.errors).withContext(`${name}: writer errors`)
                    .toBe(0);
            });
        }
    });
});
