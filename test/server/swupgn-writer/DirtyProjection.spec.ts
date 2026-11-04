import type { Board } from '@swupgn/format';
import type { Card } from '../../../server/game/core/card/Card';
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

    /** The dirty projection and the full one agree, and the writer's own checked flushes found no mismatch. */
    function expectSameProjection(contextRef: SwuTestContextRef, what: string): Board {
        const writer = writerOf(contextRef);
        const dirty = writer.boardProjector.project();
        const full = writer.boardProjector.projectFull();
        expect(dirty).withContext(`${what}: project() vs projectFull()`)
            .toEqual(full);
        expect(writer.errors).withContext(`${what}: writer errors`)
            .toBe(0);
        return dirty;
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
                expectSameProjection(contextRef, 'first');
                expectSameProjection(contextRef, 'again');
                expect(reread(contextRef).size).toBe(0);
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
            it('agrees after a lasting +2/+0 effect on one unit', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['bold-resistance'],
                        groundArena: ['wampa']
                    },
                    player2: {
                        groundArena: ['atst']
                    }
                });
                const { context } = contextRef;
                writerOf(contextRef);

                context.player1.clickCard(context.boldResistance);
                context.player1.clickCard(context.wampa);
                context.player1.clickDone();
                expect(context.wampa.getPower()).toBe(6);

                const board = expectSameProjection(contextRef, 'after the effect');
                expect(Object.values(board.entities).filter((entity) => entity.a.kind === 'effect').length).toBe(1);

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
