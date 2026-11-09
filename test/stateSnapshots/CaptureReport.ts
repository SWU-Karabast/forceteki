// Jasmine helper for `npm run capture-states`: once every capture spec has run, fails the run on any
// snapshot that is out of date, and in update mode deletes snapshots no spec produces anymore.

import { SnapshotRun } from './SnapshotRun';

// Specs that were skipped (`xit`, `pending()`) or left out by a focused one never reached their
// captures, so their files look stale and the run can't say whether the snapshots are current
const specsNotRun: string[] = [];

jasmine.getEnv().addReporter({
    specDone: (result) => {
        if (result.status === 'pending' || result.status === 'excluded') {
            specsNotRun.push(result.fullName);
        }
    },

    // Deleting waits for the whole run to have passed: a spec that failed partway, or a suite that
    // failed to load, never reached its captures either
    jasmineDone: (result) => {
        if (result.overallStatus === 'passed') {
            SnapshotRun.get().deleteStaleFiles();
        }
    },
});

afterAll(function () {
    if (specsNotRun.length > 0) {
        fail(`Every capture spec must run, but these did not:\n  ${specsNotRun.join('\n  ')}`);
        return;
    }

    const problems = SnapshotRun.get().problems();
    if (problems.length > 0) {
        fail(`State snapshots are out of date. If the change is intended, run \`npm run capture-states -- --update\` and commit the result.\n  ${problems.join('\n  ')}`);
    }
});
