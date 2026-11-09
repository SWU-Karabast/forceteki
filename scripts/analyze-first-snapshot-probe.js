/**
 * Applies Plan 8's reading rule and the per-game product to the first-snapshot probe reports.
 *
 * This is Plan 8 R-0 tooling (`docs/plans/08-performance-regressions.md`, "Reading rule"). It reads the committed
 * `p8-r0-<sha9>-run<N>.json` reports written by `scripts/run-first-snapshot-probe.js` and reports, per scenario and per
 * statistic (`avgMs`, `p50Ms`), the six-run median and min-max band of each point, the change, and whether the later point
 * counts as slower (change strictly above 20 percent and bands that do not overlap) or faster (the mirror image). A scenario counts
 * when either statistic does; two counting scenarios decide the verdict. Reports that are not comparable are refused (exit 2).
 *
 * Usage:
 *   node scripts/analyze-first-snapshot-probe.js --earlier d5e4d1cac --later 9f650b6dd [--dir docs/plans/performance] [--json-out <path>]
 *   node scripts/analyze-first-snapshot-probe.js --self-test
 */

const fs = require('fs');
const path = require('path');

const repoRoot = path.resolve(__dirname, '..');
const RUNS_PER_POINT = 6;
const THRESHOLD = 0.2;
const STATISTICS = ['avgMs', 'p50Ms'];
const SCENARIOS = ['forty-cards-per-player', 'forty-cards-sparse-mutations', 'forty-cards-four-mutated'];
const PRODUCT_SCENARIO = 'forty-cards-per-player';
const PROBE_FILE_KEYS = ['spec', 'benchmarkHarness', 'benchmarkScenarios', 'runner'];
const MUST_BE_UNSET_FLAGS = ['ENABLE_PARITY_HARNESS', 'ENABLE_UNDO_ALL_TESTS', 'MEASURE_SAVE_DEGRADATION', 'FIRST_SNAPSHOT_PROBE_ALLOW_VERIFIERS'];

function median(values) {
    const sorted = [...values].sort((left, right) => left - right);
    const middle = sorted.length / 2;
    return sorted.length % 2 === 1 ? sorted[Math.floor(middle)] : (sorted[middle - 1] + sorted[middle]) / 2;
}

function band(values) {
    return { min: Math.min(...values), max: Math.max(...values) };
}

function loadReports(dir, sha) {
    const pattern = new RegExp(`^p8-r0-${sha}-run(\\d+)\\.json$`);
    const reports = [];
    for (const file of fs.readdirSync(dir)) {
        const match = pattern.exec(file);
        if (match) {
            const report = JSON.parse(fs.readFileSync(path.join(dir, file), 'utf8'));
            reports.push({ file, run: Number(match[1]), report });
        }
    }
    return reports.sort((left, right) => left.run - right.run);
}

function scenarioOf(report, name) {
    return report.scenarios.find((scenario) => scenario.scenario === name);
}

function sameValue(values) {
    const first = JSON.stringify(values[0]);
    return values.every((value) => JSON.stringify(value) === first);
}

/** Returns the reasons the two report sets cannot be compared; empty when they can. */
function checkComparable(points) {
    const reasons = [];
    const all = [];
    for (const [label, point] of Object.entries(points)) {
        const runs = point.reports.map((entry) => entry.run);
        if (runs.length !== RUNS_PER_POINT || new Set(runs).size !== RUNS_PER_POINT || !runs.every((run, index) => run === index + 1)) {
            reasons.push(`${label} (${point.sha}): need exactly ${RUNS_PER_POINT} runs numbered 1 to ${RUNS_PER_POINT}, found [${runs.join(', ')}]`);
        }
        for (const entry of point.reports) {
            all.push({ label, point, ...entry });
            const { report } = entry;
            if (!report.runner || !report.environment) {
                reasons.push(`${entry.file}: no runner or environment block`);
                continue;
            }
            if (!report.runner.worktreeHead || !report.runner.worktreeHead.startsWith(point.sha)) {
                reasons.push(`${entry.file}: runner.worktreeHead ${report.runner.worktreeHead} does not start with ${point.sha}`);
            }
            for (const flag of MUST_BE_UNSET_FLAGS) {
                if (report.environment.flags?.[flag] !== false) {
                    reasons.push(`${entry.file}: flag ${flag} is not recorded as unset`);
                }
            }
            if (report.environment.flags?.RUN_PERF_BENCHMARKS !== true) {
                reasons.push(`${entry.file}: RUN_PERF_BENCHMARKS is not recorded as set (verifiers may have wrapped the build)`);
            }
            if (report.runner.jasmineExit !== 0) {
                reasons.push(`${entry.file}: jasmineExit is ${report.runner.jasmineExit}`);
            }
        }
        const scripted = point.reports.map((entry) => entry.report.scriptedGame);
        if (scripted.length > 0 && (scripted.some((game) => game == null) || !sameValue(scripted))) {
            reasons.push(`${label} (${point.sha}): the scripted game's counts differ across runs`);
        }
        const positionOne = point.reports.filter((entry) => entry.report.runner?.position === 1).length;
        if (positionOne !== RUNS_PER_POINT / 2) {
            reasons.push(`${label} (${point.sha}): at position 1 in ${positionOne} rounds, counterbalancing needs ${RUNS_PER_POINT / 2}`);
        }
    }

    const reportsOf = all.filter((entry) => entry.report.runner && entry.report.environment);
    for (const key of PROBE_FILE_KEYS) {
        const hashes = reportsOf.map((entry) => entry.report.runner.files?.[key]?.sha256);
        if (!sameValue(hashes) || hashes[0] == null) {
            reasons.push(`runner.files.${key}.sha256 is not identical across all reports of both points`);
        }
    }
    for (const [description, read] of [
        ['Node version', (report) => report.environment.nodeVersion],
        ['runner Node version', (report) => report.runner.node],
        ['CPU model', (report) => report.environment.cpuModel],
        ['cardFileCount', (report) => report.environment.cardFileCount],
        ['cardDataHash', (report) => report.environment.cardDataHash]
    ]) {
        const values = reportsOf.map((entry) => read(entry.report));
        if (!sameValue(values) || values[0] == null) {
            reasons.push(`${description} is not one value across both points: ${[...new Set(values.map((value) => String(value)))].join(' | ')}`);
        }
    }

    const earlierByRound = new Map(points.earlier.reports.map((entry) => [entry.report.runner?.round, entry.report.runner?.position]));
    for (const entry of points.later.reports) {
        const earlierPosition = earlierByRound.get(entry.report.runner?.round);
        const laterPosition = entry.report.runner?.position;
        if (earlierPosition == null || laterPosition == null || earlierPosition === laterPosition) {
            reasons.push(`round ${entry.report.runner?.round}: the two points do not hold positions 1 and 2 (earlier ${earlierPosition}, later ${laterPosition})`);
        }
    }
    return reasons;
}

function statisticRow(earlierValues, laterValues) {
    const earlierMedian = median(earlierValues);
    const laterMedian = median(laterValues);
    const earlierBand = band(earlierValues);
    const laterBand = band(laterValues);
    const change = (laterMedian - earlierMedian) / earlierMedian;
    const disjointSlower = laterBand.min > earlierBand.max;
    const disjointFaster = laterBand.max < earlierBand.min;
    return {
        earlierMedian,
        laterMedian,
        earlierBand,
        laterBand,
        change,
        bandsOverlap: !disjointSlower && !disjointFaster,
        slower: change > THRESHOLD && disjointSlower,
        faster: change < -THRESHOLD && disjointFaster
    };
}

function productFor(points) {
    const earlierGame = points.earlier.reports[0].report.scriptedGame;
    const laterGame = points.later.reports[0].report.scriptedGame;
    const pick = (point, statistic, rowName) => median(point.reports.map((entry) => scenarioOf(entry.report, PRODUCT_SCENARIO)[rowName][statistic]));
    const out = { scenario: PRODUCT_SCENARIO, earlier: earlierGame, later: laterGame, statistics: {} };
    for (const statistic of STATISTICS) {
        const earlierFirst = pick(points.earlier, statistic, 'firstSnapshot');
        const laterFirst = pick(points.later, statistic, 'firstSnapshot');
        const laterCompanion = pick(points.later, statistic, 'withWrites');
        const earlierGameMs = earlierGame.snapshotsTaken * earlierFirst;
        const laterGameMs = laterGame.fullBuilds * laterFirst + laterGame.hollowSnapshots * laterCompanion;
        out.statistics[statistic] = {
            earlierFirstBuild: earlierFirst,
            laterFirstBuild: laterFirst,
            laterCompanion,
            earlierGameMs,
            laterGameMs,
            breakEvenFullBuildFraction: laterFirst <= laterCompanion ? null : (earlierFirst - laterCompanion) / (laterFirst - laterCompanion)
        };
    }

    const flags = [];
    for (const entry of points.earlier.reports) {
        for (const name of SCENARIOS) {
            if (scenarioOf(entry.report, name).withWrites.hollowSnapshots !== 0) {
                flags.push(`earlier ${entry.file} ${name}: companion hollow count is not 0`);
            }
        }
    }
    if (earlierGame.hollowSnapshots !== 0) {
        flags.push('earlier scripted game has hollow snapshots');
    }
    for (const entry of points.later.reports) {
        for (const name of SCENARIOS) {
            const row = scenarioOf(entry.report, name).withWrites;
            if (row.hollowSnapshots !== row.snapshotsTaken) {
                flags.push(`later ${entry.file} ${name}: companion hollow ${row.hollowSnapshots} of ${row.snapshotsTaken}`);
            }
        }
    }
    const consistency = [];
    if (earlierGame.fullBuilds + earlierGame.hollowSnapshots !== earlierGame.snapshotsTaken) {
        consistency.push('earlier: fullBuilds + hollowSnapshots != snapshotsTaken');
    }
    if (laterGame.fullBuilds + laterGame.hollowSnapshots !== laterGame.snapshotsTaken) {
        consistency.push('later: fullBuilds + hollowSnapshots != snapshotsTaken');
    }
    for (const key of ['snapshotsTaken', 'byTimepointAndPhase', 'finalPhase', 'p1BaseDamage', 'p2BaseDamage']) {
        if (JSON.stringify(earlierGame[key]) !== JSON.stringify(laterGame[key])) {
            consistency.push(`the two sides differ in ${key}`);
        }
    }
    out.unreliableFlags = flags;
    out.productReliable = flags.length === 0;
    out.scriptedCountsConsistent = consistency.length === 0;
    out.scriptedCountsInconsistencies = consistency;
    return out;
}

function objectCountsFor(points) {
    const out = {};
    for (const [label, point] of Object.entries(points)) {
        out[label] = {};
        for (const name of SCENARIOS) {
            const readUnique = (field) => [...new Set(point.reports.map((entry) => JSON.stringify(scenarioOf(entry.report, name)[field])))].map((text) => JSON.parse(text));
            out[label][name] = { afterSetup: readUnique('objectsAfterSetup'), afterFirstTimedCall: readUnique('objectsAfterFirstTimedCall') };
        }
    }
    return out;
}

/** `points` is `{ earlier: { sha, reports }, later: { sha, reports } }`; returns `{ exitCode, reasons, ... }`. */
function analyze(points) {
    const reasons = checkComparable(points);
    if (reasons.length > 0) {
        return { exitCode: 2, reasons };
    }

    const scenarios = {};
    let slowerScenarios = 0;
    let fasterScenarios = 0;
    for (const name of SCENARIOS) {
        const perStatistic = {};
        for (const statistic of STATISTICS) {
            const earlierValues = points.earlier.reports.map((entry) => scenarioOf(entry.report, name).firstSnapshot[statistic]);
            const laterValues = points.later.reports.map((entry) => scenarioOf(entry.report, name).firstSnapshot[statistic]);
            perStatistic[statistic] = statisticRow(earlierValues, laterValues);
        }
        const slowerBy = STATISTICS.filter((statistic) => perStatistic[statistic].slower);
        const fasterBy = STATISTICS.filter((statistic) => perStatistic[statistic].faster);
        const companion = {
            earlierMedianAvgMs: median(points.earlier.reports.map((entry) => scenarioOf(entry.report, name).withWrites.avgMs)),
            laterMedianAvgMs: median(points.later.reports.map((entry) => scenarioOf(entry.report, name).withWrites.avgMs))
        };
        scenarios[name] = { statistics: perStatistic, countsAsSlower: slowerBy.length > 0, slowerBy, countsAsFaster: fasterBy.length > 0, fasterBy, companion };
        slowerScenarios += slowerBy.length > 0 ? 1 : 0;
        fasterScenarios += fasterBy.length > 0 ? 1 : 0;
    }

    let verdict = 'no-regression-at-this-resolution';
    if (slowerScenarios >= 2) {
        verdict = 'regression';
    } else if (fasterScenarios >= 2) {
        verdict = 'improvement';
    }

    return {
        exitCode: 0,
        reasons: [],
        earlier: points.earlier.sha,
        later: points.later.sha,
        runsPerPoint: RUNS_PER_POINT,
        thresholdFraction: THRESHOLD,
        scenarios,
        slowerScenarios,
        fasterScenarios,
        verdict,
        perGameProduct: productFor(points),
        objectCounts: objectCountsFor(points)
    };
}

function formatNumber(value) {
    return value == null ? 'n/a' : value.toFixed(4);
}

function formatPercent(value) {
    return `${(value * 100).toFixed(1)}%`;
}

function markdownFor(result) {
    const lines = [];
    lines.push(`Earlier ${result.earlier}, later ${result.later}, ${result.runsPerPoint} runs per point; threshold ${formatPercent(result.thresholdFraction)}.`);
    lines.push('');
    for (const statistic of STATISTICS) {
        lines.push(`| scenario | ${statistic} earlier median (band) | later median (band) | change | bands overlap | counts |`);
        lines.push('|---|---|---|---|---|---|');
        for (const name of SCENARIOS) {
            const row = result.scenarios[name].statistics[statistic];
            const counts = row.slower ? 'slower' : row.faster ? 'faster' : 'no';
            lines.push(`| ${name} | ${formatNumber(row.earlierMedian)} (${formatNumber(row.earlierBand.min)} to ${formatNumber(row.earlierBand.max)}) | ${formatNumber(row.laterMedian)} (${formatNumber(row.laterBand.min)} to ${formatNumber(row.laterBand.max)}) | ${formatPercent(row.change)} | ${row.bandsOverlap ? 'yes' : 'no'} | ${counts} |`);
        }
        lines.push('');
    }
    lines.push(`Scenarios counting as slower: ${result.slowerScenarios}; as faster: ${result.fasterScenarios}; verdict: ${result.verdict}.`);
    lines.push('');
    lines.push('| scenario | companion avg earlier median | companion avg later median |');
    lines.push('|---|---|---|');
    for (const name of SCENARIOS) {
        lines.push(`| ${name} | ${formatNumber(result.scenarios[name].companion.earlierMedianAvgMs)} | ${formatNumber(result.scenarios[name].companion.laterMedianAvgMs)} |`);
    }
    lines.push('');
    const product = result.perGameProduct;
    lines.push(`Scripted game (${product.scenario}): earlier ${JSON.stringify({ snapshotsTaken: product.earlier.snapshotsTaken, fullBuilds: product.earlier.fullBuilds, hollowSnapshots: product.earlier.hollowSnapshots })}, later ${JSON.stringify({ snapshotsTaken: product.later.snapshotsTaken, fullBuilds: product.later.fullBuilds, hollowSnapshots: product.later.hollowSnapshots })}; final phase ${product.earlier.finalPhase}/${product.later.finalPhase}; counts consistent: ${product.scriptedCountsConsistent}; product reliable: ${product.productReliable}.`);
    lines.push('');
    lines.push('| statistic | earlier first build | later first build | later companion | earlier game ms | later game ms | break-even full-build fraction |');
    lines.push('|---|---|---|---|---|---|---|');
    for (const statistic of STATISTICS) {
        const row = product.statistics[statistic];
        lines.push(`| ${statistic} | ${formatNumber(row.earlierFirstBuild)} | ${formatNumber(row.laterFirstBuild)} | ${formatNumber(row.laterCompanion)} | ${formatNumber(row.earlierGameMs)} | ${formatNumber(row.laterGameMs)} | ${row.breakEvenFullBuildFraction == null ? 'undefined' : row.breakEvenFullBuildFraction.toFixed(4)} |`);
    }
    lines.push('');
    lines.push('Live GameObject counts (lastGameObjectId / live count), distinct values over the runs of a point.');
    lines.push('');
    lines.push('| scenario | point | after setup | after first timed call |');
    lines.push('|---|---|---|---|');
    for (const name of SCENARIOS) {
        for (const label of ['earlier', 'later']) {
            const entry = result.objectCounts[label][name];
            const show = (values) => values.map((value) => (value == null ? 'n/a' : `${value.lastGameObjectId} / ${value.liveObjectCount}`)).join('; ');
            lines.push(`| ${name} | ${label} | ${show(entry.afterSetup)} | ${show(entry.afterFirstTimedCall)} |`);
        }
    }
    for (const note of [...product.unreliableFlags, ...product.scriptedCountsInconsistencies]) {
        lines.push('');
        lines.push(`Flag: ${note}`);
    }
    return lines.join('\n');
}

// --- self-test ----------------------------------------------------------------------------------------------------------------

function syntheticReport(sha, run, perScenario, options = {}) {
    const isEarlier = options.isEarlier;
    const position = (run % 2 === 1) === isEarlier ? 1 : 2;
    const hash = (key) => options.hashes?.[key] ?? `hash-${key}`;
    return {
        file: `p8-r0-${sha}-run${run}.json`,
        run,
        report: {
            schemaVersion: 1,
            probe: 'p8-r0-first-snapshot',
            environment: {
                nodeVersion: 'v26.13.0',
                cpuModel: 'cpu',
                cardFileCount: 2560,
                cardDataHash: 'abc',
                flags: { ENABLE_PARITY_HARNESS: false, ENABLE_UNDO_ALL_TESTS: false, MEASURE_SAVE_DEGRADATION: false, FIRST_SNAPSHOT_PROBE_ALLOW_VERIFIERS: false, RUN_PERF_BENCHMARKS: true }
            },
            runner: {
                round: run,
                position,
                worktreeHead: `${sha}0000`,
                node: 'v26.13.0',
                jasmineExit: 0,
                files: Object.fromEntries(PROBE_FILE_KEYS.map((key) => [key, { sha256: hash(key) }]))
            },
            scenarios: SCENARIOS.map((name) => ({
                scenario: name,
                firstSnapshot: { avgMs: perScenario[name].avg[run - 1], p50Ms: perScenario[name].p50[run - 1] },
                withWrites: isEarlier ? { avgMs: 0.25, hollowSnapshots: 0, snapshotsTaken: 420 } : { avgMs: 0.0125, hollowSnapshots: 420, snapshotsTaken: 420 },
                objectsAfterSetup: { lastGameObjectId: 1, liveObjectCount: 2 },
                objectsAfterFirstTimedCall: { lastGameObjectId: 1, liveObjectCount: 2 }
            })),
            scriptedGame: isEarlier
                ? { snapshotsTaken: 29, fullBuilds: 29, hollowSnapshots: 0, byTimepointAndPhase: { 'action/action': 29 }, finalPhase: 'action', p1BaseDamage: 6, p2BaseDamage: 12 }
                : { snapshotsTaken: 29, fullBuilds: 13, hollowSnapshots: 16, byTimepointAndPhase: { 'action/action': 29 }, finalPhase: 'action', p1BaseDamage: 6, p2BaseDamage: 12 }
        }
    };
}

function syntheticPoints(earlierSpec, laterSpec, options = {}) {
    const build = (sha, spec, isEarlier, runs) => ({
        sha,
        reports: Array.from({ length: runs }, (_, index) => syntheticReport(sha, index + 1, spec, { isEarlier, hashes: options.laterHashes && !isEarlier ? options.laterHashes : undefined }))
    });
    return { earlier: build('aaaaaaaaa', earlierSpec, true, options.earlierRuns ?? RUNS_PER_POINT), later: build('bbbbbbbbb', laterSpec, false, options.laterRuns ?? RUNS_PER_POINT) };
}

const flat = (value) => ({ avg: Array(RUNS_PER_POINT).fill(value), p50: Array(RUNS_PER_POINT).fill(value) });
const withValues = (avg, p50) => ({ avg, p50 });

function selfTest() {
    let mismatches = 0;
    const check = (label, actual, expected) => {
        const ok = JSON.stringify(actual) === JSON.stringify(expected);
        console.log(`${ok ? 'ok  ' : 'FAIL'} ${label}${ok ? '' : ` (expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)})`}`);
        if (!ok) {
            mismatches++;
        }
    };
    const scenarioSpec = (first, second, third) => ({ [SCENARIOS[0]]: first, [SCENARIOS[1]]: second, [SCENARIOS[2]]: third });
    const verdictOf = (points) => {
        const result = analyze(points);
        return result.exitCode === 0 ? result.verdict : `exit ${result.exitCode}`;
    };
    const base = flat(100);
    const slower = withValues([130, 131, 132, 133, 134, 135], [130, 131, 132, 133, 134, 135]);
    const spread = withValues([100, 101, 102, 103, 104, 105], [100, 101, 102, 103, 104, 105]);
    const slowerSpread = withValues([130, 131, 132, 133, 134, 135], [130, 131, 132, 133, 134, 135]);
    const faster = withValues([70, 71, 72, 73, 74, 75], [70, 71, 72, 73, 74, 75]);

    check('two scenarios clearly slower gives regression', verdictOf(syntheticPoints(scenarioSpec(spread, spread, spread), scenarioSpec(slowerSpread, slowerSpread, spread))), 'regression');
    check('three scenarios clearly slower gives regression', verdictOf(syntheticPoints(scenarioSpec(spread, spread, spread), scenarioSpec(slowerSpread, slowerSpread, slowerSpread))), 'regression');
    check('exactly 20.0 percent does not count', verdictOf(syntheticPoints(scenarioSpec(base, base, base), scenarioSpec(flat(120), flat(120), flat(120)))), 'no-regression-at-this-resolution');
    check('just over 20 percent with disjoint bands counts', verdictOf(syntheticPoints(scenarioSpec(base, base, base), scenarioSpec(flat(120.5), flat(120.5), flat(100)))), 'regression');
    const overlapEarlier = withValues([100, 100, 100, 100, 100, 150], [100, 100, 100, 100, 100, 150]);
    const overlapLater = withValues([125, 125, 125, 125, 125, 140], [125, 125, 125, 125, 125, 140]);
    check('over 20 percent with overlapping bands does not count', verdictOf(syntheticPoints(scenarioSpec(overlapEarlier, overlapEarlier, overlapEarlier), scenarioSpec(overlapLater, overlapLater, overlapLater))), 'no-regression-at-this-resolution');
    const touchEarlier = withValues([100, 100, 100, 100, 100, 130], [100, 100, 100, 100, 100, 130]);
    check('touching bands count as overlapping', verdictOf(syntheticPoints(scenarioSpec(touchEarlier, touchEarlier, touchEarlier), scenarioSpec(flat(130), flat(130), flat(130)))), 'no-regression-at-this-resolution');
    check('one slower scenario gives no-regression-at-this-resolution', verdictOf(syntheticPoints(scenarioSpec(spread, spread, spread), scenarioSpec(slowerSpread, spread, spread))), 'no-regression-at-this-resolution');
    check('two scenarios clearly faster gives improvement', verdictOf(syntheticPoints(scenarioSpec(flat(100), flat(100), flat(100)), scenarioSpec(faster, faster, flat(100)))), 'improvement');
    const avgOnlyLater = withValues([130, 131, 132, 133, 134, 135], [100, 101, 102, 103, 104, 105]);
    const p50OnlyLater = withValues([100, 101, 102, 103, 104, 105], [130, 131, 132, 133, 134, 135]);
    const avgOnlyResult = analyze(syntheticPoints(scenarioSpec(spread, spread, spread), scenarioSpec(avgOnlyLater, avgOnlyLater, spread)));
    check('avg-only qualification counts', [avgOnlyResult.verdict, avgOnlyResult.scenarios[SCENARIOS[0]].slowerBy], ['regression', ['avgMs']]);
    const p50OnlyResult = analyze(syntheticPoints(scenarioSpec(spread, spread, spread), scenarioSpec(p50OnlyLater, p50OnlyLater, spread)));
    check('p50-only qualification counts', [p50OnlyResult.verdict, p50OnlyResult.scenarios[SCENARIOS[0]].slowerBy], ['regression', ['p50Ms']]);
    check('a differing spec hash gives exit 2', verdictOf(syntheticPoints(scenarioSpec(base, base, base), scenarioSpec(base, base, base), { laterHashes: { spec: 'other' } })), 'exit 2');
    check('fewer than six runs gives exit 2', verdictOf(syntheticPoints(scenarioSpec(base, base, base), scenarioSpec(base, base, base), { laterRuns: 5 })), 'exit 2');
    check('seven runs gives exit 2', verdictOf(syntheticPoints(scenarioSpec(base, base, base), scenarioSpec(base, base, base), { earlierRuns: 7 })), 'exit 2');

    const sixSorted = median([5, 1, 4, 2, 3, 6]);
    check('median of six is the mean of the third and fourth sorted values', sixSorted, 3.5);

    const worked = analyze(syntheticPoints(scenarioSpec(flat(0.25), flat(0.25), flat(0.25)), scenarioSpec(flat(0.3), flat(0.3), flat(0.3))));
    const product = worked.perGameProduct.statistics.avgMs;
    check('worked example: earlier game ms (29 x 0.25)', product.earlierGameMs, 7.25);
    check('worked example: later game ms (13 x 0.3 + 16 x 0.0125)', Math.round(product.laterGameMs * 1e9) / 1e9, 4.1);
    check('worked example: break-even fraction (0.25 - 0.0125) / (0.3 - 0.0125)', Math.round(product.breakEvenFullBuildFraction * 1e6) / 1e6, 0.826087);
    const undefinedFraction = analyze(syntheticPoints(scenarioSpec(flat(0.25), flat(0.25), flat(0.25)), scenarioSpec(flat(0.01), flat(0.01), flat(0.01)))).perGameProduct.statistics.avgMs.breakEvenFullBuildFraction;
    check('break-even fraction is undefined when the later first build is not above the companion', undefinedFraction, null);
    check('worked example product is reliable and counts consistent', [worked.perGameProduct.productReliable, worked.perGameProduct.scriptedCountsConsistent], [true, true]);

    console.log(mismatches === 0 ? 'self-test passed' : `self-test FAILED: ${mismatches} mismatches`);
    process.exit(mismatches === 0 ? 0 : 1);
}

function parseArgs(argv) {
    const options = { dir: path.join(repoRoot, 'docs', 'plans', 'performance'), earlier: null, later: null, jsonOut: null, selfTest: false };
    for (let index = 0; index < argv.length; index++) {
        const arg = argv[index];
        switch (arg) {
            case '--dir':
                options.dir = path.resolve(argv[++index]);
                break;
            case '--earlier':
                options.earlier = argv[++index];
                break;
            case '--later':
                options.later = argv[++index];
                break;
            case '--json-out':
                options.jsonOut = path.resolve(argv[++index]);
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

function main() {
    const options = parseArgs(process.argv.slice(2));
    if (options.selfTest) {
        selfTest();
        return;
    }
    if (!options.earlier || !options.later) {
        console.error('analyze-first-snapshot-probe: --earlier and --later (nine-character commit prefixes) are required');
        process.exit(2);
    }
    const points = {
        earlier: { sha: options.earlier, reports: loadReports(options.dir, options.earlier) },
        later: { sha: options.later, reports: loadReports(options.dir, options.later) }
    };
    const result = analyze(points);
    if (result.exitCode !== 0) {
        console.error('analyze-first-snapshot-probe: the reports are not comparable:');
        for (const reason of result.reasons) {
            console.error(`  - ${reason}`);
        }
        process.exit(2);
    }
    if (options.jsonOut) {
        fs.writeFileSync(options.jsonOut, `${JSON.stringify(result, null, 2)}\n`, 'utf8');
    }
    console.log(markdownFor(result));
}

main();
