/**
 * Runs the first-snapshot probe alone against a built worktree and writes one named report with provenance.
 *
 * This is Plan 8 R-0 tooling (`docs/plans/08-performance-regressions.md`). It builds nothing: build each worktree once,
 * after `test/scenarios/undo/FirstSnapshotProbe.spec.ts` (and, on a commit that lacks them, `BenchmarkHarness.ts` and
 * `BenchmarkScenarios.ts`) was copied in, then call this script once per run, one process at a time. It always runs the probe
 * in benchmark mode (`RUN_PERF_BENCHMARKS=1`), because the branch's test-only verifiers wrap the snapshot build in every jasmine
 * worker otherwise and inflate the first-build time about threefold; it rejects any run whose output shows one of their banners.
 *
 * Usage:
 *   node scripts/run-first-snapshot-probe.js --worktree <abs path> --name p8-r0-<sha9>-run<N> --out-dir <abs path> \
 *       --expect-commit <sha prefix> [--round <n>] [--position <n>]
 *   node scripts/run-first-snapshot-probe.js --self-test
 *
 * Options:
 *   --worktree <path>        Built checkout to run in (required).
 *   --name <name>            Report basename, `p8-r0-<9 hex>-run<N>` (required).
 *   --out-dir <path>         Folder for `<name>.json`; an existing file of that name is never overwritten (required).
 *   --expect-commit <sha>    The worktree HEAD must start with this (required for a run).
 *   --round, --position      Campaign round and position in the round, recorded in the report.
 *   --self-test              Check the log guard and the name pattern on fixtures and exit.
 */

const { spawnSync } = require('child_process');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const repoRoot = path.resolve(__dirname, '..');
const NAME_PATTERN = /^p8-r0-[0-9a-f]{9}-run[0-9]+$/;
const EXPECTED_SPEC_COUNT = 4;
const SCRUBBED_ENV = ['ENABLE_PARITY_HARNESS', 'ENABLE_UNDO_ALL_TESTS', 'MEASURE_SAVE_DEGRADATION', 'FIRST_SNAPSHOT_PROBE_ALLOW_VERIFIERS'];
const SPEC_SOURCE = path.join('test', 'scenarios', 'undo', 'FirstSnapshotProbe.spec.ts');
const SPEC_BUILD = path.join('build', 'test', 'scenarios', 'undo', 'FirstSnapshotProbe.spec.js');
const HARNESS_SOURCE = path.join('test', 'scenarios', 'undo', 'benchmark', 'BenchmarkHarness.ts');
const HARNESS_BUILD = path.join('build', 'test', 'scenarios', 'undo', 'benchmark', 'BenchmarkHarness.js');
const SCENARIOS_SOURCE = path.join('test', 'scenarios', 'undo', 'benchmark', 'BenchmarkScenarios.ts');

/** Returns null when the log is a clean four-spec run, otherwise the reason it is rejected. */
function judgeProbeLog(text) {
    if (!(/Ran 4 of/).test(text)) {
        return `no "Ran ${EXPECTED_SPEC_COUNT} of" line: the filter did not select exactly the probe's ${EXPECTED_SPEC_COUNT} specs`;
    }
    if (!(/\b4 specs, 0 failures\b/).test(text)) {
        return 'no "4 specs, 0 failures" line';
    }
    const banner = text.split(/\r?\n/).find((line) => (/^\[(SnapshotMemoVerifier|DeltaChainVerifier|DeltaParityGate|ParityHarness)\]/).test(line) || (/^\[\w*(Verifier|Gate|Harness)\]/).test(line));
    if (banner) {
        return `a verifier banner is present (${banner.slice(0, 60)}): the branch's verifiers wrapped the snapshot build`;
    }
    return null;
}

function parseArgs(argv) {
    const options = { worktree: null, name: null, outDir: null, expectCommit: null, round: null, position: null, selfTest: false };
    for (let index = 0; index < argv.length; index++) {
        const arg = argv[index];
        switch (arg) {
            case '--worktree':
                options.worktree = argv[++index];
                break;
            case '--name':
                options.name = argv[++index];
                break;
            case '--out-dir':
                options.outDir = argv[++index];
                break;
            case '--expect-commit':
                options.expectCommit = argv[++index];
                break;
            case '--round':
                options.round = Number(argv[++index]);
                break;
            case '--position':
                options.position = Number(argv[++index]);
                break;
            case '--self-test':
                options.selfTest = true;
                break;
            default:
                throw new Error(`Unknown argument: ${arg}`);
        }
    }
    return options;
}

function sha256(file) {
    return crypto.createHash('sha256').update(fs.readFileSync(file))
        .digest('hex');
}

function git(worktree, args) {
    const result = spawnSync('git', ['-C', worktree, ...args], { encoding: 'utf8' });
    if (result.status !== 0) {
        throw new Error(`git ${args.join(' ')} failed in ${worktree}: ${result.stderr}`);
    }
    return result.stdout;
}

function fail(message) {
    console.error(`run-first-snapshot-probe: ${message}`);
    process.exit(1);
}

function selfTest() {
    const clean = 'Started\n....\n\n\nRan 4 of 10861 specs\n4 specs, 0 failures\nFinished in 1.4 seconds\n';
    const cases = [
        ['clean four-spec log is accepted', clean, null],
        ['verifier banner is rejected', `${clean}[SnapshotMemoVerifier] pid=1 specs=4 builds=178\n`, 'reject'],
        ['generic Verifier banner is rejected', `${clean}[SomethingVerifier] pid=1\n`, 'reject'],
        ['zero selected specs is rejected', 'Started\n\n\nRan 0 of 10861 specs\n0 specs, 0 failures\n', 'reject'],
        ['one failure is rejected', clean.replace('4 specs, 0 failures', '4 specs, 1 failure'), 'reject'],
        ['three specs is rejected', 'Ran 3 of 10861 specs\n3 specs, 0 failures\n', 'reject']
    ];
    let bad = 0;
    for (const [label, text, expected] of cases) {
        const reason = judgeProbeLog(text);
        const ok = expected === null ? reason === null : reason !== null;
        console.log(`${ok ? 'ok  ' : 'FAIL'} ${label}${reason ? ` -> ${reason}` : ''}`);
        if (!ok) {
            bad++;
        }
    }
    const names = [
        ['p8-r0-d5e4d1cac-run1', true],
        ['p8-r0-9f650b6dd-run12', true],
        ['p8-r0-d5e4d1ca-run1', false],
        ['p8-r0-d5e4d1cacd-run1', false],
        ['p8-r0-D5E4D1CAC-run1', false],
        ['p8-r0-d5e4d1cac-run', false],
        ['p8-r0-d5e4d1cac-run1.json', false]
    ];
    for (const [name, expected] of names) {
        const ok = NAME_PATTERN.test(name) === expected;
        console.log(`${ok ? 'ok  ' : 'FAIL'} name ${name} ${expected ? 'accepted' : 'rejected'}`);
        if (!ok) {
            bad++;
        }
    }
    console.log(bad === 0 ? 'self-test passed' : `self-test FAILED: ${bad} mismatches`);
    process.exit(bad === 0 ? 0 : 1);
}

function main() {
    const options = parseArgs(process.argv.slice(2));
    if (options.selfTest) {
        selfTest();
        return;
    }
    if (!options.worktree || !options.name || !options.outDir || !options.expectCommit) {
        fail('--worktree, --name, --out-dir and --expect-commit are required');
    }
    if (!NAME_PATTERN.test(options.name)) {
        fail(`--name must match ${NAME_PATTERN}: got "${options.name}"`);
    }

    const worktree = path.resolve(options.worktree);
    const outDir = path.resolve(options.outDir);
    const head = git(worktree, ['rev-parse', 'HEAD']).trim();
    if (!head.startsWith(options.expectCommit)) {
        fail(`worktree HEAD ${head} does not start with --expect-commit ${options.expectCommit}`);
    }

    const specBuild = path.join(worktree, SPEC_BUILD);
    const specSource = path.join(worktree, SPEC_SOURCE);
    if (!fs.existsSync(specBuild) || !fs.existsSync(path.join(worktree, HARNESS_BUILD))) {
        fail('the compiled probe spec or BenchmarkHarness.js is missing: rebuild this worktree once (node scripts/build-test.js)');
    }
    if (!fs.existsSync(specSource) || fs.statSync(specBuild).mtimeMs < fs.statSync(specSource).mtimeMs) {
        fail('the compiled probe spec is older than its source: rebuild this worktree once (node scripts/build-test.js)');
    }

    const reportFile = path.join(outDir, `${options.name}.json`);
    if (fs.existsSync(reportFile)) {
        fail(`${reportFile} already exists; reports are never overwritten`);
    }

    const worktreeStatus = git(worktree, ['status', '--porcelain']).split(/\r?\n/)
        .filter((line) => line.length > 0);
    const rawDir = path.join(worktree, '.p8-r0-raw');
    fs.mkdirSync(rawDir, { recursive: true });
    const rawReport = path.join(rawDir, `${options.name}.raw.json`);
    const logFile = path.join(rawDir, `${options.name}.log`);
    fs.rmSync(rawReport, { force: true });
    fs.rmSync(logFile, { force: true });

    const env = { ...process.env };
    for (const name of SCRUBBED_ENV) {
        delete env[name];
    }
    Object.assign(env, {
        NODE_ENV: 'test',
        RUN_PERF_BENCHMARKS: '1',
        RUN_FIRST_SNAPSHOT_PROBE: '1',
        FIRST_SNAPSHOT_PROBE_REPORT_PATH: rawReport
    });

    const args = ['--expose-gc', '--enable-source-maps', path.join('node_modules', 'jasmine', 'bin', 'jasmine'), '--config=./jasmine.json', '--random=false', '--filter=FirstSnapshotProbe'];
    const startedAt = process.hrtime.bigint();
    const child = spawnSync(process.execPath, args, { cwd: worktree, env, encoding: 'utf8', maxBuffer: 256 * 1024 * 1024 });
    const wallSeconds = Number(process.hrtime.bigint() - startedAt) / 1e9;
    const output = `${child.stdout ?? ''}${child.stderr ?? ''}`;
    fs.writeFileSync(logFile, output, 'utf8');
    process.stdout.write(output);

    if (child.error) {
        fail(`could not start jasmine: ${child.error.message}`);
    }
    if (child.status !== 0) {
        fail(`jasmine exited ${child.status}; log kept at ${logFile}`);
    }
    const rejection = judgeProbeLog(output);
    if (rejection) {
        fail(`run rejected: ${rejection}; log kept at ${logFile}`);
    }
    if (!fs.existsSync(rawReport)) {
        fail(`no raw report at ${rawReport}: did the spec suite match the --filter=FirstSnapshotProbe, and was FIRST_SNAPSHOT_PROBE_REPORT_PATH honored? log kept at ${logFile}`);
    }

    const raw = JSON.parse(fs.readFileSync(rawReport, 'utf8'));
    const specsLine = output.split(/\r?\n/).find((line) => (/\bspecs?, \d+ failures?/).test(line)) ?? null;
    const runner = {
        name: options.name,
        round: options.round,
        position: options.position,
        worktreeHead: head,
        worktreeStatus,
        files: {
            spec: { path: SPEC_SOURCE.split(path.sep).join('/'), sha256: sha256(specSource) },
            benchmarkHarness: { path: HARNESS_SOURCE.split(path.sep).join('/'), sha256: sha256(path.join(worktree, HARNESS_SOURCE)) },
            benchmarkScenarios: { path: SCENARIOS_SOURCE.split(path.sep).join('/'), sha256: sha256(path.join(worktree, SCENARIOS_SOURCE)) },
            runner: { path: path.relative(repoRoot, __filename).split(path.sep)
                .join('/'), sha256: sha256(__filename) }
        },
        node: process.version,
        command: [process.execPath, ...args],
        jasmineExit: child.status,
        wallSeconds,
        specsLine
    };

    fs.mkdirSync(outDir, { recursive: true });
    fs.writeFileSync(reportFile, `${JSON.stringify({ ...raw, runner }, null, 2)}\n`, { encoding: 'utf8', flag: 'wx' });
    console.log(`\nwrote ${reportFile}`);
}

if (require.main === module) {
    main();
}

module.exports = { judgeProbeLog, NAME_PATTERN };
