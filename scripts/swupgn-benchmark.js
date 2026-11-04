/**
 * CPU benchmark of the SWU-PGN writer modes (gate G2: `flush` must cost <= 3% over `off` on workload A, A-lobby).
 *
 * Runs each workload in each writer mode as its own jasmine process (`SWUPGN_WRITER=<mode>`), alternating the modes
 * so drift in the machine spreads across all of them, and prints mean +/- standard deviation (and min..max) per mode,
 * with the overhead against `off`, for two clocks: the process wall time and jasmine's own "Finished in" time, which
 * leaves out the fixed cost of loading the card library. It then runs each recording mode once more with
 * `SWUPGN_WRITER_STATS=1` to print the writer's steps, flushes and projections (that run is not timed), and the
 * per-decision cost: the mode's mean spec time over `off`, divided by its steps and by its projections.
 *
 *   workload A      A-lobby (the headline): build/test/server/swupgn-writer/ScriptedGames.spec.js, eight whole
 *                   scripted games (long boards), recording only, with the Lobby baseline (`SWUPGN_BENCHMARK=lobby`):
 *                   after each decision the harness builds both seats' game state (`game.getState`), as `Lobby` does
 *                   for every player message, in every mode, `off` included
 *   workload Arecord A-record: the same games with no game state built and no file written (`SWUPGN_BENCHMARK=record`)
 *   workload Afile  A-file: the same games, each finished game's four views written (`SWUPGN_BENCHMARK=file`); the spec
 *                   times `fileFor` itself, reported as the end-of-game file cost per game
 *   workload B      build/test/server/cards/{01_SOR,07_LAW,08_ASH}/** /*.spec.js: card specs (short boards; they
 *                   write no file), recording only
 *   workload Blobby B-lobby: the same card specs with the Lobby baseline
 * Every run warms the engine version first (as the server does at startup), and `@swupgn/format` and its validator
 * are loaded by static imports in every mode, `off` included, so module loading costs the same in each.
 *
 * Usage: npm run benchmark-swupgn [-- --alternations=5 --workloads=A,Arecord,Afile,B,Blobby --profile]
 *   --alternations=N      timed runs of each mode per workload (default 5)
 *   --workloads=...       which workloads to time (default all five; `none` with --profile only profiles)
 *   --profile             also take one `node --cpu-prof` profile of `flush` on A-lobby and print its top frames
 *
 * A run with failures, or whose "Finished in" time cannot be read, stops the benchmark (non-zero exit).
 *
 * Needs a build: `rm -rf build && npm run build`; the test build is made here when it is missing.
 */
const { spawnSync, execSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const root = path.resolve(__dirname, '..');
const modes = ['off', 'decision', 'flush', 'event'];

function argValue(name, fallback) {
    const arg = process.argv.find((a) => a.startsWith(`--${name}=`));
    return arg ? arg.slice(name.length + 3) : fallback;
}

const alternations = Number(argValue('alternations', '5'));
const workloadNames = argValue('workloads', 'A,Arecord,Afile,B,Blobby').split(',')
    .filter((name) => name !== '' && name !== 'none');
const profile = process.argv.includes('--profile');

/** Every `*.spec.js` under `dir`, relative to the repo root, sorted. */
function specsUnder(dir) {
    const abs = path.join(root, dir);
    if (!fs.existsSync(abs)) {
        throw new Error(`no compiled specs at ${dir}: build first`);
    }
    return fs.readdirSync(abs, { recursive: true })
        .filter((file) => file.endsWith('.spec.js'))
        .map((file) => path.join(dir, file))
        .sort();
}

const scriptedGames = () => ['build/test/server/swupgn-writer/ScriptedGames.spec.js'];
const cardSpecs = () => ['01_SOR', '07_LAW', '08_ASH'].flatMap((set) => specsUnder(`build/test/server/cards/${set}`));
const workloads = {
    A: { label: 'A-lobby: scripted games, recording only, game state built per decision', benchmark: 'lobby', files: scriptedGames },
    Arecord: { label: 'A-record: scripted games, recording only', benchmark: 'record', files: scriptedGames },
    Afile: { label: 'A-file: scripted games, four views written per game', benchmark: 'file', files: scriptedGames },
    B: { label: 'B: card specs 01_SOR, 07_LAW, 08_ASH', benchmark: 'record', files: cardSpecs },
    Blobby: { label: 'B-lobby: card specs 01_SOR, 07_LAW, 08_ASH, game state built per decision', benchmark: 'lobby', files: cardSpecs }
};

function ensureTestBuild() {
    if (!fs.existsSync(path.join(root, workloads.A.files()[0]))) {
        console.log('No test build: running node scripts/build-test.js --fast-build');
        execSync('node scripts/build-test.js --fast-build', { cwd: root, stdio: 'inherit' });
    }
}

/**
 * One jasmine process over the workload's files in `mode`. Returns its wall and spec times (ms) and its stdout.
 * Throws when the run failed or its spec time cannot be read, so no mean is ever taken over a broken run.
 */
function runJasmine(mode, workload, { stats = false, nodeArgs = [] } = {}) {
    const files = workload.files();
    const env = { ...process.env, NODE_ENV: 'test', SWUPGN_WRITER: mode, SWUPGN_BENCHMARK: workload.benchmark };
    if (stats) {
        env.SWUPGN_WRITER_STATS = '1';
    } else {
        delete env.SWUPGN_WRITER_STATS;
    }
    const args = [...nodeArgs, 'node_modules/jasmine/bin/jasmine', '--config=./jasmine-game.json', '--random=false', ...files];
    const start = process.hrtime.bigint();
    const result = spawnSync(process.execPath, args, { cwd: root, env, encoding: 'utf8', maxBuffer: 256 * 1024 * 1024 });
    const wallMs = Number(process.hrtime.bigint() - start) / 1e6;
    if (result.error) {
        throw result.error;
    }
    const out = result.stdout ?? '';
    const finished = out.match(/Finished in ([\d.]+) seconds?/);
    const summary = out.match(/(\d+) specs?, (\d+) failures?/);
    if (!finished || !summary || Number(summary[2]) > 0 || result.status !== 0) {
        console.error(out.slice(-4000));
        console.error(result.stderr?.slice(-2000));
        throw new Error(`${workload.label} in mode ${mode}: ${summary ? summary[0] : 'no spec summary'}, exit ${result.status}`);
    }
    return { wallMs, specMs: Number(finished[1]) * 1000, out };
}

function summarize(values) {
    const n = values.length;
    const mean = values.reduce((a, b) => a + b, 0) / n;
    const sd = n > 1 ? Math.sqrt(values.reduce((a, b) => a + (b - mean) ** 2, 0) / (n - 1)) : 0;
    return { mean, sd, min: Math.min(...values), max: Math.max(...values) };
}

function fmtMs(ms) {
    return ms >= 10000 ? `${(ms / 1000).toFixed(2)}s` : `${ms.toFixed(0)}ms`;
}

function pct(value, base) {
    const p = (value / base - 1) * 100;
    return `${p >= 0 ? '+' : ''}${p.toFixed(1)}%`;
}

/** The JSON of the `<tag> {json}` line a run printed, or null. */
function taggedLine(out, tag) {
    const line = out.split('\n').find((l) => l.startsWith(`${tag} `));
    return line ? JSON.parse(line.slice(tag.length + 1)) : null;
}

function printTable(label, timings, clock) {
    const off = summarize(timings.off.map((t) => t[clock]));
    console.log(`\n${label} -- ${clock === 'wallMs' ? 'process wall time' : 'jasmine "Finished in" time'}`);
    console.log('  mode       mean      +/- sd     min..max            overhead vs off');
    for (const mode of modes) {
        const s = summarize(timings[mode].map((t) => t[clock]));
        const range = `${fmtMs(s.min)}..${fmtMs(s.max)}`;
        console.log(`  ${mode.padEnd(9)}  ${fmtMs(s.mean).padStart(8)}  ${fmtMs(s.sd).padStart(8)}   ${range.padEnd(18)}  ${mode === 'off' ? '--' : pct(s.mean, off.mean)}`);
    }
}

function benchmark(name) {
    const workload = workloads[name];
    const files = workload.files();
    console.log(`\n=== Workload ${workload.label} (${files.length} spec file${files.length === 1 ? '' : 's'}, ${alternations} alternations) ===`);

    // one untimed warm-up, so the first timed run does not pay for a cold file cache
    runJasmine('off', workload);

    const timings = Object.fromEntries(modes.map((mode) => [mode, []]));
    for (let i = 0; i < alternations; i++) {
        // rotate the starting mode each alternation, so no mode always runs first
        const order = modes.map((_, j) => modes[(i + j) % modes.length]);
        for (const mode of order) {
            const run = runJasmine(mode, workload);
            timings[mode].push(run);
            console.log(`  run ${i + 1} ${mode.padEnd(9)} wall ${fmtMs(run.wallMs).padStart(8)}  specs ${fmtMs(run.specMs).padStart(8)}`);
        }
    }
    printTable(`Workload ${workload.label}`, timings, 'wallMs');
    printTable(`Workload ${workload.label}`, timings, 'specMs');

    if (workload.benchmark === 'file') {
        console.log(`\nWorkload ${workload.label} -- end-of-game file cost (fileFor x4 views, timed by the spec, mean of the timed runs)`);
        for (const mode of modes.filter((m) => m !== 'off')) {
            const perGame = timings[mode].map((run) => {
                const file = taggedLine(run.out, 'SWUPGN_FILE_MS');
                if (!file || file.games === 0) {
                    throw new Error(`${workload.label} in mode ${mode}: no SWUPGN_FILE_MS line`);
                }
                return file.ms / file.games;
            });
            const s = summarize(perGame);
            console.log(`  ${mode.padEnd(9)}  ${s.mean.toFixed(2)}ms +/- ${s.sd.toFixed(2)}ms per game (${s.min.toFixed(2)}..${s.max.toFixed(2)})`);
        }
    }

    console.log(`\nWorkload ${workload.label} -- writer work (one untimed run per mode, SWUPGN_WRITER_STATS=1)`);
    console.log('  mode       games   steps  projections  flushes   per game: steps  projections  flushes   writer us/step  us/projection  cards read/reused');
    const offMean = summarize(timings.off.map((t) => t.specMs)).mean;
    for (const mode of modes.filter((m) => m !== 'off')) {
        const s = taggedLine(runJasmine(mode, workload, { stats: true }).out, 'SWUPGN_WRITER_STATS');
        if (!s) {
            throw new Error(`${workload.label} in mode ${mode}: no SWUPGN_WRITER_STATS line (is test/helpers/SwuPgnWriterStatsReporter built?)`);
        }
        const per = (v) => (s.writers > 0 ? (v / s.writers).toFixed(1) : '-');
        // the writer's time: this mode's mean spec time over off's, in microseconds
        const writerUs = (summarize(timings[mode].map((t) => t.specMs)).mean - offMean) * 1000;
        const perDecision = (n) => (n > 0 ? (writerUs / n).toFixed(1) : '-');
        console.log(`  ${mode.padEnd(9)}  ${String(s.writers).padStart(5)}  ${String(s.steps).padStart(6)}  ${String(s.projections).padStart(11)}  ${String(s.flushes).padStart(7)}   ${per(s.steps).padStart(15)}  ${per(s.projections).padStart(11)}  ${per(s.flushes).padStart(7)}   ${perDecision(s.steps).padStart(14)}  ${perDecision(s.projections).padStart(13)}  ${s.cardsRead}/${s.cardsReused}`);
    }
}

/** Whether a profile frame is the writer's code: the engine's `core/swupgn/` or the `@swupgn/format` package. */
function isWriterFrame(url) {
    return url.includes('/core/swupgn/') || url.includes('/swupgn/dist/');
}

function frameName(callFrame) {
    const { functionName, url, lineNumber } = callFrame;
    const where = url ? `${path.relative(root, url.replace(/^file:\/\//, ''))}:${lineNumber + 1}` : '';
    return `${functionName || '(anonymous)'} ${where}`.trim();
}

/**
 * Reads a `.cpuprofile`: the top self-time frames of the whole process; the time under the writer (every sample with a
 * writer frame on its stack), split by the outermost writer frame (its entry point); and the top self-time frames
 * inside the writer's time.
 */
function analyzeProfile(profileFile, count) {
    const prof = JSON.parse(fs.readFileSync(profileFile, 'utf8'));
    const byId = new Map(prof.nodes.map((node) => [node.id, node]));
    const parentOf = new Map();
    for (const node of prof.nodes) {
        for (const child of node.children ?? []) {
            parentOf.set(child, node.id);
        }
    }
    const selfUs = new Map();
    for (let i = 0; i < prof.samples.length; i++) {
        selfUs.set(prof.samples[i], (selfUs.get(prof.samples[i]) ?? 0) + (prof.timeDeltas[i] ?? 0));
    }
    const add = (map, key, us) => map.set(key, (map.get(key) ?? 0) + us);
    const self = new Map();
    const writerEntry = new Map();
    const writerSelf = new Map();
    let total = 0;
    let writerTotal = 0;
    for (const [id, us] of selfUs) {
        total += us;
        const name = frameName(byId.get(id).callFrame);
        add(self, name, us);
        let outermost = null;
        for (let at = id; at !== undefined; at = parentOf.get(at)) {
            if (isWriterFrame(byId.get(at).callFrame.url)) {
                outermost = at;
            }
        }
        if (outermost !== null) {
            writerTotal += us;
            add(writerEntry, frameName(byId.get(outermost).callFrame), us);
            add(writerSelf, name, us);
        }
    }
    const top = (map) => [...map].sort((a, b) => b[1] - a[1]).slice(0, count);
    return { total, writerTotal, self: top(self), writerEntry: top(writerEntry), writerSelf: top(writerSelf) };
}

function profileFlush() {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'swupgn-cpuprof-'));
    console.log(`\n=== CPU profile: flush on workload A-lobby (node --cpu-prof, 100us interval, ${dir}) ===`);
    runJasmine('flush', workloads.A, { nodeArgs: ['--cpu-prof', '--cpu-prof-interval=100', `--cpu-prof-dir=${dir}`] });
    const file = fs.readdirSync(dir).find((f) => f.endsWith('.cpuprofile'));
    if (!file) {
        console.log('  no profile written');
        return;
    }
    const { total, writerTotal, self, writerEntry, writerSelf } = analyzeProfile(path.join(dir, file), 12);
    const print = (title, rows, base) => {
        console.log(`\n  ${title}`);
        for (const [frame, us] of rows) {
            console.log(`  ${(us / 1000).toFixed(1).padStart(8)}ms  ${((us / base) * 100).toFixed(1).padStart(5)}%  ${frame}`);
        }
    };
    console.log(`  ${path.join(dir, file)}: ${(total / 1000).toFixed(0)}ms sampled, ${(writerTotal / 1000).toFixed(0)}ms (${((writerTotal / total) * 100).toFixed(1)}%) with a writer frame on the stack`);
    print('top self-time frames, whole process (% of all samples)', self, total);
    print('writer time by entry point: the outermost writer frame (% of writer time)', writerEntry, writerTotal);
    print('top self-time frames inside the writer\'s time (% of writer time)', writerSelf, writerTotal);
}

ensureTestBuild();
console.log(`Node ${process.version}, ${os.cpus()[0]?.model ?? 'unknown CPU'} x${os.cpus().length}`);
for (const name of workloadNames) {
    if (!workloads[name]) {
        throw new Error(`unknown workload ${name}: use ${Object.keys(workloads).join(', ')}`);
    }
    benchmark(name);
}
if (profile) {
    profileFlush();
}
