/**
 * Opt-in visibility measurement for `P2-E` AC11: over the existing integration suite, how often does a
 * terminal quiescent action-phase board save degraded, and which manifest categories cause it. Disabled by
 * default (the env var is unset), in which case `sample` is never even called from `isEnabled`'s own
 * gate -- see `IntegrationHelper.js`'s `afterEach`, whose tail call is the only caller.
 *
 * This is a measurement, not a ship gate: `scripts/measure-save-degradation.js` is the only reader of its
 * output, and it says so in its own report.
 */

const { save } = require('../../server/game/core/stateSerialization/MatchSerializer');
const { SaveIntegrityError } = require('../../server/game/core/stateSerialization/SavedMatchInterfaces');
const { PhaseName } = require('../../server/game/core/Constants');
const fs = require('fs');
const path = require('path');

// `__dirname` resolves against the *compiled* location (`build/test/helpers/`, since this file is copied
// as-is under `allowJs`), not the source tree, so this climbs out of `build/` explicitly rather than
// writing into a `build/test/.save-degradation/` the merge script (`scripts/measure-save-degradation.js`,
// which reads `<repoRoot>/test/.save-degradation/`) never looks at.
const outputDir = path.join(__dirname, '..', '..', '..', 'test', '.save-degradation');

// Read once at module scope, matching this file's own reasoning for `process.env.ENVIRONMENT` elsewhere in
// the test harness: an env var read once avoids a mid-run toggle producing an inconsistent sample.
const enabled = process.env.MEASURE_SAVE_DEGRADATION === 'true';

function isEnabled() {
    return enabled;
}

const counters = {
    sampled: 0,
    nonDegraded: 0,
    degraded: 0,
    byCategory: {},
    failed: 0,
    failedByKind: {},
};

/**
 * `context` is a spec's `SwuTestContext`. Gated on: a game exists, is in the action phase, and has not
 * ended -- the tail placement in `IntegrationHelper.js`'s existing `afterEach` already excludes
 * non-action-phase specs, unresolved-prompt boards, and (in serial mode) specs that already failed, so
 * this gate only needs to re-check what that placement does not structurally guarantee.
 *
 * Never calls `expect`, never rethrows, and returns `undefined` on any error: a measurement run must not
 * be able to flip a spec's verdict, and this function's own doc comment in the plan is the source of that
 * guarantee.
 */
function sample(context) {
    if (!enabled) {
        return;
    }

    try {
        const game = context && context.game;
        if (!game || game.currentPhase !== PhaseName.Action || game.isEnded) {
            return;
        }

        let document;
        try {
            document = save(game);
        } catch (error) {
            counters.failed++;
            const kind = error instanceof SaveIntegrityError ? 'SaveIntegrityError' : (error && error.constructor && error.constructor.name) || 'Unknown';
            const bucket = counters.failedByKind[kind] || (counters.failedByKind[kind] = { count: 0, sampleMessages: [] });
            bucket.count++;
            if (bucket.sampleMessages.length < 3) {
                bucket.sampleMessages.push(error && error.message);
            }
            return;
        }

        counters.sampled++;
        const facts = document.engineOnlyFacts || [];
        if (facts.length === 0) {
            counters.nonDegraded++;
        } else {
            counters.degraded++;
            const boardCategories = new Set();
            for (const fact of facts) {
                const bucket = counters.byCategory[fact.category] || (counters.byCategory[fact.category] = { boards: 0, facts: 0 });
                bucket.facts++;
                boardCategories.add(fact.category);
            }
            for (const category of boardCategories) {
                counters.byCategory[category].boards++;
            }
        }
    } catch {
        // Never observed by anything: this probe's whole guarantee is that it cannot affect a spec's
        // outcome.
    }
}

function writeReport() {
    if (!enabled) {
        return;
    }
    try {
        fs.mkdirSync(outputDir, { recursive: true });
        fs.writeFileSync(path.join(outputDir, `${process.pid}.json`), JSON.stringify(counters), 'utf8');
    } catch {
        // Best-effort: a write failure here must not crash a worker process on exit.
    }
}

// jasmine's parallel runner shuts workers down via `cluster.disconnect`, which lets a normal process exit
// occur, so `process.on('exit')` fires -- this is the seam that makes the probe correct under
// `--parallel=4` (each worker is its own process; this handler drains that process's own counters).
process.on('exit', writeReport);

module.exports = { isEnabled, sample };
