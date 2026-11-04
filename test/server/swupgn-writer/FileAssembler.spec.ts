import type { SwuPgnFile, SwuRecord } from '@swupgn/format';
import { apply, parse } from '@swupgn/format';
import { validate } from '@swupgn/format/validate';
import { cardIdOf } from '../../../server/game/core/swupgn/SwuPgnCardIds';
import type { SwuPgnFileView, SwuPgnWriter } from '../../../server/game/core/swupgn/SwuPgnWriter';

/** `g.result` at the end of the file's records. */
function resultOf(file: SwuPgnFile): string | undefined {
    const result = apply(file.records).entities.g.a.result;
    return typeof result === 'string' ? result : undefined;
}

describe('SWU-PGN file assembly', function() {
    integration(function(contextRef) {
        const views: SwuPgnFileView[] = ['full', 1, 2, 'public'];

        function writerOf(): SwuPgnWriter {
            const writer = contextRef.context.game.swuPgnWriter;
            expect(writer).withContext('the game has a writer')
                .not.toBeNull();
            return writer;
        }

        function expectEveryViewValid(writer: SwuPgnWriter): void {
            for (const view of views) {
                const report = validate(writer.fileFor(view));
                expect(report.level).withContext(`validate(fileFor(${view})): ${JSON.stringify(report.issues)}`)
                    .toBe('valid');
            }
        }

        function lastRecord(file: SwuPgnFile): SwuRecord {
            return file.records[file.records.length - 1];
        }

        afterEach(function () {
            expect(contextRef.context.game.swuPgnWriter?.errors).withContext('writer errors')
                .toBe(0);
        });

        describe('a short game that P2 concedes', function () {
            beforeEach(async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['battlefield-marine'],
                        groundArena: ['atst']
                    },
                    player2: {
                        hand: ['wampa', 'vanquish'],
                        groundArena: ['frontier-atrt']
                    }
                });
            });

            function playTwoRounds(): void {
                const { context } = contextRef;

                context.player1.clickCard(context.battlefieldMarine);
                context.player2.clickCard(context.wampa);
                context.player1.clickCard(context.atst);
                context.player1.clickCard(context.p2Base);
                context.player2.clickCard(context.frontierAtrt);
                context.player2.clickCard(context.p1Base);

                context.moveToNextActionPhase();

                context.player1.clickCard(context.battlefieldMarine);
                context.player1.clickCard(context.p2Base);
                context.player2.clickCard(context.wampa);
                context.player2.clickCard(context.p1Base);
            }

            it('writes a valid file in every view, ending on a step with the result (W-11, W-40)', function () {
                const { context } = contextRef;
                const writer = writerOf();

                playTwoRounds();
                context.game.concede(context.player2Object.id);
                context.ignoreUnresolvedActionPhasePrompts = true;

                expectEveryViewValid(writer);

                const full = parse(writer.fileFor('full'));
                expect(lastRecord(full).t).toBe('step');
                expect(resultOf(full)).toBe('p1');
                expect(full.header.Result).toBe('P1');
                expect(full.header.Reason).toBe('Concession');
                expect(full.header.Rounds).toBe('2');
                expect(full.header.EndDate).toBeDefined();
                // a whole-suite undo run rolls each test back once before running it again
                expect(full.header.Undos).toBe(writer.undos > 0 ? String(writer.undos) : undefined);
                expect(full.header.WriterErrors).toBeUndefined();
            });

            it('writes the fixed header tags and the seat identities (W-08, W-56, W-57)', function () {
                const { context } = contextRef;
                const writer = writerOf();

                const header = parse(writer.fileFor('full')).header;
                expect(header.Game).toBe('SWU-PGN/0.1');
                expect(header.Visibility).toBe('full');
                expect(header.Steps).toBe('decision');
                expect(header.WriterRevision).toBe('1');
                expect(header.P1Id).toMatch(/^sha256:[0-9a-f]{64}$/);
                expect(header.P2Id).toMatch(/^sha256:[0-9a-f]{64}$/);
                expect(header.GameId).toMatch(/^sha256:[0-9a-f]{64}$/);
                expect(header.P1).toBe('Player 1');
                expect(header.P2).toBe('Player 2');
                expect(header.Engine).toMatch(/^forceteki@[!-~]+$/);
                expect(header.CardPool.split(',')).toContain('SOR');
                expect(header.P1Leader).toBe(cardIdOf(context.p1Leader));
                expect(header.P2Base).toBe(cardIdOf(context.p2Base));
                expect(header.Result).toBe('Incomplete');
                expect(header.EndDate).toBeUndefined();
            });

            it('writes one complete DECKS line per seat matching the header, and a CARDS line for every card id (W-47..W-51)', function () {
                const { context } = contextRef;
                const writer = writerOf();

                playTwoRounds();
                const full = parse(writer.fileFor('full'));

                expect(full.decks.map((deck) => deck.p)).toEqual([1, 2]);
                for (const deck of full.decks) {
                    expect(deck.complete).toBeTrue();
                    expect(deck.leaders.join(',')).toBe(full.header[`P${deck.p}Leader`]);
                    expect(deck.base).toBe(full.header[`P${deck.p}Base`]);
                    expect(deck.main.length).toBeGreaterThan(0);
                }
                expect(full.decks[1].main.map(([id]) => id)).toContain(cardIdOf(context.vanquish));

                const indexed = new Set(full.cards.map((card) => card.id));
                expect(indexed.size).toBe(full.cards.length);
                for (const record of full.records) {
                    if ((record.t === 'create' || record.t === 'reveal') && record.card !== undefined) {
                        expect(indexed.has(record.card)).withContext(record.card)
                            .toBeTrue();
                    }
                }
                expect(full.cards.find((card) => card.id === cardIdOf(context.battlefieldMarine))?.name).toBe('Battlefield Marine');
            });

            it('keeps a P2 hand card that P1 never saw out of the P1 file', function () {
                const { context } = contextRef;
                const writer = writerOf();

                playTwoRounds();
                context.game.concede(context.player2Object.id);
                context.ignoreUnresolvedActionPhasePrompts = true;

                const vanquish = cardIdOf(context.vanquish);
                const full = parse(writer.fileFor('full'));
                expect(full.records.some((record) => record.t === 'create' && record.card === vanquish))
                    .withContext('the full file shows the card')
                    .toBeTrue();

                for (const view of [1, 'public'] as const) {
                    const text = writer.fileFor(view);
                    const file = parse(text);
                    expect(file.records.some((record) => (record.t === 'create' || record.t === 'reveal') && record.card === vanquish))
                        .withContext(`view ${view}`)
                        .toBeFalse();
                    expect(text).not.toContain(vanquish);
                }
            });
        });

        it('ends a game whose base reaches 0 HP during an attack trigger with a valid file and a final step', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['jedha-agitator'],
                    leader: { card: 'hunter#outcast-sergeant', deployed: true }
                },
                player2: {
                    groundArena: ['wampa']
                }
            });
            const { context } = contextRef;
            const writer = writerOf();
            context.setDamage(context.p2Base, context.p2Base.getHp() - 2);

            context.player1.clickCard(context.jedhaAgitator);
            context.player1.clickCard(context.wampa);
            context.player1.clickPrompt('If you control a leader unit, deal 2 damage to a ground unit or base');
            context.player1.clickCard(context.p2Base);
            expect(context.game.isEnded).toBeTrue();
            context.ignoreUnresolvedActionPhasePrompts = true;

            expectEveryViewValid(writer);
            const full = parse(writer.fileFor('full'));
            expect(lastRecord(full).t).toBe('step');
            expect(resultOf(full)).toBe('p1');
            expect(full.header.Result).toBe('P1');
            expect(full.header.Reason).toBe('Base destroyed');
        });
    });

    undoIntegration(function(contextRef) {
        it('takes the result back with an undo past game end: Result becomes Incomplete', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    spaceArena: ['republic-arc170']
                },
                player2: {
                    groundArena: ['wampa'],
                    base: { card: 'energy-conversion-lab', damage: 24 },
                    hasInitiative: true
                }
            });
            const { context } = contextRef;
            const writer = context.game.swuPgnWriter;
            context.ignoreUnresolvedActionPhasePrompts = true;

            context.player2.passAction();
            context.player1.clickCard(context.republicArc170);
            context.player1.clickCard(context.p2Base);
            expect(context.game.isEnded).toBeTrue();
            expect(parse(writer.fileFor('full')).header.Result).toBe('P1');

            expect(contextRef.snapshot.rollbackToSnapshot({ type: 'action', playerId: context.player1.id })).toBeTrue();
            expect(context.game.isEnded).toBeFalse();

            const full = parse(writer.fileFor('full'));
            expect(resultOf(full)).toBeUndefined();
            expect(full.header.Result).toBe('Incomplete');
            expect(full.header.Reason).toBe('Not finished');
            expect(full.header.EndDate).toBeUndefined();
            expect(full.header.Undos).toBe('1');
            for (const view of ['full', 1, 2, 'public'] as const) {
                const report = validate(writer.fileFor(view));
                expect(report.level).withContext(`validate(fileFor(${view})): ${JSON.stringify(report.issues)}`)
                    .toBe('valid');
            }
            expect(writer.errors).toBe(0);
        });
    });
});
