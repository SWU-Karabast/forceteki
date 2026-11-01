// Jasmine helper for `npm run capture-states`: after every capture spec has run, fails the run on
// any snapshot that differs from the engine's output, and finds snapshots no spec produces anymore.

import { readdirSync, rmSync, statSync } from 'fs';
import { join, relative } from 'path';
import { CaptureMode, captureMode, capturedFiles, mismatches, SnapshotRoot } from './StateCapture';

const committedSnapshots = (dir: string): string[] => readdirSync(dir).flatMap((entry) => {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) {
        return committedSnapshots(path);
    }
    return entry.endsWith('.json') ? [relative(SnapshotRoot, path)] : [];
});

// A capture spec that fails partway never reaches its later captures, so its files would look stale
let anySpecFailed = false;
jasmine.getEnv().addReporter({
    specDone: (result) => {
        anySpecFailed ||= result.status === 'failed';
    },
});

afterAll(function () {
    const mode = captureMode();
    const stale = committedSnapshots(SnapshotRoot).filter((file) => !capturedFiles.has(file));

    if (mode === CaptureMode.Update) {
        if (!anySpecFailed) {
            stale.forEach((file) => rmSync(join(SnapshotRoot, file)));
        }
        return;
    }

    const problems = [...mismatches, ...stale.map((file) => `${file}: no capture spec produces it anymore`)];
    if (problems.length > 0) {
        fail(`State snapshots are out of date. If the change is intended, run \`npm run capture-states -- --update\` and commit the result.\n  ${problems.join('\n  ')}`);
    }
});
