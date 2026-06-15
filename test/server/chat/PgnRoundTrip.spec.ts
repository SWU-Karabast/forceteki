describe('PGN round-trip (integration)', function() {
    integration(function (contextRef) {
        beforeEach(function () {
            return contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['wampa', 'atst'],
                    deck: ['cartel-spacer', 'cartel-spacer', 'cartel-spacer', 'cartel-spacer', 'cartel-spacer', 'cartel-spacer'],
                },
                player2: {
                    groundArena: ['battlefield-marine'],
                    deck: ['cartel-spacer', 'cartel-spacer', 'cartel-spacer', 'cartel-spacer', 'cartel-spacer', 'cartel-spacer'],
                },
            });
        });

        // End-to-end guard: play a real game, generate both files, and assert the
        // .swureplay is well-formed and reconstructable. This is the test that would have
        // caught the regressions we hit (all-R0 seqs, per-phase snapshots, undo wiping the
        // whole replay): it validates structure + per-round labeling + card resolution.
        it('produces a well-formed, reconstructable .swureplay', function () {
            const { context } = contextRef;
            const game: any = context.game;

            // Some real actions across multiple rounds.
            context.player1.clickCard(context.wampa);
            context.player1.clickCard(context.p2Base);
            context.player2.clickCard(context.battlefieldMarine);
            context.player2.clickCard(context.p1Base);
            context.moveToNextActionPhase();
            context.player1.clickCard(context.atst);
            context.player1.clickCard(context.p2Base);
            context.moveToNextActionPhase();

            const files = game.generateGameFiles();
            const swuReplay: string = files.swuReplay;

            // ── File shape ───────────────────────────────────────────────────
            expect(swuReplay).toContain('[Game "SWU-PGN v1.0"]');
            expect(swuReplay).toContain('═══ CARD INDEX ═══');
            const replayIdx = swuReplay.indexOf('=== REPLAY ===');
            expect(replayIdx).toBeGreaterThan(-1);

            // ── Card index: collect every SET#NUM it maps ────────────────────
            const cardIndexSection = swuReplay.slice(0, replayIdx);
            const indexedIds = new Set<string>();
            for (const m of cardIndexSection.matchAll(/=\s*([A-Z]+#\d+)\s*$/gm)) {
                indexedIds.add(m[1]);
            }
            expect(indexedIds.size).toBeGreaterThan(0);

            // ── Replay records: every line parses as JSON with seq + type ────
            const replaySectionLines = swuReplay.slice(replayIdx).split('\n');
            const recordLines = replaySectionLines.slice(1).filter((l) => l.trim().length > 0);
            expect(recordLines.length).toBeGreaterThan(0);

            const records = recordLines.map((l) => JSON.parse(l));
            const seqPattern = /^R\d+(\.[A-Z](\.\w+)?|\.(start|end)|\.[A-Z]\.\w+-snapshot)?$/;
            const roundsSeen = new Set<number>();
            let snapshotCount = 0;

            const cardFields = ['card', 'source', 'target', 'attacker', 'defender', 'defeatedBy'];
            for (const rec of records) {
                expect(typeof rec.seq).toBe('string');
                expect(typeof rec.type).toBe('string');

                // Round number is parseable from every seq and is >= 0.
                const roundMatch = String(rec.seq).match(/^R(\d+)/);
                expect(roundMatch).not.toBeNull();
                roundsSeen.add(Number(roundMatch[1]));

                if (typeof rec.seq === 'string' && rec.seq.endsWith('-snapshot')) {
                    snapshotCount++;
                    expect(rec.snapshot).toBeDefined();
                }

                // Every card reference resolves: strip the :N copy suffix; TOKEN:* is fine;
                // otherwise the base SET#NUM must appear in the card index.
                for (const field of cardFields) {
                    const ref = rec[field];
                    if (typeof ref !== 'string' || ref === 'unknown') {
                        continue;
                    }
                    if (ref.startsWith('TOKEN:')) {
                        continue;
                    }
                    const base = ref.replace(/:\d+$/, '');
                    expect(indexedIds.has(base)).toBe(true);
                }
            }

            // Corrections in effect: real per-round numbers (not all R0) and per-action snapshots.
            expect(Math.max(...roundsSeen)).toBeGreaterThanOrEqual(2);
            expect(snapshotCount).toBeGreaterThanOrEqual(2);
        });
    });
});
