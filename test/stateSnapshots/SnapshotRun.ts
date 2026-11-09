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
        } else if (readFileSync(path, 'utf8') !== content) {
            this.mismatches.push(`${relativePath}: differs from what the engine sends`);
        }
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
