import type { SwuPgnFile, SwuRecord } from '@swupgn/format';
import { apply, parse } from '@swupgn/format';
import { validate } from '@swupgn/format/validate';
import { GameEndReason } from '../../../server/game/core/Constants';
import { deckEntryId } from '../../../server/game/core/swupgn/FileAssembler';
import { cardIdOf } from '../../../server/game/core/swupgn/SwuPgnCardIds';
import type { SwuPgnFileView } from '../../../server/game/core/swupgn/SwuPgnWriter';
import { SwuPgnWriter } from '../../../server/game/core/swupgn/SwuPgnWriter';

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
            const captured: { atGameEnd: SwuRecord[] | null } = { atGameEnd: null };
            const captureAtGameEnd = () => {
                SwuPgnWriter.prototype.onGameEnded.call(writer);
                captured.atGameEnd = [...writer.records];
            };
            // a whole-suite undo run plays the test body again on the same writer, which is then already spied on
            const spy = jasmine.isSpy(writer.onGameEnded) ? writer.onGameEnded as jasmine.Spy : spyOn(writer, 'onGameEnded');
            spy.and.callFake(captureAtGameEnd);

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

            // the game ended mid-attack: the game-end hook writes the step that holds the result right then. The result's
            // `set` shares its flush with the base's lethal damage, so the step closes that same group.
            const atGameEnd = captured.atGameEnd ?? [];
            expect(atGameEnd.length).withContext('records when the game-end hook returned')
                .toBeGreaterThan(0);
            const resultAt = atGameEnd.findIndex((record) => record.t === 'set' && record.e === 'g' && record.a?.result === 'p1');
            expect(resultAt).withContext('the set that writes g.result')
                .toBeGreaterThan(-1);
            const between = atGameEnd.slice(resultAt + 1, atGameEnd.length - 1);
            expect(between.every((record) => record.t === 'set')).withContext(`records between the result and the step: ${JSON.stringify(between)}`)
                .toBeTrue();
            expect(atGameEnd[atGameEnd.length - 1].t).withContext('the last record at game end')
                .toBe('step');
            expect(full.records.slice(0, atGameEnd.length)).toEqual(atGameEnd);
        });

        it('writes step 0 with the result for a game conceded during the mulligan prompt (W-11, W-39, W-40)', async function () {
            await contextRef.setupTestAsync({
                phase: 'setup',
                player1: {
                    deck: ['battlefield-marine', 'battlefield-marine', 'battlefield-marine', 'wampa', 'wampa', 'wampa', 'atst', 'atst', 'atst', 'pyke-sentinel']
                },
                player2: {
                    deck: ['moisture-farmer', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst', 'wampa', 'atst']
                }
            });
            const { context } = contextRef;
            const writer = writerOf();

            context.selectInitiativePlayer(context.player1);
            expect(context.player1).toHaveExactPromptButtons(['Mulligan', 'Keep']);
            expect(writer.records.some((record) => record.t === 'step')).withContext('no step during setup')
                .toBeFalse();

            context.game.concede(context.player2Object.id);

            expect(writer.records[writer.records.length - 1]).toEqual({ t: 'step', seq: 0 });
            expect(writer.records.filter((record) => record.t === 'step').length).toBe(1);
            expectEveryViewValid(writer);
            const full = parse(writer.fileFor('full'));
            expect(resultOf(full)).toBe('p1');
            expect(full.header.Result).toBe('P1');
            expect(full.header.Reason).toBe('Concession');
        });

        it('keeps the first game end\'s Reason when the game is ended again', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: { groundArena: ['wampa'] },
                player2: { groundArena: ['atst'] }
            });
            const { context } = contextRef;
            const writer = writerOf();

            context.game.concede(context.player2Object.id);
            context.ignoreUnresolvedActionPhasePrompts = true;
            context.game.endGame(context.player1Object, GameEndReason.Timeout);
            expect(context.game.gameEndReason).withContext('the engine took the later reason')
                .toBe(GameEndReason.Timeout);

            const full = parse(writer.fileFor('full'));
            expect(full.header.Result).toBe('P1');
            expect(full.header.Reason).toBe('Concession');
            expectEveryViewValid(writer);
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
            expect(writer.gameEndReason).withContext('the captured reason is rollback state')
                .toBeNull();
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

describe('SWU-PGN DECKS entry ids', function() {
    integration(function(contextRef) {
        it('writes a decklist id as a card id, padding the number', function () {
            const unparsed: string[] = [];
            expect(deckEntryId('SOR_95', (raw) => unparsed.push(raw))).toBe('SOR#095');
            expect(deckEntryId('ibh_001', (raw) => unparsed.push(raw))).toBe('IBH#001');
            expect(unparsed).toEqual([]);
        });

        it('keeps an id it cannot parse raw, and reports it', function () {
            const unparsed: string[] = [];
            expect(deckEntryId('SOR_095a', (raw) => unparsed.push(raw))).toBe('SOR_095a');
            expect(deckEntryId('SOR', (raw) => unparsed.push(raw))).toBe('SOR');
            expect(unparsed).toEqual(['SOR_095a', 'SOR']);
        });

        it('counts each unparsable decklist id once as a writer error', async function () {
            await contextRef.setupTestAsync({ phase: 'action' });
            const writer = contextRef.context.game.swuPgnWriter;
            // the ids already reported are not rollback state (an undo does not change a decklist), and the undo
            // suite runs this body twice on one writer: each run reports ids of its own
            const run = writer.undos;

            writer.onUnparsedDeckEntryId(`SOR_095a${run}`);
            writer.onUnparsedDeckEntryId(`SOR_095a${run}`);
            expect(writer.errors).toBe(1);
            writer.onUnparsedDeckEntryId(`SOR${run}`);
            expect(writer.errors).toBe(2);
            // the errors were counted on purpose: clear them for the suite-wide checks that no writer counted any
            writer.restartBaseline();
        });
    });
});
