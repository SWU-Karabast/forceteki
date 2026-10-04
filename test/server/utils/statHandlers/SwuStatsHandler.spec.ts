import { SwuStatsHandler } from '../../../../server/utils/statHandlers/SwuStatsHandler';
import { RefreshTokenSource } from '../../../../server/utils/statHandlers/StatHandlerTypes';
import type { UserFactory } from '../../../../server/utils/user/UserFactory';
import type { GameServer, IToken } from '../../../../server/gamenode/GameServer';
import { FakeHttpClient } from '../../../helpers/server/FakeHttpClient';
import { ServerTestHarness } from '../../../helpers/server/ServerTestHarness';

/**
 * Demonstrates the `IHttpClient` seam `SwuStatsHandler` calls through instead of the global `fetch`:
 * the handler's own payload-building and response-interpreting logic runs for real, while
 * `FakeHttpClient` stands in for the network, recording requests and returning canned responses.
 */
describe('SwuStatsHandler', function () {
    let httpClient: FakeHttpClient;
    let userFactory: jasmine.SpyObj<UserFactory>;
    let handler: SwuStatsHandler;

    beforeEach(function () {
        httpClient = new FakeHttpClient();
        userFactory = jasmine.createSpyObj<UserFactory>('UserFactory', ['getUserRefreshTokenAsync', 'addRefreshTokenAsync']);
        handler = new SwuStatsHandler(userFactory, httpClient);
    });

    describe('refreshTokensAsync', function () {
        it('sends a form-encoded refresh request and returns the parsed tokens', async function () {
            httpClient.setResponse('OAuth/token.php', {
                body: { access_token: 'new-access-token', refresh_token: 'new-refresh-token', expires_in: 3600 },
            });

            const result = await handler.refreshTokensAsync('old-refresh-token');

            expect(result).toEqual(jasmine.objectContaining({
                accessToken: 'new-access-token',
                refreshToken: 'new-refresh-token',
                timeToLiveSeconds: 3600,
            }));

            const [sent] = httpClient.requestsTo('OAuth/token.php');
            expect(sent.method).toBe('POST');
            expect(sent.headers['Content-Type']).toBe('application/x-www-form-urlencoded');

            const sentParams = new URLSearchParams(sent.body);
            expect(sentParams.get('grant_type')).toBe('refresh_token');
            expect(sentParams.get('refresh_token')).toBe('old-refresh-token');
            expect(sentParams.get('client_id')).toBe('test-swustats-client-id');
        });

        it('returns null rather than throwing when the remote site rejects the refresh', async function () {
            httpClient.setResponse('OAuth/token.php', { status: 401, body: { error: 'invalid_grant' } });

            const result = await handler.refreshTokensAsync('expired-refresh-token');

            expect(result).toBeNull();
        });
    });

    describe('getAccessTokenAsync', function () {
        const userId = 'player-1';
        let serverObject: GameServer;

        beforeEach(function () {
            serverObject = { swuStatsTokenMapping: new Map<string, IToken>() } as unknown as GameServer;
        });

        it('reuses a still-valid cached token without calling out', async function () {
            serverObject.swuStatsTokenMapping.set(userId, {
                accessToken: 'still-valid',
                refreshToken: 'irrelevant',
                creationDateTime: new Date(),
                timeToLiveSeconds: 3600,
            });

            const token = await handler.getAccessTokenAsync(userId, serverObject);

            expect(token).toBe('still-valid');
            expect(httpClient.requests.length).toBe(0);
        });

        it('refreshes an expired cached token using the stored refresh token', async function () {
            serverObject.swuStatsTokenMapping.set(userId, {
                accessToken: 'stale',
                refreshToken: 'irrelevant',
                creationDateTime: new Date(0),
                timeToLiveSeconds: 1,
            });
            userFactory.getUserRefreshTokenAsync.and.resolveTo('stored-refresh-token');
            httpClient.setResponse('OAuth/token.php', {
                body: { access_token: 'refreshed-access', refresh_token: 'refreshed-refresh', expires_in: 3600 },
            });

            const token = await handler.getAccessTokenAsync(userId, serverObject);

            expect(token).toBe('refreshed-access');
            expect(userFactory.getUserRefreshTokenAsync).toHaveBeenCalledWith(userId, RefreshTokenSource.SWUStats);
            expect(userFactory.addRefreshTokenAsync).toHaveBeenCalledWith(userId, 'refreshed-refresh', RefreshTokenSource.SWUStats);
            expect(serverObject.swuStatsTokenMapping.get(userId).accessToken).toBe('refreshed-access');
        });

        it('returns null without calling out when there is no stored refresh token', async function () {
            userFactory.getUserRefreshTokenAsync.and.resolveTo(null);

            const token = await handler.getAccessTokenAsync(userId, serverObject);

            expect(token).toBeNull();
            expect(httpClient.requests.length).toBe(0);
        });
    });

    describe('wired through GameServer', function () {
        let harness: ServerTestHarness;

        afterEach(async function () {
            await harness?.shutdownAsync();
        });

        it('uses the harness-provided fake for its outbound calls', async function () {
            harness = await ServerTestHarness.createAsync();
            harness.statsHttpClient.setResponse('OAuth/token.php', {
                body: { access_token: 'harness-access', refresh_token: 'harness-refresh', expires_in: 3600 },
            });

            const token = await harness.server.swuStatsHandler.refreshTokensAsync('some-refresh-token');

            expect(token.accessToken).toBe('harness-access');
            expect(harness.statsHttpClient.requestsTo('OAuth/token.php').length).toBe(1);
        });
    });
});
