/**
 * Runs the existing integration suite with the save-degradation probe enabled
 * (`test/helpers/SaveDegradationProbe.js`) and reports, over one terminal quiescent action-phase board per
 * integration spec, the fraction that saves degraded, broken down by manifest category, plus the count
 * that failed to save at all.
 *
 * This is a VISIBILITY MEASUREMENT, not a ship gate: it says how complete the v1 save format's coverage of
 * the existing card pool is, biased toward whatever boards the suite's own spec authors happened to leave
 * at the end of their scenarios. It is never used to fail CI, and it is not part of the regular gating
 * commands (`npm run lint`, `npm run test-parallel`, `npm run test-parallel-undo`).
 *
 * Usage: npm run measure-degradation
 */

const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const repoRoot = path.resolve(__dirname, '..');
const outputDir = path.join(repoRoot, 'test', '.save-degradation');

const binDir = path.join(repoRoot, 'node_modules', '.bin');
const pathWithLocalBin = `${binDir}${path.delimiter}${process.env.PATH || ''}`;

function run(command, args, extraEnv = {}) {
    console.log(`\n> ${command} ${args.join(' ')}`);
    // Spawned from an `npm run` context so `concurrently` (used by build-test.js) resolves -- the failure
    // mode CLAUDE.md warns about only bites a bare `node scripts/build-test.js`.
    const result = spawnSync(command, args, {
        cwd: repoRoot,
        stdio: 'inherit',
        env: { ...process.env, PATH: pathWithLocalBin, Path: pathWithLocalBin, ...extraEnv },
    });
    // The report must still be produced even when the suite itself reports spec failures -- this script
    // does not throw on a non-zero test run, only logs it and continues to the merge step.
    return result.status;
}

function clearOutputDir() {
    fs.rmSync(outputDir, { recursive: true, force: true });
    fs.mkdirSync(outputDir, { recursive: true });
}

function mergeResults() {
    const files = fs.existsSync(outputDir) ? fs.readdirSync(outputDir).filter((name) => name.endsWith('.json')) : [];

    const merged = {
        sampled: 0,
        nonDegraded: 0,
        degraded: 0,
        byCategory: {},
        failed: 0,
        failedByKind: {},
    };

    for (const file of files) {
        const counters = JSON.parse(fs.readFileSync(path.join(outputDir, file), 'utf8'));
        merged.sampled += counters.sampled || 0;
        merged.nonDegraded += counters.nonDegraded || 0;
        merged.degraded += counters.degraded || 0;
        merged.failed += counters.failed || 0;

        for (const [category, bucket] of Object.entries(counters.byCategory || {})) {
            const existing = merged.byCategory[category] || (merged.byCategory[category] = { boards: 0, facts: 0 });
            existing.boards += bucket.boards || 0;
            existing.facts += bucket.facts || 0;
        }

        for (const [kind, bucket] of Object.entries(counters.failedByKind || {})) {
            const existing = merged.failedByKind[kind] || (merged.failedByKind[kind] = { count: 0, sampleMessages: [] });
            existing.count += bucket.count || 0;
            for (const message of bucket.sampleMessages || []) {
                if (existing.sampleMessages.length < 3) {
                    existing.sampleMessages.push(message);
                }
            }
        }
    }

    return merged;
}

function renderReport(merged) {
    const lines = [];
    lines.push('# Save-degradation measurement');
    lines.push('');
    lines.push('This is a visibility measurement, not a ship gate. The sample is one terminal quiescent');
    lines.push('action-phase board per integration spec, biased toward end-of-scenario positions and toward');
    lines.push('whatever the card pool\'s spec authors chose to test; it is not a population estimate.');
    lines.push('');
    lines.push(`**sampled: ${merged.sampled}**`);
    lines.push('');

    if (merged.sampled === 0) {
        lines.push('No boards were sampled -- the measurement itself failed. See the diagnostics below.');
    } else {
        const degradedShare = ((merged.degraded / merged.sampled) * 100).toFixed(1);
        lines.push('| | count | share of sampled |');
        lines.push('|---|---|---|');
        lines.push(`| non-degraded | ${merged.nonDegraded} | ${(100 - Number(degradedShare)).toFixed(1)}% |`);
        lines.push(`| degraded | ${merged.degraded} | ${degradedShare}% |`);
        lines.push('');
        lines.push('By manifest category (a board can carry more than one category, so board counts need not sum to `degraded`):');
        lines.push('');
        lines.push('| category | boards | facts |');
        lines.push('|---|---|---|');
        for (const [category, bucket] of Object.entries(merged.byCategory).sort()) {
            lines.push(`| ${category} | ${bucket.boards} | ${bucket.facts} |`);
        }
    }

    lines.push('');
    lines.push(`**failed to save: ${merged.failed}**`);
    if (merged.failed > 0) {
        lines.push('');
        lines.push('| error | count | sample messages |');
        lines.push('|---|---|---|');
        for (const [kind, bucket] of Object.entries(merged.failedByKind)) {
            lines.push(`| ${kind} | ${bucket.count} | ${bucket.sampleMessages.map((m) => `"${m}"`).join('; ')} |`);
        }
    }

    return lines.join('\n');
}

function main() {
    clearOutputDir();

    const buildStatus = run('node', ['scripts/build-test.js']);
    if (buildStatus !== 0) {
        console.error(`\nBuild failed with exit code ${buildStatus}; aborting the measurement.`);
        process.exitCode = 1;
        return;
    }

    run(
        'node',
        ['--enable-source-maps', 'node_modules/jasmine/bin/jasmine', '--config=./jasmine.json', '--parallel=4', '--random=true'],
        { NODE_ENV: 'test', MEASURE_SAVE_DEGRADATION: 'true' }
    );

    const merged = mergeResults();
    fs.writeFileSync(path.join(outputDir, 'summary.json'), JSON.stringify(merged, null, 2), 'utf8');

    const report = renderReport(merged);
    console.log(`\n${report}\n`);

    if (merged.sampled === 0) {
        console.error('measure-save-degradation: sampled === 0, which is a hard error -- the probe never matched a board. See test/.save-degradation/summary.json.');
        process.exitCode = 1;
    }
}

main();
