import type { Board } from '@swupgn/format';
import { RepeatableAbilityLimit } from '../../../server/game/core/ability/AbilityLimit';
import type { Card } from '../../../server/game/core/card/Card';
import { cardIdOf } from '../../../server/game/core/swupgn/SwuPgnCardIds';
import type { SwuPgnWriter } from '../../../server/game/core/swupgn/SwuPgnWriter';

/**
 * Dirty-entity projection: `BoardProjector.project()` re-reads only the cards that changed since the last projection and
 * reuses the cached entities of the rest. `projectFull()` re-reads everything and is the oracle: after every action here
 * the two must give the same board. The writer also checks every one of its own flushes against the oracle
 * (`checkProjections`, what `SWUPGN_PROJECTION_CHECK=1` turns on), counting a mismatch as a writer error.
 */
describe('SWU-PGN dirty-entity projection', function() {
    function writerOf(contextRef: SwuTestContextRef): SwuPgnWriter {
        const writer = contextRef.context.game.swuPgnWriter;
        expect(writer).withContext('the game has a writer')
            .not.toBeNull();
        writer.checkProjections = true;
        return writer;
    }

    /**
     * The board the writer last wrote (from its own dirty, checked flush) agrees with the full projection, and those
     * checked flushes found no mismatch. It reads the written board and `projectFull()`, which leave the projection
     * cache alone, so `reread()` afterwards still describes the writer's last flush.
     */
    function expectSameProjection(contextRef: SwuTestContextRef, what: string): Board {
        const writer = writerOf(contextRef);
        const written: Board = { seq: null, entities: writer.currentBoard().entities };
        const full = writer.boardProjector.projectFull();
        expect(written).withContext(`${what}: the written board vs projectFull()`)
            .toEqual(full);
        expect(writer.errors).withContext(`${what}: writer errors`)
            .toBe(0);
        return written;
    }

    /** The card entities that differ between two boards, by internal name; `g`, the seats and effects left out. */
    function changedCards(contextRef: SwuTestContextRef, before: Board, after: Board, cards: readonly Card[]): string[] {
        const changed: string[] = [];
        for (const card of cards) {
            const id = String(writerIdOf(contextRef, card));
            if (JSON.stringify(before.entities[id]) !== JSON.stringify(after.entities[id])) {
                changed.push(card.internalName);
            }
        }
        return changed;
    }

    function writerIdOf(contextRef: SwuTestContextRef, card: Card): number {
        const board = writerOf(contextRef).boardProjector.projectFull();
        const ids = Object.entries(board.entities).filter(([, entity]) => entity.card === cardIdOf(card))
            .map(([id]) => Number(id));
        expect(ids.length).withContext(`entities for ${card.internalName}`)
            .toBe(1);
        return ids[0];
    }

    /** The cards the last `project()` re-read rather than reused. */
    function reread(contextRef: SwuTestContextRef): ReadonlySet<Card> {
        return writerOf(contextRef).boardProjector.lastReread;
    }

    integration(function(contextRef) {
        afterEach(function () {
            expect(contextRef.context.game.swuPgnWriter?.errors).withContext('writer errors')
                .toBe(0);
        });

        describe('on a board with no ongoing effects', function () {
            beforeEach(async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['daring-raid', 'academy-training', 'moment-of-peace'],
                        groundArena: ['wampa', 'pyke-sentinel']
                    },
                    player2: {
                        groundArena: ['atst'],
                        spaceArena: ['cartel-spacer']
                    }
                });
                writerOf(contextRef);
            });

            it('reuses every entity when nothing changed', function () {
                // a projection with nothing marked since the writer's last flush reads no card
                writerOf(contextRef).boardProjector.project();
                expect(reread(contextRef).size).toBe(0);
                expectSameProjection(contextRef, 'unchanged');
            });

            it('agrees after damage from an ability, re-reading the damaged unit but not an untouched one', function () {
                const { context } = contextRef;
                context.player1.clickCard(context.daringRaid);
                context.player1.clickCard(context.atst);
                expect(context.atst.damage).toBe(2);

                // the decision point's flush re-read what the action touched
                expect(reread(contextRef).has(context.atst)).toBeTrue();
                expect(reread(contextRef).has(context.cartelSpacer)).toBeFalse();
                expectSameProjection(contextRef, 'after the damage');
            });

            it('agrees after an attack exhausts the attacker', function () {
                const { context } = contextRef;
                context.player1.clickCard(context.wampa);
                context.player1.clickCard(context.p2Base);
                expect(context.wampa.exhausted).toBeTrue();

                expect(reread(contextRef).has(context.wampa)).toBeTrue();
                expectSameProjection(contextRef, 'after the attack');
            });

            it('agrees after an upgrade is attached, for the parent and the child', function () {
                const { context } = contextRef;
                context.player1.clickCard(context.academyTraining);
                context.player1.clickCard(context.wampa);
                expect(context.wampa).toHaveExactUpgradeNames(['academy-training']);

                expect(reread(contextRef).has(context.wampa)).toBeTrue();
                expect(reread(contextRef).has(context.academyTraining)).toBeTrue();
                expectSameProjection(contextRef, 'after the upgrade');
            });

            it('agrees after a token is created on a unit', function () {
                const { context } = contextRef;
                context.player1.clickCard(context.momentOfPeace);
                context.player1.clickCard(context.pykeSentinel);
                expect(context.pykeSentinel).toHaveExactUpgradeNames(['shield']);

                // the token's flush point (OnTokensCreated) already re-read the unit, checked against the oracle
                expectSameProjection(contextRef, 'after the shield');
            });

            it('agrees after the regroup phase readies everything', function () {
                const { context } = contextRef;
                context.player1.clickCard(context.wampa);
                context.player1.clickCard(context.p2Base);
                context.player2.clickCard(context.cartelSpacer);
                context.player2.clickCard(context.p1Base);
                expectSameProjection(contextRef, 'after the attacks');

                context.moveToNextActionPhase();
                expect(context.wampa.exhausted).toBeFalse();
                expect(context.cartelSpacer.exhausted).toBeFalse();
                expectSameProjection(contextRef, 'after the regroup phase');
            });
        });

        describe('with ongoing effects', function () {
            it('agrees after a lasting +2/+0 effect on one unit, which changes only that unit', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['bold-resistance'],
                        groundArena: ['wampa', 'battlefield-marine']
                    },
                    player2: {
                        groundArena: ['atst']
                    }
                });
                const { context } = contextRef;
                writerOf(contextRef);
                const before = expectSameProjection(contextRef, 'before the effect');

                context.player1.clickCard(context.boldResistance);
                context.player1.clickCard(context.wampa);
                context.player1.clickDone();
                expect(context.wampa.getPower()).toBe(6);

                const board = expectSameProjection(contextRef, 'after the effect');
                expect(Object.values(board.entities).filter((entity) => entity.a.kind === 'effect').length).toBe(1);
                // of the units in play (the event moved to discard and the resources paid for it change too), only Wampa's entity changed
                expect(changedCards(contextRef, before, board, [context.wampa, context.battlefieldMarine, context.atst, context.p1Base, context.p2Base]))
                    .toEqual(['wampa']);

                context.moveToNextActionPhase();
                expect(context.wampa.getPower()).toBe(4);
                expectSameProjection(contextRef, 'after the effect ended');
            });

            it('agrees after a constant aura\'s source enters play, for every friendly unit', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['general-dodonna#massassi-group-commander'],
                        groundArena: ['battlefield-marine'],
                        spaceArena: ['alliance-xwing']
                    },
                    player2: {
                        groundArena: ['wampa']
                    }
                });
                const { context } = contextRef;
                writerOf(contextRef);
                const before = context.battlefieldMarine.getPower();

                context.player1.clickCard(context.generalDodonna);
                expect(context.battlefieldMarine.getPower()).toBe(before + 1);

                for (const card of [context.battlefieldMarine, context.allianceXwing]) {
                    expect(reread(contextRef).has(card)).withContext(card.internalName)
                        .toBeTrue();
                }
                expectSameProjection(contextRef, 'after the aura');
            });

            it('writes a limited ability\'s use when its target prompt is answered and it changes nothing', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        spaceArena: ['awing'],
                        leader: { card: 'shin-hati#eager-adversary', deployed: true }
                    },
                    player2: {
                        groundArena: ['porg']
                    }
                });
                const { context } = contextRef;
                const writer = writerOf(contextRef);

                // the once-per-round trigger prompts for its target (a decision point), and exhausting the already
                // exhausted attacker raises no event naming Shin Hati: only the limit's increment changes her entity
                context.player1.clickCard(context.awing);
                context.player1.clickCard(context.p2Base);
                expect(context.player1).toBeAbleToSelectExactly([context.porg, context.awing]);
                context.player1.clickCard(context.awing);
                expect(context.player2).toBeActivePlayer();

                const id = String(writerIdOf(contextRef, context.shinHati));
                const written = writer.currentBoard().entities[id];
                const full = writer.boardProjector.projectFull().entities[id];
                expect(full.a.abilityUses).withContext('the use is counted')
                    .toBeDefined();
                expect(written).withContext('the written board holds the use')
                    .toEqual(full);
            });

            it('re-reads a card whose ability limit is used with no event naming it', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: { card: 'chewbacca#relentless-rebel', deployed: true },
                        groundArena: ['wampa']
                    }
                });
                const { context } = contextRef;
                const writer = writerOf(contextRef);
                const limit = context.chewbacca.getAllAbilitiesForRecording()
                    .map((ability) => ability.captureLimit())
                    .find((found) => found instanceof RepeatableAbilityLimit);
                expect(limit).withContext('Chewbacca\'s once-per-round limit')
                    .toBeDefined();

                // the AbilityResolver can increment a limit after a decision point (a late target prompt, or a cancel
                // after costs) with no later event naming the source: the limit itself must mark the card
                limit.increment(context.player1.player);
                writer.flush();

                const id = String(writerIdOf(contextRef, context.chewbacca));
                const written = writer.currentBoard().entities[id];
                expect(writer.errors).withContext('the dirty flush agreed with the full projection')
                    .toBe(0);
                expect(written.a.abilityUses).withContext('the written board holds the use')
                    .toBeDefined();
            });

            it('agrees after a capture', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['discerning-veteran'],
                        groundArena: ['battlefield-marine']
                    },
                    player2: {
                        groundArena: ['wampa'],
                        spaceArena: ['cartel-spacer']
                    },
                    autoSingleTarget: true
                });
                const { context } = contextRef;
                writerOf(contextRef);

                context.player1.clickCard(context.discerningVeteran);
                expect(context.wampa).toBeCapturedBy(context.discerningVeteran);

                expect(reread(contextRef).has(context.wampa)).toBeTrue();
                expectSameProjection(contextRef, 'after the capture');
            });
        });
    });

    undoIntegration(function(contextRef) {
        it('agrees after a rollback followed by the same action', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['daring-raid'],
                    groundArena: ['wampa']
                },
                player2: {
                    groundArena: ['atst']
                }
            });
            const { context } = contextRef;
            writerOf(contextRef);
            const raid = () => {
                context.player1.clickCard(context.daringRaid);
                context.player1.clickCard(context.atst);
                expect(context.atst.damage).toBe(2);
            };

            raid();
            const firstRun = expectSameProjection(contextRef, 'first run');

            expect(contextRef.snapshot.rollbackToSnapshot({ type: 'action', playerId: context.player1.id })).toBeTrue();
            expect(context.atst.damage).toBe(0);
            expectSameProjection(contextRef, 'after the rollback');

            raid();
            expect(expectSameProjection(contextRef, 'second run')).toEqual(firstRun);
            expect(contextRef.context.game.swuPgnWriter.errors).toBe(0);
        });
    });
});
