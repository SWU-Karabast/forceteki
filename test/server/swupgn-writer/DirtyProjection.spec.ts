import type { Board, Entity } from '@swupgn/format';
import { diff } from '@swupgn/format/writer';
import { RepeatableAbilityLimit } from '../../../server/game/core/ability/AbilityLimit';
import type { Card } from '../../../server/game/core/card/Card';
import { diffBoards } from '../../../server/game/core/swupgn/diffBoards';
import { cardIdOf } from '../../../server/game/core/swupgn/SwuPgnCardIds';
import type { SwuPgnWriter } from '../../../server/game/core/swupgn/SwuPgnWriter';

/**
 * Dirty-entity projection: `BoardProjector.project()` re-reads only the cards that changed since the last projection and
 * reuses the cached entities of the rest. `projectFull()` re-reads everything and is the oracle: after every action here
 * the two must give the same board. The writer also checks every one of its own flushes against the oracle
 * (`checkProjections`, what `SWUPGN_PROJECTION_CHECK=1` turns on), counting a mismatch as a writer error.
 *
 * The writer then diffs only the entities the projection changed (`diffBoards(prev, next, changed)`): every reused
 * entity is the same object in both boards. Under the check each such diff is compared with the full diff of the two
 * boards (the package `diff`, with the W-28 middle-board fallback), a mismatch again counting as a writer error.
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

    /**
     * Runs `act` and returns every card the projections made meanwhile re-read or visited, and how many of them read
     * every card (`lastChanged` null): a phase or round change must re-read what it changed, not every card.
     */
    function projectionsDuring(contextRef: SwuTestContextRef, act: () => void): { reread: Set<Card>; visited: Set<Card>; fullReads: number } {
        const projector = writerOf(contextRef).boardProjector;
        const result = { reread: new Set<Card>(), visited: new Set<Card>(), fullReads: 0 };
        const project = projector.project;
        // wrapped by hand, not with spyOn, and unwrapped afterwards: an undo run calls this twice in one spec
        projector.project = (ending) => {
            const board = project.call(projector, ending);
            projector.lastReread.forEach((card) => result.reread.add(card));
            projector.lastVisited.forEach((card) => result.visited.add(card));
            if (projector.lastChanged === null) {
                result.fullReads++;
            }
            return board;
        };
        try {
            act();
        } finally {
            Reflect.deleteProperty(projector, 'project');
        }
        return result;
    }

    /** The entity id of the card's entity on the written board. */
    function writtenIdOf(contextRef: SwuTestContextRef, card: Card): string {
        const entities = writerOf(contextRef).currentBoard().entities;
        const ids = Object.keys(entities).filter((id) => entities[id].card === cardIdOf(card));
        expect(ids.length).withContext(`written entities for ${card.internalName}`)
            .toBe(1);
        return ids[0];
    }

    integration(function(contextRef) {
        afterEach(function () {
            const writer = contextRef.context.game.swuPgnWriter;
            expect(writer?.errors).withContext('writer errors')
                .toBe(0);
            // the flushes after the first one diffed only what changed, each checked against the full diff
            expect(writer?.dirtyDiffsChecked).withContext('dirty diffs checked against the full diff')
                .toBeGreaterThan(0);
        });

        describe('on a board with no ongoing effects', function () {
            beforeEach(async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['daring-raid', 'academy-training', 'moment-of-peace'],
                        groundArena: ['wampa', 'pyke-sentinel'],
                        discard: ['battlefield-marine']
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
                // and changes no entity: the game and seat entities, projected every time, are the objects already written
                expect([...writerOf(contextRef).boardProjector.lastChanged]).toEqual([]);
                expectSameProjection(contextRef, 'unchanged');

                // the writer flushes once more so the afterEach sees a dirty diff
                writerOf(contextRef).flush();
            });

            it('agrees after the regroup phase readies every exhausted unit, re-reading each and no untouched card', function () {
                const { context } = contextRef;
                context.player1.clickCard(context.wampa);
                context.player1.clickCard(context.p2Base);
                context.player2.clickCard(context.cartelSpacer);
                context.player2.clickCard(context.p1Base);
                context.player1.clickCard(context.pykeSentinel);
                context.player1.clickCard(context.p2Base);
                expectSameProjection(contextRef, 'after the attacks');

                const during = projectionsDuring(contextRef, () => context.moveToNextActionPhase());
                for (const unit of [context.wampa, context.cartelSpacer, context.pykeSentinel]) {
                    expect(unit.exhausted).withContext(`${unit.internalName} readied`)
                        .toBeFalse();
                    expect(during.reread.has(unit)).withContext(`${unit.internalName} re-read`)
                        .toBeTrue();
                }
                // the phase and round changes are marked where they change the board, not by reading every card
                expect(during.fullReads).withContext('projections that read every card')
                    .toBe(0);
                expect(during.reread.has(context.battlefieldMarine)).withContext('the untouched discard card')
                    .toBeFalse();
                expect(during.reread.has(context.atst)).withContext('the unit that stayed ready')
                    .toBeFalse();
                expectSameProjection(contextRef, 'after the regroup phase');
            });

            it('agrees after damage from an ability, re-reading the damaged unit but not an untouched one', function () {
                const { context } = contextRef;
                context.player1.clickCard(context.daringRaid);
                context.player1.clickCard(context.atst);
                expect(context.atst.damage).toBe(2);

                // the decision point's flush re-read what the action touched
                expect(reread(contextRef).has(context.atst)).toBeTrue();
                expect(reread(contextRef).has(context.cartelSpacer)).toBeFalse();
                const changed = writerOf(contextRef).boardProjector.lastChanged;
                expect(changed.has(writtenIdOf(contextRef, context.cartelSpacer))).withContext('the untouched unit is not diffed')
                    .toBeFalse();
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

                // the effect lasts for this phase: it ends as the action phase does, and its target is re-read then
                const during = projectionsDuring(contextRef, () => context.moveToRegroupPhase());
                expect(context.wampa.getPower()).toBe(4);
                expect(during.reread.has(context.wampa)).withContext('the effect\'s target re-read')
                    .toBeTrue();
                expect(during.fullReads).withContext('projections that read every card')
                    .toBe(0);
                expect(during.reread.has(context.boldResistance)).withContext('the event in the discard pile')
                    .toBeFalse();
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

        describe('in the resource row', function () {
            it('re-reads only the resources a cost exhausts', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['wampa'],
                        resources: ['atst', 'cartel-spacer', 'pyke-sentinel', 'alliance-xwing', 'daring-raid']
                    }
                });
                const { context } = contextRef;
                writerOf(contextRef);
                const resources = context.player1.resources.slice();

                const paid = projectionsDuring(contextRef, () => context.player1.clickCard(context.wampa));
                const exhausted = resources.filter((card) => card.exhausted);
                expect(exhausted.length).withContext('resources paid')
                    .toBe(4);
                expect(resources.filter((card) => paid.reread.has(card))).withContext('resources re-read')
                    .toEqual(exhausted);
                expectSameProjection(contextRef, 'after the cost');
            });
        });

        describe('when entities move, leave and come back', function () {
            it('visits, of the deck cards, exactly the ones that left the deck', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['patrolling-vwing'],
                        deck: ['wampa', 'battlefield-marine', 'atst', 'pyke-sentinel']
                    }
                });
                const { context } = contextRef;
                writerOf(contextRef);
                const deckBefore = context.player1.deck.slice();

                const during = projectionsDuring(contextRef, () => context.player1.clickCard(context.patrollingVwing));
                const drawn = deckBefore.filter((card) => card.zoneName === 'hand');
                expect(drawn.length).withContext('the V-wing drew a card')
                    .toBe(1);
                expect(deckBefore.filter((card) => during.visited.has(card))).withContext('deck cards visited')
                    .toEqual(drawn);
                expectSameProjection(contextRef, 'after the draw');
            });

            it('agrees after a unit changes arena with an upgrade attached (a moved parent, W-28)', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['low-altitude-combat'],
                        spaceArena: [{ card: 'awing', exhausted: true, upgrades: ['mastery'] }],
                        groundArena: ['8d8#daimyos-majordomo']
                    }
                });
                const { context } = contextRef;
                writerOf(contextRef);

                context.player1.clickCard(context.lowAltitudeCombat);
                context.player1.clickCard(context.awing);
                expect(context.awing).toBeInZone('groundArena');

                const board = expectSameProjection(contextRef, 'after the move');
                expect(board.entities[writtenIdOf(contextRef, context.mastery)])
                    .toEqual(jasmine.objectContaining({ zone: 'ground', parent: Number(writtenIdOf(contextRef, context.awing)), rel: 'attached' }));
                context.player1.clickPrompt('Pass');
                expectSameProjection(contextRef, 'after the pass');
            });

            it('agrees after a card is put back into the deck (it leaves the tracked set) and drawn again (a new entity)', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['restock'],
                        discard: ['wampa'],
                        deck: ['battlefield-marine']
                    }
                });
                const { context } = contextRef;
                writerOf(contextRef);
                const before = writtenIdOf(contextRef, context.wampa);

                context.player1.clickCard(context.restock);
                context.player1.clickCard(context.wampa);
                context.player1.clickDone();
                expect(context.wampa).toBeInZone('deck');

                const inDeck = expectSameProjection(contextRef, 'after the restock');
                expect(inDeck.entities[before]).withContext('the deck card has no entity')
                    .toBeUndefined();
                expect(Object.values(inDeck.entities).some((entity) => entity.card === cardIdOf(context.wampa)))
                    .toBeFalse();

                context.moveToNextActionPhase();
                expect(context.wampa).toBeInZone('hand');
                expect(writtenIdOf(contextRef, context.wampa)).withContext('drawn again, the card is a new entity')
                    .not.toBe(before);
                expectSameProjection(contextRef, 'after the draw');

                // a flush inside the next action phase diffs what changed
                context.player1.clickCard(context.wampa);
                expectSameProjection(contextRef, 'after the wampa is played');
            });
        });
    });

    describe('diffBoards over the changed entities', function () {
        const entity = (zone: string, extra: Partial<Entity> = {}): Entity => ({ zone, owner: 1, card: 'SOR_001', to: 'all', a: { kind: 'unit' }, ...extra });

        it('writes what the package diff writes when a parent changes zone and its child is the same object (W-28)', function () {
            const child: Entity = { ...entity('space', { parent: 1, rel: 'attached' }), a: { kind: 'upgrade' } };
            const childAfter: Entity = { ...child, zone: 'ground' };
            const bystander = entity('ground');
            const prev: Board = { seq: null, entities: { g: { a: { round: 1 } }, 1: entity('space'), 2: child, 3: bystander } };
            const next: Board = { seq: null, entities: { g: { a: { round: 1 } }, 1: entity('ground'), 2: childAfter, 3: bystander } };

            expect(diffBoards(prev, next, new Set(['g', '1', '2']))).toEqual(diffBoards(prev, next));
        });

        it('includes a kept child whose moved parent alone is reported changed, so the W-28 fallback still applies', function () {
            // the child keeps its zone (a captive held across zones is not this case): only the parent is reported
            const child: Entity = { ...entity('space', { parent: 1, rel: 'attached' }), a: { kind: 'upgrade' } };
            const prev: Board = { seq: null, entities: { 1: entity('space'), 2: child } };
            const next: Board = { seq: null, entities: { 1: entity('ground'), 2: child } };

            expect(() => diff(prev, next)).toThrow();
            expect(diffBoards(prev, next, new Set(['1']))).toEqual(diffBoards(prev, next));
        });

        it('skips an entity that is the same object in both boards, and diffs a created and a removed one', function () {
            const same = entity('ground');
            const prev: Board = { seq: null, entities: { 1: same, 2: entity('hand') } };
            const next: Board = { seq: null, entities: { 1: same, 3: entity('discard') } };

            expect(diffBoards(prev, next, new Set(['2', '3']))).toEqual(diff(prev, next));
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

            // the flushes after the rollback diff only what changed: counted from here, not from setup
            const checkedBefore = writerOf(contextRef).dirtyDiffsChecked;
            const during = projectionsDuring(contextRef, raid);
            expect(expectSameProjection(contextRef, 'second run')).toEqual(firstRun);
            expect(writerOf(contextRef).dirtyDiffsChecked).withContext('dirty diffs checked after the rollback')
                .toBeGreaterThan(checkedBefore);
            expect(during.fullReads).withContext('projections that read every card after the rollback\'s own')
                .toBe(0);
            expect(during.reread.has(context.atst)).withContext('the damaged unit re-read')
                .toBeTrue();
            expect(during.reread.has(context.wampa)).withContext('the untouched unit')
                .toBeFalse();
        });
    });
});
