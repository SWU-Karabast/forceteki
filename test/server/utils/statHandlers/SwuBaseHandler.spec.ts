import { SwuBaseHandler } from '../../../../server/utils/statHandlers/SwuBaseHandler';
import type { UserFactory } from '../../../../server/utils/user/UserFactory';
import { FakeHttpClient } from '../../../helpers/server/FakeHttpClient';

/**
 * Lighter sibling of `SwuStatsHandler.spec.ts`: proves the same `IHttpClient` seam works for the
 * second external stat site. `getAccessTokenAsync`'s cache/refresh branching is identical in shape to
 * `SwuStatsHandler`'s (already covered there), so this focuses on the calls unique to this handler.
 *
 * Also not yet exhaustive: `sendGameResultAsync` (the actual game-result payload) has no coverage
 * here yet. Full per-method coverage is Phase 4 work (see the "External stats" scenario in the
 * design doc).
 */
describe('SwuBaseHandler', function () {
    let httpClient: FakeHttpClient;
    let userFactory: jasmine.SpyObj<UserFactory>;
    let handler: SwuBaseHandler;

    beforeEach(function () {
        httpClient = new FakeHttpClient();
        userFactory = jasmine.createSpyObj<UserFactory>('UserFactory', ['getUserRefreshTokenAsync', 'addRefreshTokenAsync']);
        handler = new SwuBaseHandler(userFactory, httpClient);
    });

    describe('refreshTokensAsync', function () {
        it('sends a JSON refresh request and returns the parsed tokens', async function () {
            httpClient.setResponse('refresh-token', {
                body: { access_token: 'new-access-token', refresh_token: 'new-refresh-token', expires_in: 3600 },
            });

            const result = await handler.refreshTokensAsync('old-refresh-token', 'user-1');

            expect(result).toEqual(jasmine.objectContaining({
                accessToken: 'new-access-token',
                refreshToken: 'new-refresh-token',
                timeToLiveSeconds: 3600,
            }));

            const [sent] = httpClient.requestsTo('refresh-token');
            expect(sent.method).toBe('POST');
            const sentBody = JSON.parse(sent.body);
            expect(sentBody).toEqual(jasmine.objectContaining({
                external_user_id: 'user-1',
                refresh_token: 'old-refresh-token',
                integration: 'karabast',
            }));
        });

        it('returns null rather than throwing when the remote site rejects the refresh', async function () {
            httpClient.setResponse('refresh-token', { status: 401, body: { error: 'invalid_grant' } });

            const result = await handler.refreshTokensAsync('expired-refresh-token', 'user-1');

            expect(result).toBeNull();
        });
    });

    describe('linkAccountAsync', function () {
        it('sends the link token and returns the parsed tokens', async function () {
            httpClient.setResponse('link-confirm', {
                body: { access_token: 'linked-access', refresh_token: 'linked-refresh', expires_in: 3600 },
            });

            const result = await handler.linkAccountAsync('a-link-token', 'user-1');

            expect(result).toEqual(jasmine.objectContaining({ accessToken: 'linked-access', refreshToken: 'linked-refresh' }));

            const [sent] = httpClient.requestsTo('link-confirm');
            const sentBody = JSON.parse(sent.body);
            expect(sentBody).toEqual(jasmine.objectContaining({ link_token: 'a-link-token', external_user_id: 'user-1' }));
        });
    });

    describe('unlinkAccountAsync', function () {
        it('sends the unlink request for the user', async function () {
            httpClient.setResponse('unlink', { body: { success: true } });

            await handler.unlinkAccountAsync('user-1');

            const [sent] = httpClient.requestsTo('unlink');
            const sentBody = JSON.parse(sent.body);
            expect(sentBody).toEqual(jasmine.objectContaining({ external_user_id: 'user-1', integration: 'karabast' }));
        });
    });
});
