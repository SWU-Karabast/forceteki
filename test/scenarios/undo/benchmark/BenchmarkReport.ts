/**
 * Collects benchmark results into a machine-readable JSON report.
 *
 * The spec writes this file; `scripts/run-performance-benchmarks.js` renders it
 * into the markdown captures under `docs/plans/performance/`. Keeping the raw
 * JSON as the artifact of record means two captures can be diffed numerically
 * (initial vs. post-plan-6) instead of by eyeballing tables.
 *
 * The file is rewritten after every scenario rather than once at the end, so a
 * crash midway through a long run still leaves usable data behind.
 */

import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import type { IBenchmarkResult } from './BenchmarkHarness';

export interface IPayloadMeasurement {
    benchmark: string;
    category: 'payload';

    /** Extra dimensioning, e.g. bytes per live game object. */
    notes?: Record<string, number | string>;
    scenario: string;
    serializedBytes: number;
}

export interface IScenarioResults {
    liveGameObjects: number;
    mutatedCards: number;
    payloads: IPayloadMeasurement[];
    results: IBenchmarkResult[];
    scenario: string;
}

export interface IBenchmarkReport {
    environment: Record<string, unknown>;
    scenarios: IScenarioResults[];
    schemaVersion: number;
}

/**
 * Bump when the shape or meaning of the captured fields changes. The renderer
 * refuses to compare captures across schema versions rather than silently
 * producing a misleading delta.
 */
export const REPORT_SCHEMA_VERSION = 1;

const DEFAULT_REPORT_PATH = path.join('docs', 'plans', 'performance', '.raw', 'benchmark-report.json');

function tryGitValue(args: string[]): string | null {
    try {
        return execFileSync('git', args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
    } catch {
        return null;
    }
}

function captureEnvironment(): Record<string, unknown> {
    const cpus = os.cpus();

    return {
        capturedAt: new Date().toISOString(),
        gitCommit: tryGitValue(['rev-parse', '--short', 'HEAD']),
        gitBranch: tryGitValue(['rev-parse', '--abbrev-ref', 'HEAD']),
        gitDirty: tryGitValue(['status', '--porcelain']) !== '',
        nodeVersion: process.version,
        v8Version: process.versions.v8,
        platform: `${os.platform()} ${os.release()}`,
        arch: os.arch(),
        cpuModel: cpus[0]?.model ?? 'unknown',
        cpuCount: cpus.length,
        totalMemoryBytes: os.totalmem(),
        exposeGc: typeof global.gc === 'function'
    };
}

export class BenchmarkReportWriter {
    private readonly report: IBenchmarkReport;
    private readonly reportPath: string;

    public constructor(reportPath: string = process.env.PERF_REPORT_PATH || DEFAULT_REPORT_PATH) {
        this.reportPath = path.resolve(reportPath);
        this.report = {
            schemaVersion: REPORT_SCHEMA_VERSION,
            environment: captureEnvironment(),
            scenarios: []
        };
    }

    public addScenario(scenarioResults: IScenarioResults): void {
        this.report.scenarios.push(scenarioResults);
        this.write();
    }

    public write(): void {
        fs.mkdirSync(path.dirname(this.reportPath), { recursive: true });
        fs.writeFileSync(this.reportPath, `${JSON.stringify(this.report, null, 2)}\n`, 'utf8');
    }

    public get path(): string {
        return this.reportPath;
    }
}
