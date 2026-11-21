import { ModActionType, PlayerNoticeKind } from '../../../../server/services/DynamoDBInterfaces';
import { MaxPlayerNoticeLength } from '../../../../server/services/DynamoDBInterfaceSchemas';
import { seedRoleHolders } from '../../../helpers/server/RoleHolders';
import { serverIntegration } from '../../../helpers/server/ServerIntegrationHelper';

/**
 * A moderator writing to a player: a reply to their bug report (`POST /api/mod/send-notice`), or the message that
 * goes with a Warning. The player sees it at their next sign-in; the mod tools show whether they have read it.
 */
describe('Sending a player a notice', function () {
    const roles = seedRoleHolders();

    serverIntegration(function (contextRef) {
        it('reaches the player at their next sign-in, and the mod tools show when they read it', async function () {
            const { harness } = contextRef;
            const moderator = harness.createAccountClient(roles.accounts.moderator);
            const reporter = harness.createAccountClient();
            const sentAt = harness.clock.currentDate().toISOString();

            const sent = await moderator.requestAsync('post', '/api/mod/send-notice', {
                playerId: reporter.id,
                kind: PlayerNoticeKind.BugReportFixed,
                message: '  Thanks for your report about Darth Vader! This is fixed and will be live in the next update.  ',
            });
            const atSignIn = await reporter.requestAsync('post', '/api/get-user');
            const notice = atSignIn.body.user.notices[0];
            await reporter.requestAsync('post', `/api/notices/${notice.id}/seen`);
            const history = await moderator.requestAsync('post', '/api/mod/find-user', { searchQuery: reporter.id });

            expect(sent.status).toBe(200);
            expect(atSignIn.body.user.notices).toEqual([{
                id: sent.body.notice.id,
                kind: PlayerNoticeKind.BugReportFixed,
                message: 'Thanks for your report about Darth Vader! This is fixed and will be live in the next update.',
                createdAt: sentAt,
            }]);
            expect(history.body.notices).toEqual([jasmine.objectContaining({
                id: notice.id,
                senderId: roles.accounts.moderator.id,
                senderUsername: 'moderatorUser',
                seenAt: sentAt,
            })]);
        });

        it('may only be sent by a moderator', async function () {
            const { harness } = contextRef;
            const developer = harness.createAccountClient(roles.accounts.developer);
            const player = harness.createAccountClient();

            const response = await developer.requestAsync('post', '/api/mod/send-notice', {
                playerId: player.id, kind: PlayerNoticeKind.General, message: 'hello',
            });

            expect(response.status).toBe(403);
            expect(harness.db.noticesOf(player.id)).toEqual([]);
        });

        it('refuses a warning, a blank or overlong message, and an unknown player', async function () {
            const { harness } = contextRef;
            const moderator = harness.createAccountClient(roles.accounts.moderator);
            const player = harness.createAccountClient();
            const send = (body: Record<string, unknown>) => moderator.requestAsync('post', '/api/mod/send-notice', {
                playerId: player.id, kind: PlayerNoticeKind.BugReportNotABug, message: 'Working as intended.', ...body,
            });

            const warning = await send({ kind: PlayerNoticeKind.Warning });
            const blank = await send({ message: '   ' });
            const overlong = await send({ message: 'x'.repeat(MaxPlayerNoticeLength + 1) });
            const unknownPlayer = await send({ playerId: 'no-such-player' });

            expect([warning.status, blank.status, overlong.status, unknownPlayer.status]).toEqual([400, 400, 400, 404]);
            expect(harness.db.noticesOf(player.id)).toEqual([]);
        });

        describe('with a Warning', function () {
            it('sends the message to the player as a notice linked to the warning, and keeps the note internal', async function () {
                const { harness } = contextRef;
                const moderator = harness.createAccountClient(roles.accounts.moderator);
                const player = harness.createAccountClient();

                const response = await moderator.requestAsync('post', '/api/mod/submit-action', {
                    playerId: player.id,
                    actionType: ModActionType.Warning,
                    note: 'Insulted opponent, second time this month',
                    playerMessage: 'Please keep the chat friendly.',
                });
                const atSignIn = await player.requestAsync('post', '/api/get-user');

                expect(response.status).toBe(200);
                expect(response.body.success).toBeTrue();
                expect(atSignIn.body.user.notices).toEqual([jasmine.objectContaining({
                    kind: PlayerNoticeKind.Warning,
                    message: 'Please keep the chat friendly.',
                })]);
                expect(harness.db.noticesOf(player.id)[0].relatedModActionId).toBe(harness.db.actionsOfType(ModActionType.Warning)[0].id);
            });

            it('sends nothing to the player when the message is left blank', async function () {
                const { harness } = contextRef;
                const moderator = harness.createAccountClient(roles.accounts.moderator);
                const player = harness.createAccountClient();

                const response = await moderator.requestAsync('post', '/api/mod/submit-action', {
                    playerId: player.id, actionType: ModActionType.Warning, note: 'Borderline, noted only', playerMessage: '',
                });

                expect(response.status).toBe(200);
                expect(harness.db.actionsOfType(ModActionType.Warning).length).toBe(1);
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
        });
    }, { database: roles.seed });
});
