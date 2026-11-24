import { v4 as uuid } from 'uuid';
import type { IPlayerNoticeEntity } from '../../../../server/services/DynamoDBInterfaces';
import { PlayerNoticeKind } from '../../../../server/services/DynamoDBInterfaces';
import { PlayerNoticeService } from '../../../../server/utils/PlayerNoticeService';
import { mintSessionToken, sessionCookie, signInClaims } from '../../../helpers/server/AuthTokens';
import { serverIntegration } from '../../../helpers/server/ServerIntegrationHelper';
import type { ServerTestHarness } from '../../../helpers/server/ServerTestHarness';

/**
 * A player's side of the notices the moderators send them: they arrive with the session sync at sign-in
 * (`POST /api/get-user`) until the player acknowledges each one.
 */
describe('Player notices at sign-in', function () {
    function seedNotice(harness: ServerTestHarness, playerId: string, overrides: Partial<IPlayerNoticeEntity> = {}): IPlayerNoticeEntity {
        const notice: IPlayerNoticeEntity = {
            id: uuid(),
            playerId,
            kind: PlayerNoticeKind.Warning,
            message: 'Please keep the chat friendly.',
            senderId: 'moderator-id',
            senderUsername: 'Moderator',
            createdAt: '2026-11-01T00:00:00.000Z',
            ...overrides,
        };
        harness.db.seedPlayerNotice(notice);
        return notice;
    }

    const asSent = ({ id, kind, message, createdAt }: IPlayerNoticeEntity) => ({ id, kind, message, createdAt });

    serverIntegration(function (contextRef) {
        it('sends the notices the player has not acknowledged, oldest first, without who sent them', async function () {
            const { harness } = contextRef;
            const player = harness.createAccountClient();
            const newer = seedNotice(harness, player.id, { message: 'Please do not stall the game.', createdAt: '2026-11-02T00:00:00.000Z' });
            const older = seedNotice(harness, player.id, { createdAt: '2026-11-01T00:00:00.000Z' });
            seedNotice(harness, player.id, { createdAt: '2026-10-01T00:00:00.000Z', seenAt: '2026-10-02T00:00:00.000Z' });

            const response = await player.requestAsync('post', '/api/get-user');

            expect(response.body.user.notices).toEqual([asSent(older), asSent(newer)]);
        });

        it('stops sending a notice once the player acknowledges it, and keeps the first acknowledgement', async function () {
            const { harness } = contextRef;
            const player = harness.createAccountClient();
            const notice = seedNotice(harness, player.id);

            const acknowledgedAt = harness.clock.currentDate().toISOString();
            const acknowledged = await player.requestAsync('post', `/api/notices/${notice.id}/seen`);
            await harness.clock.advanceAsync(60 * 1000);
            const acknowledgedAgain = await player.requestAsync('post', `/api/notices/${notice.id}/seen`);

            expect(acknowledged.status).toBe(200);
            expect(acknowledgedAgain.status).toBe(200);
            // read from the database: what the player is sent only depends on whether it is set
            expect(harness.db.noticesOf(player.id)[0].seenAt).toBe(acknowledgedAt);
            expect((await player.requestAsync('post', '/api/get-user')).body.user.notices).toEqual([]);
        });

        it(`sends at most ${PlayerNoticeService.MaxDeliveredNotices} at once, and the rest once those are acknowledged`, async function () {
            const { harness } = contextRef;
            const player = harness.createAccountClient();
            const notices = Array.from({ length: PlayerNoticeService.MaxDeliveredNotices + 1 }, (_, day) =>
                seedNotice(harness, player.id, { createdAt: new Date(Date.UTC(2026, 10, day + 1)).toISOString() }));

            const first = await player.requestAsync('post', '/api/get-user');
            for (const notice of first.body.user.notices) {
                await player.requestAsync('post', `/api/notices/${notice.id}/seen`);
            }
            const second = await player.requestAsync('post', '/api/get-user');

            expect(first.body.user.notices).toEqual(notices.slice(0, PlayerNoticeService.MaxDeliveredNotices).map(asSent));
            expect(second.body.user.notices).toEqual([asSent(notices[PlayerNoticeService.MaxDeliveredNotices])]);
        });

        it('does not let a player acknowledge another player\'s notice', async function () {
            const { harness } = contextRef;
            const owner = harness.createAccountClient();
            const other = harness.createAccountClient();
            const notice = seedNotice(harness, owner.id);

            const response = await other.requestAsync('post', `/api/notices/${notice.id}/seen`);

            expect(response.status).toBe(404);
            expect((await owner.requestAsync('post', '/api/get-user')).body.user.notices).toEqual([asSent(notice)]);
        });

        it('refuses a notice id that is not one', async function () {
            const player = contextRef.harness.createAccountClient();

            const response = await player.requestAsync('post', '/api/notices/not-a-notice/seen');

            expect(response.status).toBe(400);
        });

        it('sends an anonymous player no notices', async function () {
            const anonymous = contextRef.harness.createClient();

            const response = await anonymous.requestAsync('post', '/api/get-user');

            expect(response.status).toBe(200);
            expect(response.body.user.notices).toEqual([]);
        });
    });
});

describe('Player notices without DynamoDB', function () {
    serverIntegration(function (contextRef) {
        it('sends a signed-in dev user no notices', async function () {
            const cookie = sessionCookie(mintSessionToken(signInClaims({
                provider: 'dev-user', providerId: 'order66', username: 'Order66', email: 'order66@local.karabast',
            })));

            const response = await contextRef.harness.api.post('/api/get-user').set('Cookie', cookie)
                .send({});

            expect(response.status).toBe(200);
            expect(response.body.user.notices).toEqual([]);
        });
    }, { database: false });
});
