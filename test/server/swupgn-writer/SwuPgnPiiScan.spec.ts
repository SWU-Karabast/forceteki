import { parse } from '@swupgn/format';
import { saltedPlayerId } from '../../../server/game/core/swupgn/swuPgnIdentity';
import type { SwuPgnFileView, SwuPgnWriter } from '../../../server/game/core/swupgn/SwuPgnWriter';

/**
 * No real username, player id, owner, spectator name or email may appear anywhere in a written file, in any view
 * (W-56..W-58). The spec stamps distinctive sentinel identities onto the live game before the game is played, so a
 * substring match against a sentinel is a real leak.
 */
describe('SWU-PGN file PII scan', function() {
    integration(function(contextRef) {
        const views: SwuPgnFileView[] = ['full', 1, 2, 'public'];

        beforeEach(async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['wampa', 'atst'],
                    deck: ['cartel-spacer', 'cartel-spacer', 'cartel-spacer', 'cartel-spacer', 'cartel-spacer', 'cartel-spacer']
                },
                player2: {
                    groundArena: ['battlefield-marine'],
                    deck: ['cartel-spacer', 'cartel-spacer', 'cartel-spacer', 'cartel-spacer', 'cartel-spacer', 'cartel-spacer']
                }
            });
        });

        afterEach(function () {
            expect(contextRef.context.game.swuPgnWriter?.errors).withContext('writer errors')
                .toBe(0);
        });

        function writerOf(): SwuPgnWriter {
            const writer = contextRef.context.game.swuPgnWriter;
            expect(writer).withContext('the game has a writer')
                .not.toBeNull();
            return writer;
        }

        it('never leaks a real username, player id, owner, spectator name or email', function () {
            const { context } = contextRef;
            const game = context.game;
            const writer = writerOf();

            const aliceUsername = 'PII_LEAK_user_alice_aaaa';
            const bobUsername = 'PII_LEAK_user_bob_bbbb';
            const carolSpectator = 'PII_LEAK_spectator_carol_cccc';
            const aliceEmail = 'pii.leak.alice@example.com';

            const p1 = context.player1Object;
            const p2 = context.player2Object;
            const realIds = [p1.id, p2.id, String(game.id), game.lobbyId].filter((id): id is string => typeof id === 'string' && id.length > 0);
            const realNames = [p1.name, p2.name, game.owner];

            p1.user.username = aliceUsername;
            Object.assign(p1.user, { email: aliceEmail });
            p2.user.username = bobUsername;
            game.owner = aliceUsername;
            game.allowSpectators = true;
            expect(game.watch('spectator-socket-1', { id: 'spectator-id-1', username: carolSpectator, blockList: [], promptedActionWindows: p1.user.promptedActionWindows, settings: {} }))
                .withContext('the spectator was added')
                .toBeTrue();

            context.player1.clickCard(context.wampa);
            context.player1.clickCard(context.p2Base);
            context.player2.clickCard(context.battlefieldMarine);
            context.player2.clickCard(context.p1Base);
            context.moveToNextActionPhase();
            context.player1.clickCard(context.atst);
            context.player1.clickCard(context.p2Base);
            game.concede(p2.id);
            context.ignoreUnresolvedActionPhasePrompts = true;

            const forbidden = [aliceUsername, bobUsername, carolSpectator, aliceEmail, ...realNames];
            for (const view of views) {
                const text = writer.fileFor(view);
                for (const needle of forbidden) {
                    expect(text.includes(needle)).withContext(`view ${view} leaks ${needle}`)
                        .toBeFalse();
                }
                // the harness ids are short digit strings, which a hash may hold: check them as whole values
                const header = parse(text).header;
                for (const id of realIds) {
                    expect(Object.values(header).some((value) => value === id || value.includes(`:${id}`)))
                        .withContext(`view ${view} header carries the id ${id}`)
                        .toBeFalse();
                    expect(text).not.toContain(`"${id}"`);
                }
                expect(text).not.toContain('"username"');
                expect(text).not.toContain('spectator');
                expect(text).not.toMatch(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/);
                expect(header.P1).toBe('Player 1');
                expect(header.P2).toBe('Player 2');
            }
        });

        it('derives each seat\'s id from its account, not its display name', function () {
            const { context } = contextRef;
            const p1 = context.player1Object;
            const p2 = context.player2Object;
            p1.user.username = 'AnonymousPlayer';
            p2.user.username = 'AnonymousPlayer';

            context.player1.clickCard(context.wampa);
            context.player1.clickCard(context.p2Base);
            const header = parse(writerOf().fileFor('full')).header;

            expect(header.P1Id).toBe(saltedPlayerId(p1.id, context.game.id));
            expect(header.P2Id).toBe(saltedPlayerId(p2.id, context.game.id));
            expect(header.P1Id).not.toBe(header.P2Id);
        });
    });
});
