// One `npm run capture-states` run: whether it checks or updates the committed snapshots, which
// files its captures produced, and what it found. Capture helpers record each file here as they go;
// `CaptureReport` asks it for the verdict once every capture spec has run.

import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'fs';
import { dirname, join, relative } from 'path';

export enum CaptureMode {
    Check = 'check',
    Update = 'update',
}

export class SnapshotRun {
    /** Where the committed snapshots live, relative to the repo root (capture runs from there). */
    private static readonly Root = join(process.cwd(), 'test', 'stateSnapshots');

    private static current?: SnapshotRun;

    /** Every snapshot file written or checked in this run, as a `/`-separated path under the root. */
    private readonly recorded = new Set<string>();

    /** Files whose committed contents differ from what the engine produced, in check mode. */
    private readonly mismatches: string[] = [];

    private constructor(public readonly mode: CaptureMode) {}

    /** The run in progress, or an error if this isn't a capture run. */
    public static get(): SnapshotRun {
        if (!SnapshotRun.current) {
            const mode = process.env.CAPTURE_STATES;
            if (mode !== CaptureMode.Check && mode !== CaptureMode.Update) {
                throw new Error('state capture runs only under `npm run capture-states`');
            }
            SnapshotRun.current = new SnapshotRun(mode);
        }
        return SnapshotRun.current;
    }

    /** Writes or checks one snapshot file, at `relativePath` (`/`-separated) under the root. */
    public record(relativePath: string, content: string) {
        if (this.recorded.has(relativePath)) {
            throw new Error(`state snapshot ${relativePath} is captured twice; give each capture its own name`);
        }
        this.recorded.add(relativePath);

        const path = join(SnapshotRun.Root, relativePath);
        if (this.mode === CaptureMode.Update) {
            mkdirSync(dirname(path), { recursive: true });
            writeFileSync(path, content);
        } else if (!existsSync(path)) {
            this.mismatches.push(`${relativePath}: missing`);
        } else {
            const committed = readFileSync(path, 'utf8');
            if (committed !== content) {
                const differences = SnapshotRun.describeDifferences(committed, content);
                this.mismatches.push(`${relativePath}: differs from what the engine sends${differences.map((line) => `\n      ${line}`).join('')}`);
            }
        }
    }

    /** How many changed paths a mismatch lists before summarizing the rest. */
    private static readonly MaxDifferencesShown = 20;

    /**
     * The JSON paths where the committed file and what the engine produced disagree, as
     * `path: committed → produced`, so a failed check says what changed without regenerating locally.
     */
    private static describeDifferences(committedText: string, producedText: string): string[] {
        let committed: unknown;
        try {
            committed = JSON.parse(committedText);
        } catch {
            return ['the committed file is not valid JSON (an unresolved merge conflict?)'];
        }
        const produced: unknown = JSON.parse(producedText);

        const differences: string[] = [];
        const show = (value: unknown) => {
            if (value === undefined) {
                return '(absent)';
            }
            const text = JSON.stringify(value);
            return text.length > 60 ? `${text.slice(0, 57)}...` : text;
        };
        const isObject = (value: unknown): value is Record<string, unknown> => value !== null && typeof value === 'object' && !Array.isArray(value);

        const compare = (before: unknown, after: unknown, path: string) => {
            if (Array.isArray(before) && Array.isArray(after)) {
                for (let i = 0; i < Math.max(before.length, after.length); i++) {
                    compare(before[i], after[i], `${path}[${i}]`);
                }
            } else if (isObject(before) && isObject(after)) {
                for (const key of new Set([...Object.keys(before), ...Object.keys(after)])) {
                    compare(before[key], after[key], path ? `${path}.${key}` : key);
                }
            } else if (JSON.stringify(before) !== JSON.stringify(after)) {
                differences.push(`${path || '(root)'}: ${show(before)} → ${show(after)}`);
            }
        };
        compare(committed, produced, '');

        if (differences.length === 0) {
            return ['only the formatting differs (line endings or whitespace)'];
        }
        if (differences.length > SnapshotRun.MaxDifferencesShown) {
            const hidden = differences.length - SnapshotRun.MaxDifferencesShown;
            return [...differences.slice(0, SnapshotRun.MaxDifferencesShown), `... and ${hidden} more`];
        }
        return differences;
    }

    /** In check mode, everything that makes the committed snapshots out of date. */
    public problems(): string[] {
        if (this.mode !== CaptureMode.Check) {
            return [];
        }
        return [...this.mismatches, ...this.staleFiles().map((file) => `${file}: no capture spec produces it anymore`)];
    }

    /**
     * In update mode, deletes committed snapshots no capture produced. Call it only once every
     * capture spec has run and passed: a spec that didn't run, or failed partway, never reached its
     * captures, so its files would look stale.
     */
    public deleteStaleFiles() {
        if (this.mode !== CaptureMode.Update) {
            return;
        }
        this.staleFiles().forEach((file) => rmSync(join(SnapshotRun.Root, file)));
    }

    private staleFiles(): string[] {
        return SnapshotRun.committedSnapshots(SnapshotRun.Root).filter((file) => !this.recorded.has(file));
    }

    private static committedSnapshots(dir: string): string[] {
        return readdirSync(dir).flatMap((entry) => {
            const path = join(dir, entry);
            if (statSync(path).isDirectory()) {
                return SnapshotRun.committedSnapshots(path);
            }
            // recorded paths use `/`; on Windows `relative` gives `\`
            return entry.endsWith('.json') ? [relative(SnapshotRun.Root, path).replace(/\\/g, '/')] : [];
        });
    }
}
