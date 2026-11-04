import type { Board, CreateRecord, Entity, SwuRecord } from '@swupgn/format';
import { apply } from '@swupgn/format';
import type { Card } from '../../../server/game/core/card/Card';
import { cardIdOf } from '../../../server/game/core/swupgn/SwuPgnCardIds';
import type { SwuPgnWriter } from '../../../server/game/core/swupgn/SwuPgnWriter';

describe('SwuPgnWriter', function() {
    integration(function(contextRef) {
        function writerOf(): SwuPgnWriter {
            const writer = contextRef.context.game.swuPgnWriter;
            expect(writer).withContext('the game has a writer')
                .not.toBeNull();
            return writer;
        }

        function steps(records: readonly SwuRecord[]): number[] {
            return records.filter((record) => record.t === 'step').map((record) => (record.t === 'step' ? record.seq : -1));
        }

        /** The records after the step with this seq, up to and including the next step. */
        function groupAfter(records: readonly SwuRecord[], seq: number): SwuRecord[] {
            const start = records.findIndex((record) => record.t === 'step' && record.seq === seq);
            expect(start).withContext(`step ${seq}`)
                .toBeGreaterThan(-1);
            const rest = records.slice(start + 1);
            const end = rest.findIndex((record) => record.t === 'step');
            return end === -1 ? rest : rest.slice(0, end + 1);
        }

        /** The ids of the entities on the board showing this card. */
        function idsOf(card: Card, board: Board): number[] {
            return Object.entries(board.entities)
                .filter(([, entity]) => entity.card === cardIdOf(card))
                .map(([id]) => Number(id));
        }

        function idOf(card: Card, board: Board = writerOf().currentBoard()): number {
            const ids = idsOf(card, board);
            expect(ids.length).withContext(`entities for ${card.internalName}`)
                .toBe(1);
            return ids[0];
        }

        function entityOf(card: Card, board: Board = writerOf().currentBoard()): Entity {
            return board.entities[String(idOf(card, board))];
        }

        afterEach(function () {
            const writer = contextRef.context.game.swuPgnWriter;
            expect(writer?.errors).withContext('writer errors')
                .toBe(0);
        });

        describe('in the action phase', function () {
            beforeEach(async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['battlefield-marine', 'pyke-sentinel'],
                        groundArena: ['wampa', 'atst'],
                        spaceArena: ['cartel-spacer'],
                        deck: ['moisture-farmer', 'cell-block-guard']
                    },
                    player2: {
                        hand: ['vanquish'],
                        groundArena: ['frontier-atrt', 'death-trooper'],
                        spaceArena: ['tieln-fighter']
                    }
                });
            });

            it('starts its baseline after setup: one step 0 and no record after it', function () {
                const records = writerOf().records;

                expect(steps(records)).toEqual([0]);
                expect(records[records.length - 1]).toEqual({ t: 'step', seq: 0 });
            });

            it('writes one step per decision, with a played unit revealed before it moves into play', function () {
                const { context } = contextRef;
                const writer = writerOf();

                context.player1.clickCard(context.battlefieldMarine);

                const records = writer.records;
                expect(steps(records)).toEqual([0, 1]);
                expect(records[records.length - 1]).toEqual({ t: 'step', seq: 1 });

                const marine = idOf(context.battlefieldMarine);
                const group = groupAfter(records, 0);
                const moved = group.findIndex((record) => record.t === 'set' && record.e === marine && record.zone === 'ground');
                const revealed = group.findIndex((record) => record.t === 'reveal' && record.e === marine);
                expect(moved).toBeGreaterThan(-1);
                expect(revealed).toBeGreaterThan(-1);
                expect(revealed).toBeLessThan(moved);
            });

            it('writes records that apply to the board it holds', function () {
                const { context } = contextRef;
                const writer = writerOf();

                context.player1.clickCard(context.battlefieldMarine);
                context.player2.clickCard(context.vanquish);
                context.player2.clickCard(context.wampa);
                context.player1.clickCard(context.atst);
                context.player1.clickCard(context.frontierAtrt);

                // a step after each decision: play, play the event, choose its target, attack, choose the defender
                expect(steps(writer.records)).toEqual([0, 1, 2, 3, 4, 5]);
                expect(context.wampa).toBeInZone('discard');
                expect(context.player2).toBeActivePlayer();
                expect(apply([...writer.records])).toEqual(writer.currentBoard());
            });

            it('writes no step for a click that opens no prompt and changes nothing', function () {
                const { context } = contextRef;
                const writer = writerOf();
                const before = [...writer.records];

                context.player1.clickCardNonChecking(context.frontierAtrt);

                expect(writer.records).toEqual(before);
            });

            it('makes a card that enters a deck and comes back a new entity (W-22)', function () {
                const { context } = contextRef;
                const writer = writerOf();
                const inHand = idOf(context.pykeSentinel);

                context.player1.moveCard(context.pykeSentinel, 'deck');
                expect(idsOf(context.pykeSentinel, writer.currentBoard())).toEqual([]);
                expect(writer.records).toContain({ t: 'remove', e: inHand });

                context.player1.moveCard(context.pykeSentinel, 'hand');
                const drawn = idOf(context.pykeSentinel);
                expect(drawn).not.toBe(inHand);
                expect(entityOf(context.pykeSentinel).to).toEqual([1]);
            });

            it('keeps a card known to all once it was in a public zone, even when it leaves it before the next flush', function () {
                const { context } = contextRef;
                const writer = writerOf();

                // both moves inside one flush interval, with no decision point between them
                context.pykeSentinel.moveTo('discard');
                context.pykeSentinel.moveTo('hand');
                context.game.continue();

                expect(context.pykeSentinel).toBeInZone('hand');
                expect(entityOf(context.pykeSentinel).to).toBe('all');
                expect(apply([...writer.records])).toEqual(writer.currentBoard());
            });
        });

        it('writes a card drawn and discarded between two decisions: a create in hand, then a set to discard (W-37)', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                autoSingleTarget: true,
                player1: {
                    hand: ['mos-espa-watermonger'],
                    deck: ['atst']
                }
            });
            const { context } = contextRef;
            const writer = writerOf();

            context.player1.clickCard(context.mosEspaWatermonger);
            const seqsBeforeDraw = steps(writer.records);
            const seqBeforeDraw = seqsBeforeDraw[seqsBeforeDraw.length - 1];
            context.player1.clickPrompt('Trigger');
            expect(context.atst).toBeInZone('discard');

            const atst = idOf(context.atst);
            const group = groupAfter(writer.records, seqBeforeDraw);
            const created = group.findIndex((record) => record.t === 'create' && record.e === atst);
            const discarded = group.findIndex((record) => record.t === 'set' && record.e === atst && record.zone === 'discard');
            expect(created).toBeGreaterThan(-1);
            expect(group[created]).toEqual(jasmine.objectContaining({ zone: 'hand', owner: 1, to: [1] }));
            expect(discarded).toBeGreaterThan(created);
        });

        it('writes a token created and defeated in one action: a create, then a remove (W-37)', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hasForceToken: true,
                    hand: ['darth-tyranus#servant-of-sidious']
                },
                player2: {
                    groundArena: ['wampa']
                }
            });
            const { context } = contextRef;
            const writer = writerOf();
            const start = writer.records.length;

            // Shielded gives him a Shield token, then Ambush attacks Wampa, and Wampa's 4 damage defeats the token
            context.player1.clickCard(context.darthTyranus);
            context.player1.clickPrompt('Shielded');
            context.player1.clickPrompt('Trigger');
            context.player1.clickCard(context.wampa);

            expect(context.darthTyranus).toHaveExactUpgradeNames([]);
            expect(context.darthTyranus.damage).toBe(0);
            expect(context.player2).toBeActivePlayer();

            const action = writer.records.slice(start);
            const created = action.find((record): record is CreateRecord => record.t === 'create' && record.card?.startsWith('TOKEN:shield'));
            expect(created).withContext('the shield token create')
                .toBeDefined();
            const removed = action.findIndex((record) => record.t === 'remove' && record.e === created?.e);
            expect(removed).toBeGreaterThan(action.indexOf(created));
        });

        it('writes a unit that enters play and gets a token in one window: the unit\'s move before the token\'s create (W-28)', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['zealous-soldier']
                }
            });
            const { context } = contextRef;
            const writer = writerOf();
            const start = writer.records.length;

            context.player1.clickCard(context.zealousSoldier);
            expect(context.zealousSoldier).toHaveExactUpgradeNames(['advantage']);

            const soldier = idOf(context.zealousSoldier);
            const action = writer.records.slice(start);
            const moved = action.findIndex((record) => record.t === 'set' && record.e === soldier && record.zone === 'ground');
            const created = action.findIndex((record) => record.t === 'create' && record.parent === soldier);
            expect(moved).toBeGreaterThan(-1);
            expect(created).toBeGreaterThan(moved);
            expect(apply([...writer.records])).toEqual(writer.currentBoard());
        });

        it('writes a unit that changes arena with an upgrade: the upgrade is detached, the unit moves, the upgrade is attached again (W-28)', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['low-altitude-combat'],
                    spaceArena: [{ card: 'awing', exhausted: true, upgrades: ['mastery'] }],
                    groundArena: ['8d8#daimyos-majordomo']
                }
            });
            const { context } = contextRef;
            const writer = writerOf();
            const awing = idOf(context.awing);
            const mastery = idOf(context.mastery);
            const start = writer.records.length;

            context.player1.clickCard(context.lowAltitudeCombat);
            context.player1.clickCard(context.awing);
            expect(context.awing).toBeInZone('groundArena');

            const action = writer.records.slice(start);
            const detached = action.findIndex((record) => record.t === 'set' && record.e === mastery && record.parent === null);
            const moved = action.findIndex((record) => record.t === 'set' && record.e === awing && record.zone === 'ground');
            const attached = action.findIndex((record) => record.t === 'set' && record.e === mastery && record.parent === awing && record.zone === 'ground');
            expect(detached).toBeGreaterThan(-1);
            expect(moved).toBeGreaterThan(detached);
            expect(attached).toBeGreaterThan(moved);
            expect(entityOf(context.mastery)).toEqual(jasmine.objectContaining({ zone: 'ground', parent: awing, rel: 'attached' }));

            context.player1.clickPrompt('Pass');
            expect(apply([...writer.records])).toEqual(writer.currentBoard());
        });

        it('makes a mulligan a new hand of new entities and writes no step before setup is done (W-22, W-39)', async function () {
            await contextRef.setupTestAsync({
                phase: 'setup',
                player1: {
                    deck: ['armed-to-the-teeth', 'collections-starhopper', 'covert-strength', 'chewbacca#pykesbane', 'battlefield-marine', 'battlefield-marine',
                        'battlefield-marine', 'moment-of-peace', 'moment-of-peace', 'moment-of-peace', 'moment-of-peace']
                },
                player2: {
                    deck: ['moisture-farmer', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst', 'wampa', 'atst', 'atst']
                }
            });
            const { context } = contextRef;
            const writer = writerOf();

            context.selectInitiativePlayer(context.player1);
            const handIds = (board: Board) => Object.entries(board.entities)
                .filter(([, entity]) => entity.zone === 'hand' && entity.owner === 1)
                .map(([id]) => Number(id));
            const firstHand = handIds(writer.currentBoard());
            expect(firstHand.length).toBe(6);

            context.player1.clickPrompt('Mulligan');
            context.player2.clickPrompt('Keep');

            const secondHand = handIds(writer.currentBoard());
            expect(secondHand.length).toBe(6);
            expect(secondHand.filter((id) => firstHand.includes(id))).toEqual([]);
            for (const id of firstHand) {
                expect(writer.records).toContain({ t: 'remove', e: id });
            }
            expect(steps(writer.records)).toEqual([]);

            context.player1.clickAnyOfSelectableCards(2);
            context.player1.clickDone();
            expect(steps(writer.records)).toEqual([]);
            context.player2.clickAnyOfSelectableCards(2);
            context.player2.clickDone();

            expect(context.game.currentPhase).toBe('action');
            expect(steps(writer.records)).toEqual([0]);
            expect(writer.records[writer.records.length - 1]).toEqual({ t: 'step', seq: 0 });
            expect(apply([...writer.records])).toEqual(writer.currentBoard());
        });
    });
});
