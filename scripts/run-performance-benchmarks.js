/**
 * Runs the snapshot/undo performance benchmarks and captures the result as a
 * report under `docs/plans/performance/`.
 *
 * This is Stage 0 tooling for the snapshot roadmap (`docs/plans/00-performance-benchmarks.md`).
 * Every plan captures a report when it lands, so the initial capture and the
 * post-roadmap capture can be compared directly.
 *
 * Usage:
 *   node scripts/run-performance-benchmarks.js --name initial-performance
 *   node scripts/run-performance-benchmarks.js --name after-plan-01 --compare initial-performance
 *   node scripts/run-performance-benchmarks.js --name quick --skip-build --skip-card-memory
 *
 * Options:
 *   --name <name>          Report basename written to docs/plans/performance/. Required.
 *   --label <text>         Free-text note recorded in the report header.
 *   --compare <name>       Existing capture to diff against; adds a comparison section.
 *   --skip-build           Reuse the existing build/ output.
 *   --skip-card-memory     Skip the card allocation benchmark.
 */

const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const repoRoot = path.resolve(__dirname, '..');
const performanceDir = path.join(repoRoot, 'docs', 'plans', 'performance');
const rawDir = path.join(performanceDir, '.raw');

function parseArgs(argv) {
    const options = { name: null, label: null, compare: null, skipBuild: false, skipCardMemory: false };

    for (let index = 0; index < argv.length; index++) {
        const arg = argv[index];
        switch (arg) {
            case '--name':
                options.name = argv[++index];
                break;
            case '--label':
                options.label = argv[++index];
                break;
            case '--compare':
                options.compare = argv[++index];
                break;
            case '--skip-build':
                options.skipBuild = true;
                break;
            case '--skip-card-memory':
                options.skipCardMemory = true;
                break;
            default:
                throw new Error(`Unknown argument: ${arg}`);
        }
    }

    if (!options.name) {
        throw new Error('--name is required, e.g. --name initial-performance');
    }

    if (!(/^[a-z0-9][a-z0-9-]*$/).test(options.name)) {
        throw new Error(`--name must be kebab-case: got "${options.name}"`);
    }

    return options;
}

// build-test.js shells out to `tsc`/`cpy`, which only resolve when node_modules/.bin is on PATH.
// npm adds it for `npm run ...`; add it here too so direct `node scripts/...` invocations work.
const binDir = path.join(repoRoot, 'node_modules', '.bin');
const pathWithLocalBin = `${binDir}${path.delimiter}${process.env.PATH || ''}`;

function run(command, args, extraEnv = {}) {
    console.log(`\n> ${command} ${args.join(' ')}`);
    const result = spawnSync(command, args, {
        cwd: repoRoot,
        stdio: 'inherit',
        env: { ...process.env, PATH: pathWithLocalBin, Path: pathWithLocalBin, ...extraEnv }
    });

    if (result.status !== 0) {
        throw new Error(`Command failed with exit code ${result.status}: ${command} ${args.join(' ')}`);
    }
}

// --- formatting helpers ---------------------------------------------------

function formatBytes(bytes) {
    if (bytes == null || !Number.isFinite(bytes)) {
        return 'n/a';
    }

    const sign = bytes < 0 ? '-' : '';
    const absoluteBytes = Math.abs(bytes);
    if (absoluteBytes < 1024) {
        return `${sign}${absoluteBytes.toFixed(0)} B`;
    }
    if (absoluteBytes < 1024 * 1024) {
        return `${sign}${(absoluteBytes / 1024).toFixed(1)} KiB`;
    }
    if (absoluteBytes < 1024 * 1024 * 1024) {
        return `${sign}${(absoluteBytes / (1024 * 1024)).toFixed(2)} MiB`;
    }
    return `${sign}${(absoluteBytes / (1024 * 1024 * 1024)).toFixed(2)} GiB`;
}

/** Percent change of `current` against `baseline`, phrased so negative always means "better". */
function formatChange(baseline, current) {
    if (baseline == null || current == null || !Number.isFinite(baseline) || !Number.isFinite(current)) {
        return 'n/a';
    }
    if (baseline === 0) {
        return current === 0 ? '0.0%' : 'n/a';
    }

    const change = ((current - baseline) / Math.abs(baseline)) * 100;
    const sign = change > 0 ? '+' : '';
    return `${sign}${change.toFixed(1)}%`;
}

function markdownTable(headers, rows) {
    const lines = [
        `| ${headers.join(' | ')} |`,
        `|${headers.map(() => '---').join('|')}|`
    ];

    for (const row of rows) {
        lines.push(`| ${row.join(' | ')} |`);
    }

    return lines.join('\n');
}

// --- report rendering -----------------------------------------------------

function renderEnvironment(environment) {
    const rows = [
        ['Captured at', environment.capturedAt],
        ['Commit', `\`${environment.gitCommit}\`${environment.gitDirty ? ' (working tree dirty)' : ''}`],
        ['Branch', `\`${environment.gitBranch}\``],
        ['Node', `${environment.nodeVersion} (V8 ${environment.v8Version})`],
        ['Platform', `${environment.platform} / ${environment.arch}`],
        ['CPU', `${environment.cpuModel} x${environment.cpuCount}`],
        ['System memory', formatBytes(environment.totalMemoryBytes)],
        ['`--expose-gc`', environment.exposeGc ? 'yes' : 'no']
    ];

    return markdownTable(['Field', 'Value'], rows);
}

function renderScenario(scenario) {
    const timingRows = scenario.results.map((result) => [
        `\`${result.category}/${result.benchmark}\``,
        result.iterations,
        result.avgMs.toFixed(3),
        result.p50Ms.toFixed(3),
        result.p95Ms.toFixed(3)
    ]);

    const memoryRows = scenario.results.map((result) => [
        `\`${result.category}/${result.benchmark}\``,
        formatBytes(result.timedMemoryAvg.heapUsedBytes),
        formatBytes(result.timedMemoryAvg.externalBytes),
        formatBytes(result.timedMemoryAvg.totalBytes),
        formatBytes(result.retainedMemoryDelta ? result.retainedMemoryDelta.totalBytes : null),
        result.gcCountPerIteration.toFixed(2),
        result.gcMsPerIteration.toFixed(3),
        `${((result.gcPauseFraction || 0) * 100).toFixed(1)}%`,
        `${result.gc.minorCount}/${result.gc.majorCount}/${result.gc.incrementalCount}`
    ]);

    const payloadRows = scenario.payloads.map((payload) => [
        `\`${payload.benchmark}\``,
        formatBytes(payload.serializedBytes),
        payload.notes
            ? Object.entries(payload.notes).map(([key, value]) => `${key}=${typeof value === 'number' ? formatBytes(value) : value}`)
                .join(', ')
            : ''
    ]);

    return [
        `### Scenario: \`${scenario.scenario}\``,
        '',
        `${scenario.liveGameObjects} live GameObjects · ${scenario.mutatedCards} mutated cards per iteration`,
        '',
        '**Speed** (ms per operation)',
        '',
        markdownTable(['Benchmark', 'Iters', 'Avg', 'p50', 'p95'], timingRows),
        '',
        '**Memory / GC pressure** (per operation, measured over the timed block only)',
        '',
        markdownTable(
            ['Benchmark', 'Heap', 'External', 'Total', 'Retained (loop)', 'GC/op', 'GC ms/op', 'GC pause', 'GCs min/maj/inc'],
            memoryRows
        ),
        '',
        '**Payload and retention**',
        '',
        markdownTable(['Measurement', 'Bytes', 'Notes'], payloadRows),
        ''
    ].join('\n');
}

function renderCardMemory(cardMemory) {
    if (!cardMemory) {
        return '_Not captured in this run._\n';
    }

    return [
        markdownTable(['Field', 'Value'], [
            ['Cards in dataset', cardMemory.cardsInDataset],
            ['Card objects retained', cardMemory.retainedCardCount],
            ['Heap delta', formatBytes(cardMemory.heapDeltaBytes)],
            ['External delta', formatBytes(cardMemory.externalDeltaBytes)],
            ['Total delta', formatBytes(cardMemory.totalDeltaBytes)],
            ['**Bytes per card object**', `**${formatBytes(cardMemory.bytesPerCard)}**`]
        ]),
        ''
    ].join('\n');
}

function indexResults(report) {
    const index = new Map();

    for (const scenario of report.scenarios) {
        for (const result of scenario.results) {
            index.set(`${scenario.scenario}::${result.category}/${result.benchmark}`, result);
        }
        for (const payload of scenario.payloads) {
            index.set(`${scenario.scenario}::payload/${payload.benchmark}`, payload);
        }
    }

    return index;
}

function renderComparison(baselineReport, currentReport, baselineName) {
    if (baselineReport.schemaVersion !== currentReport.schemaVersion) {
        return [
            `> **Comparison skipped.** \`${baselineName}\` uses report schema v${baselineReport.schemaVersion}`,
            `> but this capture is v${currentReport.schemaVersion}. The captured fields changed meaning,`,
            '> so a numeric diff would be misleading. Re-capture the baseline to compare.',
            ''
        ].join('\n');
    }

    const baselineIndex = indexResults(baselineReport);
    const rows = [];

    for (const scenario of currentReport.scenarios) {
        for (const result of scenario.results) {
            const key = `${scenario.scenario}::${result.category}/${result.benchmark}`;
            const baseline = baselineIndex.get(key);
            if (!baseline) {
                continue;
            }

            rows.push([
                `\`${scenario.scenario}\``,
                `\`${result.category}/${result.benchmark}\``,
                `${baseline.avgMs.toFixed(3)} → ${result.avgMs.toFixed(3)}`,
                formatChange(baseline.avgMs, result.avgMs),
                `${formatBytes(baseline.timedMemoryAvg.totalBytes)} → ${formatBytes(result.timedMemoryAvg.totalBytes)}`,
                formatChange(baseline.timedMemoryAvg.totalBytes, result.timedMemoryAvg.totalBytes),
                formatChange(baseline.gcMsPerIteration, result.gcMsPerIteration)
            ]);
        }

        for (const payload of scenario.payloads) {
            const baseline = baselineIndex.get(`${scenario.scenario}::payload/${payload.benchmark}`);
            if (!baseline) {
                continue;
            }

            rows.push([
                `\`${scenario.scenario}\``,
                `\`payload/${payload.benchmark}\``,
                '—',
                '—',
                `${formatBytes(baseline.serializedBytes)} → ${formatBytes(payload.serializedBytes)}`,
                formatChange(baseline.serializedBytes, payload.serializedBytes),
                '—'
            ]);
        }
    }

    if (rows.length === 0) {
        return `> No comparable benchmarks found in \`${baselineName}\`.\n`;
    }

    return [
        `Compared against [\`${baselineName}\`](${baselineName}.md). Negative is better in every column.`,
        '',
        markdownTable(['Scenario', 'Benchmark', 'Avg ms', 'Δ time', 'Memory/op', 'Δ memory', 'Δ GC ms'], rows),
        ''
    ].join('\n');
}

function renderReport(name, label, report, cardMemory, comparison) {
    const sections = [
        `# Performance capture: \`${name}\``,
        '',
        label ? `${label}\n` : '',
        '> Generated by `node scripts/run-performance-benchmarks.js`. Do not edit by hand —',
        `> the machine-readable source of truth is [\`${name}.json\`](${name}.json).`,
        '',
        '## Environment',
        '',
        renderEnvironment(report.environment),
        '',
        '## How to read this',
        '',
        '- **Speed** is wall time for one operation, timed block only. `p95` matters more than `avg`',
        '  for undo latency; `avg` matters more for per-action snapshot cost.',
        '- **Memory** is split into heap and external because snapshot payloads are `Buffer`s,',
        '  which live in `external`/`arrayBuffers` and are invisible to `heapUsed`.',
        '  `Total` = heap + external and is the number to quote.',
        '- **GC/op**, **GC ms/op** and **GC pause** are GC events and GC pause time attributed to',
        '  the timed window; `GC pause` is that pause time as a share of the benchmark\'s own wall',
        '  time. Rising GC pause is the failure mode this roadmap is chasing.',
        '- The `sustained/*` row is the one to read for GC. The per-operation benchmarks start from',
        '  a forced GC and run too few iterations to provoke natural collection, so near-zero GC',
        '  numbers there are an artifact of the method, not evidence of low GC pressure.',
        '- **Retained (loop)** is growth that survived a forced GC after the whole loop — a',
        '  retention/leak signal, not per-operation cost.',
        '- `manager/*` and `payload/*` are measured at the public `SnapshotManager` seam and stay',
        '  comparable across the whole roadmap. `full/*` measures current internals and is expected',
        '  to change meaning once Plans 3 and 4 land.',
        ''
    ];

    if (comparison) {
        sections.push('## Comparison', '', comparison);
    }

    sections.push('## Snapshot and rollback benchmarks', '');
    for (const scenario of report.scenarios) {
        sections.push(renderScenario(scenario));
    }

    sections.push(
        '## Card allocation memory',
        '',
        'Per-object memory floor for `Card` instances across the whole card dataset.',
        'Snapshot cost is O(live objects), so this multiplies into every snapshot.',
        '',
        renderCardMemory(cardMemory)
    );

    return `${sections.join('\n').replace(/\n{3,}/g, '\n\n')}\n`;
}

// --- main -----------------------------------------------------------------

function main() {
    const options = parseArgs(process.argv.slice(2));

    fs.mkdirSync(rawDir, { recursive: true });

    const benchmarkReportPath = path.join(rawDir, `${options.name}.benchmarks.json`);
    const cardMemoryReportPath = path.join(rawDir, `${options.name}.card-memory.json`);

    if (!options.skipBuild) {
        run(process.execPath, ['scripts/build-test.js'], { NODE_ENV: 'test' });
    }

    run(
        process.execPath,
        [
            '--expose-gc',
            '--enable-source-maps',
            'node_modules/jasmine/bin/jasmine',
            '--config=./jasmine.json',
            '--random=false',
            '--filter=SnapshotBenchmarks'
        ],
        {
            NODE_ENV: 'test',
            RUN_PERF_BENCHMARKS: '1',
            PERF_REPORT_PATH: benchmarkReportPath
        }
    );

    if (!options.skipCardMemory) {
        run(process.execPath, ['--expose-gc', 'scripts/card-memory-benchmark.js'], {
            NODE_ENV: 'test',
            CARD_MEMORY_REPORT_PATH: cardMemoryReportPath
        });
    }

    if (!fs.existsSync(benchmarkReportPath)) {
        throw new Error(`Benchmark run produced no report at ${benchmarkReportPath}. Did the spec suite match the --filter?`);
    }

    const report = JSON.parse(fs.readFileSync(benchmarkReportPath, 'utf8'));
    const cardMemory = fs.existsSync(cardMemoryReportPath)
        ? JSON.parse(fs.readFileSync(cardMemoryReportPath, 'utf8'))
        : null;

    let comparison = null;
    if (options.compare) {
        const baselinePath = path.join(performanceDir, `${options.compare}.json`);
        if (!fs.existsSync(baselinePath)) {
            throw new Error(`--compare target not found: ${baselinePath}`);
        }
        const baseline = JSON.parse(fs.readFileSync(baselinePath, 'utf8'));
        comparison = renderComparison(baseline.report, report, options.compare);
    }

    const combined = { name: options.name, label: options.label, report, cardMemory };
    fs.mkdirSync(performanceDir, { recursive: true });
    fs.writeFileSync(path.join(performanceDir, `${options.name}.json`), `${JSON.stringify(combined, null, 2)}\n`, 'utf8');
    fs.writeFileSync(
        path.join(performanceDir, `${options.name}.md`),
        renderReport(options.name, options.label, report, cardMemory, comparison),
        'utf8'
    );

    console.log(`\nCapture written to docs/plans/performance/${options.name}.md`);
    console.log(`Raw data at docs/plans/performance/${options.name}.json`);
}

try {
    main();
} catch (error) {
    console.error(`\n[performance] ${error.message}`);
    process.exitCode = 1;
}
