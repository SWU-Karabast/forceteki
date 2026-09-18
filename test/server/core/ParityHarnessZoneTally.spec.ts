import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import type { Card } from '../../../server/game/core/card/Card';
import { deleteZoneViolationClassCountForTest, getZoneViolationClassCounts, pruneStaleReporterRunDirectories, recordZoneViolation } from '../../helpers/ParityHarness';

/**
 * `P3-PA4` follow-ups: the zoneClass tally (`P3PA3-F-03`'s exhaustiveness fix) and reporter run-directory
 * hygiene (plan.md §5). Both are exercised directly rather than through a real rollback/CLI invocation -
 * forcing an actual `DeckZone` bookkeeping bug deterministically is impractical (a rare, statistically-
 * observed condition per P3-PA3), and the real serial parity+undo run (§8) is the exhaustive-breakdown
 * evidence for the real-world case.
 */
describe('getZoneViolationClassCounts (P3-PA4)', function() {
    // `PA4-IR-2` fix-pass: `zoneViolationClassCounts` is a single process-wide tally, shared with any real
    // parity-harness activity running in the same process (e.g. the serial parity+undo evidence run this
    // task depends on). Track every synthetic `zoneClass` this describe block registers and delete it once
    // its owning test is done, so this spec's own calls never survive into a same-process exhaustive
    // breakdown as spurious keys.
    const syntheticZoneClassesToClean: string[] = [];

    afterEach(function() {
        for (const zoneClass of syntheticZoneClassesToClean) {
            deleteZoneViolationClassCountForTest(zoneClass);
        }
        syntheticZoneClassesToClean.length = 0;
    });

    it('tallies every recorded violation for a zoneClass, exceeding the 10-item identity buffer cap', function() {
        const zoneClass = `SyntheticZoneClassForTally_${Date.now()}`;
        syntheticZoneClassesToClean.push(zoneClass);
        const before = getZoneViolationClassCounts()[zoneClass] ?? 0;
        const syntheticCard = { uuid: 'stub-card', internalName: 'stub-card' } as unknown as Card;

        for (let i = 0; i < 13; i++) {
            recordZoneViolation('post', 'forward', syntheticCard, `synthetic-zone-uuid-${i}`, zoneClass);
        }

        const counts = getZoneViolationClassCounts();
        expect(counts[zoneClass]).toBe(before + 13);
    });

    it('keys the tally by zoneClass alone (not a phase/direction composite), matching the request\'s literal wording', function() {
        const zoneClass = `SyntheticZoneClassForCompositeCheck_${Date.now()}`;
        syntheticZoneClassesToClean.push(zoneClass);
        const before = getZoneViolationClassCounts()[zoneClass] ?? 0;
        const syntheticCard = { uuid: 'stub-card', internalName: 'stub-card' } as unknown as Card;

        recordZoneViolation('pre', 'forward', syntheticCard, 'uuid-1', zoneClass);
        recordZoneViolation('post', 'reverse', syntheticCard, 'uuid-2', zoneClass);

        expect(getZoneViolationClassCounts()[zoneClass]).toBe(before + 2);
    });
});

describe('pruneStaleReporterRunDirectories (P3-PA4)', function() {
    const parentDir = path.join(os.tmpdir(), 'forceteki-parity-harness-runs');

    it('removes a stale sibling directory older than the threshold, and leaves a fresh sibling intact', function() {
        const uniqueSuffix = `${process.pid}-${Date.now()}`;
        const staleDir = path.join(parentDir, `test-stale-${uniqueSuffix}`);
        const freshDir = path.join(parentDir, `test-fresh-${uniqueSuffix}`);
        fs.mkdirSync(staleDir, { recursive: true });
        fs.mkdirSync(freshDir, { recursive: true });

        const oldTime = new Date(Date.now() - 60 * 60 * 1000); // 1 hour old
        fs.utimesSync(staleDir, oldTime, oldTime);
        // freshDir keeps its just-created mtime.

        try {
            pruneStaleReporterRunDirectories(30 * 60 * 1000); // 30-minute threshold

            expect(fs.existsSync(staleDir)).toBe(false);
            expect(fs.existsSync(freshDir)).toBe(true);
        } finally {
            fs.rmSync(staleDir, { recursive: true, force: true });
            fs.rmSync(freshDir, { recursive: true, force: true });
        }
    });
});
