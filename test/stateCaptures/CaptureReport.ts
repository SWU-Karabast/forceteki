// Jasmine helper for `npm run capture-states`: once every capture spec has run, fails the run on any
// capture that is out of date, and in update mode deletes captures no spec produces anymore.

import { CaptureRun } from './CaptureRun';

// Specs that were skipped (`xit`, `pending()`) or left out by a focused one never reached their
// captures, so their files look stale and the run can't say whether the captures are current
const specsNotRun: string[] = [];

// Whether a capture spec or suite failed, and so may not have reached all its captures
let anyFailed = false;

jasmine.getEnv().addReporter({
    specDone: (result) => {
        if (result.status === 'pending' || result.status === 'excluded') {
            specsNotRun.push(result.fullName);
        }
        if (result.status === 'failed') {
            anyFailed = true;
        }
    },

    suiteDone: (result) => {
        if (result.status === 'failed') {
            anyFailed = true;
        }
    },

    // Deleting waits for the whole run to have passed: a spec that failed partway, or a suite that
    // failed to load, never reached its captures either
    jasmineDone: (result) => {
        if (result.overallStatus === 'passed') {
            CaptureRun.get().deleteStaleFiles();
        }
    },
});

afterAll(function () {
    if (specsNotRun.length > 0) {
        fail(`Every capture spec must run, but these did not:\n  ${specsNotRun.join('\n  ')}`);
        return;
    }

    const problems = CaptureRun.get().problems(!anyFailed);
    if (problems.length > 0) {
        fail(`Captured states are out of date. If the change is intended, run \`npm run capture-states -- --update\` and commit the result.\n  ${problems.join('\n  ')}`);
    }
});
