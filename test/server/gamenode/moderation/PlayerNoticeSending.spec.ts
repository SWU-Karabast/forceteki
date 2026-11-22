import { ModActionType, PlayerNoticeKind } from '../../../../server/services/DynamoDBInterfaces';
import { MaxPlayerNoticeLength } from '../../../../server/services/DynamoDBInterfaceSchemas';
import { seedRoleHolders } from '../../../helpers/server/RoleHolders';
import { serverIntegration } from '../../../helpers/server/ServerIntegrationHelper';

/**
 * A moderator writing to a player with a Warning (`POST /api/mod/submit-action` with a `playerMessage`). The player
 * sees the message at their next sign-in; the note stays internal, and the mod tools show whether they have read it.
 */
describe('Sending a player a notice with a Warning', function () {
    const roles = seedRoleHolders();

    serverIntegration(function (contextRef) {
        it('reaches the player at their next sign-in, and the mod tools show when they read it', async function () {
            const { harness } = contextRef;
            const moderator = harness.createAccountClient(roles.accounts.moderator);
            const player = harness.createAccountClient();
            const sentAt = harness.clock.currentDate().toISOString();

            const response = await moderator.requestAsync('post', '/api/mod/submit-action', {
                playerId: player.id,
                actionType: ModActionType.Warning,
                note: 'Insulted opponent, second time this month',
                playerMessage: '  Please keep the chat friendly.  ',
            });
            const atSignIn = await player.requestAsync('post', '/api/get-user');
            const notice = atSignIn.body.user.notices[0];
            await player.requestAsync('post', `/api/notices/${notice.id}/seen`);
            const history = await moderator.requestAsync('post', '/api/mod/find-user', { searchQuery: player.id });

            expect(response.status).toBe(200);
            expect(response.body.success).toBeTrue();
            expect(atSignIn.body.user.notices).toEqual([{
                id: jasmine.any(String),
                kind: PlayerNoticeKind.Warning,
                message: 'Please keep the chat friendly.',
                createdAt: sentAt,
            }]);
            expect(history.body.notices).toEqual([jasmine.objectContaining({
                id: notice.id,
                senderId: roles.accounts.moderator.id,
                senderUsername: 'moderatorUser',
                seenAt: sentAt,
                relatedModActionId: harness.db.actionsOfType(ModActionType.Warning)[0].id,
            })]);
        });

        it('sends nothing to the player when the message is left blank', async function () {
            const { harness } = contextRef;
            const moderator = harness.createAccountClient(roles.accounts.moderator);
            const player = harness.createAccountClient();

            const response = await moderator.requestAsync('post', '/api/mod/submit-action', {
                playerId: player.id, actionType: ModActionType.Warning, note: 'Borderline, noted only', playerMessage: '   ',
            });

            expect(response.status).toBe(200);
            expect(harness.db.actionsOfType(ModActionType.Warning).length).toBe(1);
            expect(harness.db.noticesOf(player.id)).toEqual([]);
        });

        it('refuses an overlong message, and records neither the warning nor the notice', async function () {
            const { harness } = contextRef;
            const moderator = harness.createAccountClient(roles.accounts.moderator);
            const player = harness.createAccountClient();

            const response = await moderator.requestAsync('post', '/api/mod/submit-action', {
                playerId: player.id, actionType: ModActionType.Warning, note: 'spam', playerMessage: 'x'.repeat(MaxPlayerNoticeLength + 1),
            });

            expect(response.status).toBe(400);
            expect(harness.db.actionsOfType(ModActionType.Warning)).toEqual([]);
            expect(harness.db.noticesOf(player.id)).toEqual([]);
        });

        it('refuses a message with an action that cannot carry one', async function () {
            const { harness } = contextRef;
            const moderator = harness.createAccountClient(roles.accounts.moderator);
            const player = harness.createAccountClient();

            const response = await moderator.requestAsync('post', '/api/mod/submit-action', {
                playerId: player.id, actionType: ModActionType.Mute, durationDays: 1, note: 'spam', playerMessage: 'You are muted.',
            });

            expect(response.status).toBe(400);
            expect(harness.db.actionsOfType(ModActionType.Mute)).toEqual([]);
            expect(harness.db.noticesOf(player.id)).toEqual([]);
        });
    }, { database: roles.seed });
});
