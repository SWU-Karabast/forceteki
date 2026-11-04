import { apply } from '@swupgn/format';
import type { SwuRecord } from '@swupgn/format';
import type { SwuPgnRoundTripSubject } from '../../helpers/SwuPgnRoundTrip';
import { RevealLog, checkSwuPgnRoundTrip, checkSwuPgnSubject, swuPgnSubjectOf } from '../../helpers/SwuPgnRoundTrip';

describe('SWU-PGN round-trip checker', function() {
    integration(function(contextRef) {
        let log: RevealLog;

        /** The subject of a short game: p1 plays a unit; p2 holds a card in hand and its resources. */
        async function subjectOfAGameAsync(): Promise<SwuPgnRoundTripSubject> {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: { hand: ['battlefield-marine'] },
                player2: { hand: ['wampa'] },
            });
            const { context } = contextRef;
            log = new RevealLog();
            log.install(context.game);
            log.reset();

            context.player1.clickCard(context.battlefieldMarine);
            return swuPgnSubjectOf(context.game, log);
        }

        /** The subject with its records replaced, and the writer's board the one they give, so only `check` sees them. */
        function withRecords(subject: SwuPgnRoundTripSubject, records: SwuRecord[]): SwuPgnRoundTripSubject {
            return { ...subject, records, currentBoard: apply(records) };
        }

        it('finds nothing wrong with the files of a game', async function () {
            const subject = await subjectOfAGameAsync();

            expect(checkSwuPgnSubject(subject)).toEqual([]);
            expect(checkSwuPgnRoundTrip(contextRef.context.game, log)).toEqual([]);
        });

        it('skips a game with no writer', function () {
            expect(checkSwuPgnRoundTrip({ swuPgnWriter: null }, new RevealLog())).toEqual([]);
        });

        it('finds records that do not replay to the writer\'s board', async function () {
            const subject = await subjectOfAGameAsync();
            const board = apply(subject.records);
            board.entities.g.a.round = 99;

            const problems = checkSwuPgnSubject({ ...subject, currentBoard: board });

            expect(problems.length).toBe(1);
            expect(problems[0]).toMatch(/^round-trip: .*entity g/);
        });

        it('finds a view that does not validate', async function () {
            const subject = await subjectOfAGameAsync();

            const problems = checkSwuPgnSubject({ ...subject, files: { ...subject.files, 2: 'not a file' } });

            expect(problems.length).toBe(1);
            expect(problems[0]).toMatch(/^valid: validate\(fileFor\(2\)\) is malformed/);
        });

        it('finds an attribute that is not in the registry', async function () {
            const subject = await subjectOfAGameAsync();
            const records: SwuRecord[] = [...subject.records, { t: 'set', e: 'g', a: { bogus: 1 } }];

            const problems = checkSwuPgnSubject(withRecords(subject, records));

            expect(problems).toEqual([jasmine.stringMatching(/^registry: 'bogus' is not in the registry \(entity g\)/)]);
        });

        it('finds an attribute on an entity kind it is not registered for', async function () {
            const subject = await subjectOfAGameAsync();
            const records: SwuRecord[] = [...subject.records, { t: 'set', e: 'p1', a: { damage: 1 } }];

            const problems = checkSwuPgnSubject(withRecords(subject, records));

            expect(problems).toEqual([jasmine.stringMatching(/^registry: 'damage' is not allowed on seat \(entity p1; on unit\|base\)/)]);
        });

        it('finds a view that names a hidden card its viewer was not shown', async function () {
            const subject = await subjectOfAGameAsync();

            // the full file, passed off as seat 1's: it names p2's hand and resources
            const problems = checkSwuPgnSubject({ ...subject, files: { ...subject.files, 1: subject.files.full } });

            expect(problems.length).toBe(1);
            expect(problems[0]).toMatch(/^leak: fileFor\(1\) names hidden cards .*in p2's (hand|resource)/);
        });

        it('allows a hidden card the reveal log says was shown to the viewer', async function () {
            const subject = await subjectOfAGameAsync();
            const shown = subject.hiddenCards.map((card) => (card.owner === 2 ? { ...card, seenBy: [1] } : card));

            const problems = checkSwuPgnSubject({ ...subject, hiddenCards: shown, files: { ...subject.files, 1: subject.files.full } });

            expect(problems).toEqual([]);
        });

        it('finds writer errors', async function () {
            const subject = await subjectOfAGameAsync();

            expect(checkSwuPgnSubject({ ...subject, errors: 2 })).toEqual([jasmine.stringMatching(/^errors: the writer counted 2 error/)]);
        });

        it('logs a card that passes through a public zone as shown to both seats, until it enters a deck', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player2: { hand: ['wampa'] },
            });
            const { context } = contextRef;
            log = new RevealLog();
            log.install(context.game);

            context.player2.moveCard(context.wampa, 'discard');
            context.player2.moveCard(context.wampa, 'hand');
            expect(log.seatsThatSaw(context.wampa.uuid)).toEqual([1, 2]);
            expect(checkSwuPgnRoundTrip(context.game, log)).toEqual([]);

            context.player2.moveCard(context.wampa, 'deck');
            expect(log.seatsThatSaw(context.wampa.uuid)).toEqual([]);
            expect(log.seatsThatSaw(context.wampa.uuid, true)).toEqual([1, 2]);
        });

        it('logs a card in a public zone of the starting board as shown to both seats', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player2: { groundArena: ['wampa'], hand: ['battlefield-marine'] },
            });
            const { context } = contextRef;
            log = new RevealLog();
            log.install(context.game);
            log.reset();

            expect(log.seatsThatSaw(context.wampa.uuid)).toEqual([1, 2]);
            expect(log.seatsThatSaw(context.battlefieldMarine.uuid)).toEqual([]);

            // a unit returned to its owner's hand stays known to the opponent
            context.player2.moveCard(context.wampa, 'hand');
            expect(checkSwuPgnRoundTrip(context.game, log)).toEqual([]);
        });
    });
});
