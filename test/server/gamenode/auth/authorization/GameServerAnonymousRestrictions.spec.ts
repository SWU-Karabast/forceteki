import { GamesToWinMode } from '../../../../../server/game/core/Constants';
import { premierBestOfOne, premierBestOfThree } from '../../../../helpers/server/MatchConfigs';
import { serverIntegration } from '../../../../helpers/server/ServerIntegrationHelper';
import type { ServerTestHarness } from '../../../../helpers/server/ServerTestHarness';

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
    function createLobbyBody(harness: ServerTestHarness, overrides: Record<string, unknown> = {}) {
        return {
            user: harness.anonymousUser(),
            deck: harness.decklists.validDecklist(),
            lobbyName: harness.uniqueLobbyName(),
            ...premierBestOfOne,
            isPrivate: false,
            ...overrides,
        };
    }

    describe('when anonymous best-of-three is not allowed', function () {
        serverIntegration(function (contextRef) {
            it('rejects an anonymous user creating a public best-of-three lobby', async function () {
                const { harness } = contextRef;

                const response = await harness.api
                    .post('/api/create-lobby')
                    .send(createLobbyBody(harness, { gamesToWinMode: GamesToWinMode.BestOfThree }));

                expect(response.status).toBe(400);
                expect(response.body.success).toBe(false);
                expect(response.body.message).toContain('logged in');
            });

            it('rejects an anonymous user queueing for best-of-three', async function () {
                const { harness } = contextRef;

                const response = await harness.api
                    .post('/api/enter-queue')
                    .send({
                        user: harness.anonymousUser(),
                        deck: harness.decklists.validDecklist(),
                        ...premierBestOfThree,
                    });

                expect(response.status).toBe(400);
                expect(response.body.success).toBe(false);
            });

            it('still allows an anonymous user to create a private best-of-three lobby', async function () {
                const { harness } = contextRef;

                const response = await harness.api
                    .post('/api/create-lobby')
                    .send(createLobbyBody(harness, { gamesToWinMode: GamesToWinMode.BestOfThree, isPrivate: true }));

                expect(response.status).toBe(200);
                expect(response.body.success).toBe(true);
            });

            it('still allows an anonymous user to create a best-of-one lobby', async function () {
                const { harness } = contextRef;

                const response = await harness.api
                    .post('/api/create-lobby')
                    .send(createLobbyBody(harness, { gamesToWinMode: GamesToWinMode.BestOfOne }));

                expect(response.status).toBe(200);
                expect(response.body.success).toBe(true);
            });
        }, { config: { allowAnonymousBestOfThree: false } });
    });

    describe('when anonymous best-of-three is allowed', function () {
        serverIntegration(function (contextRef) {
            it('lets an anonymous user create a public best-of-three lobby', async function () {
                const { harness } = contextRef;

                const response = await harness.api
                    .post('/api/create-lobby')
                    .send(createLobbyBody(harness, { gamesToWinMode: GamesToWinMode.BestOfThree }));

                expect(response.status).toBe(200);
                expect(response.body.success).toBe(true);
            });
        }, { config: { allowAnonymousBestOfThree: true } });
    });

    describe('spectating', function () {
        describe('when anonymous spectating is not allowed', function () {
            serverIntegration(function (contextRef) {
                it('rejects an anonymous spectator', async function () {
                    const { harness } = contextRef;

                    const response = await harness.api
                        .post('/api/spectate-game')
                        .send({ gameId: 'some-lobby', user: harness.anonymousUser() });

                    expect(response.status).toBe(401);
                    expect(response.body.success).toBe(false);
                });
            }, { config: { allowAnonymousSpectators: false } });
        });

        describe('when anonymous spectating is allowed', function () {
            serverIntegration(function (contextRef) {
                it('lets an anonymous spectator past the identity check', async function () {
                    const { harness } = contextRef;

                    const response = await harness.api
                        .post('/api/spectate-game')
                        .send({ gameId: 'some-lobby', user: harness.anonymousUser() });

                    // past the anonymous check, so it fails on the lobby lookup instead
                    expect(response.status).toBe(404);
                });
            }, { config: { allowAnonymousSpectators: true } });
        });
    });
});
