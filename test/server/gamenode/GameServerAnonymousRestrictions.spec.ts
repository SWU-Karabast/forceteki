import { CardPool, GamesToWinMode, SwuGameFormat } from '../../../server/game/core/Constants';
import { ServerTestHarness } from '../../helpers/server/ServerTestHarness';

/**
 * Covers the behavioural config seam.
 *
 * These rules were previously derived from `process.env.ENVIRONMENT` at their use sites, which made
 * them untestable in practice: a test process runs as `development` so that it does not need AWS
 * credentials, and `development` switches every one of these restrictions off. Injecting the config
 * decouples "which behaviour am I testing" from "which infrastructure am I using", so both sides of
 * each rule can be asserted.
 */
describe('GameServer anonymous user restrictions', function () {
    let harness: ServerTestHarness;

    afterEach(async function () {
        await harness?.shutdownAsync();
    });

    function createLobbyBody(overrides: Record<string, unknown> = {}) {
        return {
            user: harness.anonymousUser(),
            deck: harness.decklists.validDecklist(),
            lobbyName: harness.uniqueLobbyName(),
            format: SwuGameFormat.Premier,
            cardPool: CardPool.Current,
            gamesToWinMode: GamesToWinMode.BestOfOne,
            isPrivate: false,
            ...overrides,
        };
    }

    describe('when anonymous best-of-three is not allowed', function () {
        beforeEach(async function () {
            harness = await ServerTestHarness.createAsync({ allowAnonymousBestOfThree: false });
        });

        it('rejects an anonymous user creating a public best-of-three lobby', async function () {
            const response = await harness.api
                .post('/api/create-lobby')
                .send(createLobbyBody({ gamesToWinMode: GamesToWinMode.BestOfThree }));

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
            expect(response.body.message).toContain('logged in');
        });

        it('rejects an anonymous user queueing for best-of-three', async function () {
            const response = await harness.api
                .post('/api/enter-queue')
                .send({
                    user: harness.anonymousUser(),
                    deck: harness.decklists.validDecklist(),
                    format: SwuGameFormat.Premier,
                    cardPool: CardPool.Current,
                    gamesToWinMode: GamesToWinMode.BestOfThree,
                });

            expect(response.status).toBe(400);
            expect(response.body.success).toBe(false);
        });

        it('still allows an anonymous user to create a private best-of-three lobby', async function () {
            const response = await harness.api
                .post('/api/create-lobby')
                .send(createLobbyBody({ gamesToWinMode: GamesToWinMode.BestOfThree, isPrivate: true }));

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
        });

        it('still allows an anonymous user to create a best-of-one lobby', async function () {
            const response = await harness.api
                .post('/api/create-lobby')
                .send(createLobbyBody({ gamesToWinMode: GamesToWinMode.BestOfOne }));

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
        });
    });

    describe('when anonymous best-of-three is allowed', function () {
        beforeEach(async function () {
            harness = await ServerTestHarness.createAsync({ allowAnonymousBestOfThree: true });
        });

        it('lets an anonymous user create a public best-of-three lobby', async function () {
            const response = await harness.api
                .post('/api/create-lobby')
                .send(createLobbyBody({ gamesToWinMode: GamesToWinMode.BestOfThree }));

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
        });
    });

    describe('spectating', function () {
        it('rejects an anonymous spectator when anonymous spectating is not allowed', async function () {
            harness = await ServerTestHarness.createAsync({ allowAnonymousSpectators: false });

            const response = await harness.api
                .post('/api/spectate-game')
                .send({ gameId: 'some-lobby', user: harness.anonymousUser() });

            expect(response.status).toBe(401);
            expect(response.body.success).toBe(false);
        });

        it('lets an anonymous spectator past the identity check when anonymous spectating is allowed', async function () {
            harness = await ServerTestHarness.createAsync({ allowAnonymousSpectators: true });

            const response = await harness.api
                .post('/api/spectate-game')
                .send({ gameId: 'some-lobby', user: harness.anonymousUser() });

            // the lobby does not exist, so this gets past the anonymous check and fails on lookup instead
            expect(response.status).not.toBe(401);
        });
    });
});
