// scripts/validateSpecs.ts
//
// Validates how the spec suite is split between the two jasmine groups:
//   - `jasmine-game.json`    specs that drive a `Game` through the card `integration()` harness (the
//                            undo job re-runs these in undo mode, which only means anything for a `Game`)
//   - `jasmine-nongame.json` everything else: the connection layer, services, scripts and utilities
//
// The split is made by directory globs, so it drifts silently when a spec is added in a directory
// nobody listed. This script fails the build when:
//   1. partition-gap / partition-overlap / partition-extra: the two configs do not partition the specs
//      that `jasmine.json` (what CI's main job runs) selects - a spec is run by neither group, by both,
//      or by a group `jasmine.json` does not know about.
//   2. game-harness-in-nongame: a spec that uses the card `integration()` harness sits in the non-game
//      group (it would be skipped by the undo job).
//   3. missing-game-harness: a spec in the game group does not use `integration()` and is not on the
//      exemption list below. Such a spec almost certainly belongs in a non-game directory.
//   4. unused-exemption: an exemption matches no file, or matches a file that does use `integration()`.
//
// `serverIntegration()` (the connection-layer harness) is not the card harness and does not count.
//
// Reads the source `.ts` tree rather than `build/`, so it needs no build. Prints a report and exits
// with code 1 on any violation so a GitHub Action can fail the PR. Exits 0 when clean.

import { readFileSync } from 'fs';
import { join } from 'path';
import { globSync } from 'glob';

const repoRoot = join(__dirname, '..');
const testRoot = join(repoRoot, 'test');

interface IJasmineConfig {
    spec_dir: string;
    spec_files: string[];
}

interface IViolation {
    file: string;
    check: string;
    detail: string;
}

interface IGameGroupExemption {

    /** Glob relative to `test/`. */
    pattern: string;
    reason: string;
}

const undoScenarioSpecsWithOwnHarness = [
    'AdditionalPhases',
    'CostPaymentRecovery',
    'IntraAction',
    'Performance',
    'PhaseStartAndEnd',
    'SnapshotTypes',
    'UndoConfirmation',
    'SwuPgnUndoRetention',
    'SwuPgnServedLogUndoLock',
    'SwuPgnGameEndUndo',
];

/**
 * Specs that live in the game group without using the card `integration()` harness. Keep this short:
 * a new entry means a spec is deliberately outside both the card harness and the non-game directories.
 * Entries are per file, not per directory, so a new spec added next to them is still checked.
 */
const gameGroupExemptions: IGameGroupExemption[] = [
    ...undoScenarioSpecsWithOwnHarness.map((name) => ({
        pattern: `scenarios/undo/${name}.spec.ts`,
        reason: 'undo scenarios build their own harness',
    })),
    { pattern: 'server/core/GameObjectBaseInitialization.spec.ts', reason: 'engine unit test of the state registration decorators' },
    { pattern: 'server/core/event/EventWindow.spec.ts', reason: 'engine unit test of event windows' },
    { pattern: 'server/chat/SwuPgn.spec.ts', reason: 'SWU-PGN writer unit test: drives the recorder/adapter/writer with stand-in engine objects, no Game' },
    { pattern: 'server/chat/SwuPgnGameAdapter.spec.ts', reason: 'SWU-PGN writer unit test: drives the recorder/adapter/writer with stand-in engine objects, no Game' },
    { pattern: 'server/chat/SwuPgnIdentity.spec.ts', reason: 'SWU-PGN writer unit test: drives the recorder/adapter/writer with stand-in engine objects, no Game' },
    { pattern: 'server/chat/SwuPgnSeed.spec.ts', reason: 'SWU-PGN writer unit test: drives the recorder/adapter/writer with stand-in engine objects, no Game' },
    { pattern: 'server/chat/SwuPgnWriter.spec.ts', reason: 'SWU-PGN writer unit test: drives the recorder/adapter/writer with stand-in engine objects, no Game' },
];

const PARTITION_GAP_CHECK = 'partition-gap';
const PARTITION_OVERLAP_CHECK = 'partition-overlap';
const PARTITION_EXTRA_CHECK = 'partition-extra';
const GAME_HARNESS_IN_NONGAME_CHECK = 'game-harness-in-nongame';
const MISSING_GAME_HARNESS_CHECK = 'missing-game-harness';
const UNUSED_EXEMPTION_CHECK = 'unused-exemption';
const CONFIG_CHECK = 'config';

const configFiles = {
    all: 'jasmine.json',
    game: 'jasmine-game.json',
    nonGame: 'jasmine-nongame.json',
};

// The card harness is `integration(`; the negative lookbehind keeps `serverIntegration(` from counting.
const CARD_HARNESS_RE = /(?<![A-Za-z])integration\(/;

function readConfig(configFile: string): IJasmineConfig {
    return JSON.parse(readFileSync(join(repoRoot, configFile), 'utf8')) as IJasmineConfig;
}

/**
 * Expands a jasmine config's `spec_files` against the source tree. The configs select compiled `.js`
 * files under `build/test`; the matching sources are the `.ts` files under `test`.
 */
function resolveSpecs(configFile: string, violations: IViolation[]): Set<string> {
    const config = readConfig(configFile);
    if (config.spec_dir !== 'build/test') {
        violations.push({
            file: configFile,
            check: CONFIG_CHECK,
            detail: `spec_dir is '${config.spec_dir}' but this script maps 'build/test' to 'test'; update scripts/validateSpecs.ts`,
        });
    }

    const include = config.spec_files
        .filter((pattern) => !pattern.startsWith('!'))
        .map((pattern) => pattern.replace(/\.js$/, '.ts'));
    const ignore = config.spec_files
        .filter((pattern) => pattern.startsWith('!'))
        .map((pattern) => pattern.slice(1));

    return new Set(globSync(include, { cwd: testRoot, ignore, posix: true }));
}

function usesCardHarness(specPath: string): boolean {
    return CARD_HARNESS_RE.test(readFileSync(join(testRoot, specPath), 'utf8'));
}

function checkPartition(
    all: Set<string>,
    game: Set<string>,
    nonGame: Set<string>,
    violations: IViolation[]
): void {
    for (const spec of game) {
        if (nonGame.has(spec)) {
            violations.push({
                file: `test/${spec}`,
                check: PARTITION_OVERLAP_CHECK,
                detail: `selected by both ${configFiles.game} and ${configFiles.nonGame}, so it would run twice`,
            });
        }
    }

    for (const spec of all) {
        if (!game.has(spec) && !nonGame.has(spec)) {
            violations.push({
                file: `test/${spec}`,
                check: PARTITION_GAP_CHECK,
                detail: `selected by ${configFiles.all} but by neither ${configFiles.game} nor ${configFiles.nonGame}, so a group-based run would skip it`,
            });
        }
    }

    for (const spec of new Set([...game, ...nonGame])) {
        if (!all.has(spec)) {
            violations.push({
                file: `test/${spec}`,
                check: PARTITION_EXTRA_CHECK,
                detail: `selected by a group config but not by ${configFiles.all}`,
            });
        }
    }
}

function checkHarnessUse(
    game: Set<string>,
    nonGame: Set<string>,
    violations: IViolation[]
): number {
    const exemptFiles = new Map<string, string>();
    for (const exemption of gameGroupExemptions) {
        const matches = globSync(exemption.pattern, { cwd: testRoot, posix: true });
        if (matches.length === 0) {
            violations.push({
                file: 'scripts/validateSpecs.ts',
                check: UNUSED_EXEMPTION_CHECK,
                detail: `exemption '${exemption.pattern}' matches no file; remove it`,
            });
        }
        for (const match of matches) {
            exemptFiles.set(match, exemption.reason);
        }
    }

    for (const spec of nonGame) {
        if (usesCardHarness(spec)) {
            violations.push({
                file: `test/${spec}`,
                check: GAME_HARNESS_IN_NONGAME_CHECK,
                detail: `uses the card integration() harness but sits in the non-game group (${configFiles.nonGame}); ` +
                  'the undo job would never run it. Move it out of the non-game directories',
            });
        }
    }

    let exemptCount = 0;
    for (const spec of game) {
        const usesHarness = usesCardHarness(spec);
        const exemption = exemptFiles.get(spec);

        if (exemption !== undefined) {
            exemptCount++;
            if (usesHarness) {
                violations.push({
                    file: `test/${spec}`,
                    check: UNUSED_EXEMPTION_CHECK,
                    detail: 'is on the exemption list in scripts/validateSpecs.ts but uses integration(); remove the exemption',
                });
            }
        } else if (!usesHarness) {
            violations.push({
                file: `test/${spec}`,
                check: MISSING_GAME_HARNESS_CHECK,
                detail: `is in the game group (${configFiles.game}) but does not use integration(). ` +
                  'Move it under a non-game directory (see spec_files in jasmine-nongame.json), ' +
                  'or add an exemption with a reason in scripts/validateSpecs.ts',
            });
        }
    }

    return exemptCount;
}

function printReport(violations: IViolation[], gameCount: number, nonGameCount: number, exemptCount: number): void {
    if (violations.length === 0) {
        console.log(
            `All spec validations passed (${gameCount} game-group files incl. ${exemptCount} exempt, ${nonGameCount} non-game files checked).`
        );
        return;
    }

    console.log(`\nSpec validation found ${violations.length} violation(s):\n`);

    const grouped = new Map<string, IViolation[]>();
    for (const v of violations) {
        const list = grouped.get(v.file);
        if (list === undefined) {
            grouped.set(v.file, [v]);
        } else {
            list.push(v);
        }
    }

    // Respect NO_COLOR, as validateCards does.
    const useColor = !process.env.NO_COLOR;
    const boldRed = useColor ? '\u001b[1;31m' : '';
    const reset = useColor ? '\u001b[0m' : '';

    grouped.forEach((fileViolations, file) => {
        console.log(`${boldRed}${file}${reset}`);
        for (const v of fileViolations) {
            console.log(`    • [${v.check}] ${v.detail}`);
        }
        console.log('');
    });

    console.log(`Checked ${gameCount} game-group files and ${nonGameCount} non-game files.`);
}

function main(): void {
    const violations: IViolation[] = [];

    const all = resolveSpecs(configFiles.all, violations);
    const game = resolveSpecs(configFiles.game, violations);
    const nonGame = resolveSpecs(configFiles.nonGame, violations);

    checkPartition(all, game, nonGame, violations);
    const exemptCount = checkHarnessUse(game, nonGame, violations);

    printReport(violations, game.size, nonGame.size, exemptCount);
    if (violations.length > 0) {
        process.exit(1);
    }
}

main();
