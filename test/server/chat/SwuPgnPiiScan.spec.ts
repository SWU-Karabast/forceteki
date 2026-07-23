import { parse } from '../../../swupgn/src/index';

/**
 * Task 12 — Dedicated PII-scan CI gate.
 *
 * Proves that NO real username / player id / spectator name / email ever appears
 * anywhere in a generated `.swupgn`. The generator records player identity as a
 * salted `sha256:<hash>` and labels seats anonymously (`Player 1` / `Player 2`).
 *
 * To make any leak unambiguous, this test stamps DISTINCTIVE sentinel identities
 * onto the live game objects (usernames, player names, player ids, owner, and a
 * spectator) before generating the archive, then asserts none of those sentinels
 * survive into the text. A substring match against a sentinel is a real leak.
 */
describe('SWU-PGN/1.1 generated archive PII scan', function () {
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

        it('never leaks a real username, player id, owner, spectator name, or email', function () {
            const { context } = contextRef;
            const game: any = context.game;

            // --- Stamp DISTINCTIVE sentinel identities onto the live game ---------
            // The header builder reads player.user.username; the reducedState mapper
            // keys off player.id / player.name; the snapshot path historically leaked
            // the lobby owner and the spectator list. Cover all of them.
            const aliceUsername = 'PII_LEAK_user_alice_aaaa';
            const bobUsername = 'PII_LEAK_user_bob_bbbb';
            const carolSpectator = 'PII_LEAK_spectator_carol_cccc';
            const aliceEmail = 'pii.leak.alice@example.com';

            const players: any[] = game.getPlayers();
            const p1: any = players[0];
            const p2: any = players[1];

            // Capture the harness-assigned ids/names too — they are equally forbidden.
            const realP1Id: string = p1.id;
            const realP2Id: string = p2.id;
            const realP1Name: string = p1.name;
            const realP2Name: string = p2.name;
            const realOwner: string = game.owner;

            // Overwrite usernames (and an email field) with sentinels so a header /
            // snapshot leak surfaces them verbatim. player.name is a read-only getter
            // (derived from user.username at construction), so the harness-assigned
            // names (player1/player2) stay as forbidden needles below.
            p1.user.username = aliceUsername;
            p1.user.email = aliceEmail;
            p2.user.username = bobUsername;
            game.owner = aliceUsername;

            // Add a spectator with a distinctive username. The lobby owner + spectator
            // list are exactly what the prior regression leaked via the omniscient
            // snapshot, so exercise that path explicitly.
            let spectatorAdded = false;
            try {
                game.allowSpectators = true;
                spectatorAdded = game.watch('spectator-socket-1', {
                    id: 'spectator-id-1',
                    username: carolSpectator,
                    settings: {},
                });
            } catch {
                spectatorAdded = false;
            }
            expect(spectatorAdded)
                .withContext('spectator could not be added to the harness game; the spectator needle was not exercised')
                .toBe(true);

            // --- Play a short, real game so the archive has real content -----------
            context.player1.clickCard(context.wampa);
            context.player1.clickCard(context.p2Base);
            context.player2.clickCard(context.battlefieldMarine);
            context.player2.clickCard(context.p1Base);
            context.moveToNextActionPhase();
            context.player1.clickCard(context.atst);
            context.player1.clickCard(context.p2Base);
            context.moveToNextActionPhase();

            const text: string = game.getCachedSwuPgn();
            expect(typeof text).toBe('string');
            expect(text.length).toBeGreaterThan(0);

            // The set of real identity strings that must NEVER appear in the file.
            const forbidden: string[] = [
                aliceUsername,
                bobUsername,
                carolSpectator,
                aliceEmail,
                realP1Id,
                realP2Id,
                realP1Name,
                realP2Name,
                realOwner,
            ].filter((s) => typeof s === 'string' && s.length > 0);

            // 1) No real identity strings anywhere in the file.
            for (const needle of forbidden) {
                expect(text.includes(needle))
                    .withContext(`leaked identity into .swupgn: ${needle}`)
                    .toBe(false);
            }

            // 2) Structural guards — none of these keys/markers should appear.
            expect(text).not.toContain('"username"');
            expect(text).not.toContain('spectator');
            expect(text).not.toContain('owner');

            // 3) No email-shaped tokens. The Engine tag (forceteki@<ver>) has no
            //    dot-tld and is intentionally not matched by this pattern.
            expect(text).not.toMatch(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/);

            // 4) Salted ids ARE present — proves identities were recorded, just hashed.
            expect(text).toContain('sha256:');

            // 5) Parse + confirm header labels are anonymized seats.
            const doc = parse(text);
            expect(doc.header.p1).toBe('Player 1');
            expect(doc.header.p2).toBe('Player 2');
        });
    });
});
