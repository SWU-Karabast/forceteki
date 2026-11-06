import { ModActionType } from '../../../../../server/services/DynamoDBInterfaces';
import type { IUserProfileDataEntity } from '../../../../../server/services/DynamoDBInterfaces';
import type { ITestClientOptions } from '../../../../helpers/server/TestClient';
import { serverIntegration } from '../../../../helpers/server/ServerIntegrationHelper';
import type { ServerTestHarness } from '../../../../helpers/server/ServerTestHarness';

/** A logged-in player: an account of its own, which the server finds from the player's session token. */
const loggedIn: ITestClientOptions = { authenticated: true };

/**
 * A logged-in player whose account has `profile` stored in the database. Mutes and chat preferences belong
 * to the account, so they are seeded there rather than sent by the client.
 */
function accountWith(harness: ServerTestHarness, profile: Partial<IUserProfileDataEntity>): ITestClientOptions {
    return { authenticated: true, account: harness.db.seedAccount({ profile }) };
}

const chatDisabledInPreferences = (harness: ServerTestHarness) => accountWith(harness, { preferences: { gameOptions: { muteChat: true } } });

/**
 * The client hides the lobby and game chat inputs whenever its rules (`getChatDisabledInfo` in `Chat`
 * and `ChatDrawer`) say chat is off; these check the server applies the same rules to messages sent anyway.
 */
describe('Chat permissions', function () {
    serverIntegration(function (contextRef) {
        describe('in a public lobby', function () {
            it('delivers a message between two logged-in users', async function () {
                const { owner, guest } = await contextRef.harness.createLobbyWithGuestAsync(loggedIn, loggedIn);

                await owner.sendChatMessageAsync('hello there');

                expect(guest.lobbyChatFrom(owner)).toEqual(['hello there']);
            });

            it('drops a message from an anonymous user', async function () {
                const { owner, guest } = await contextRef.harness.createLobbyWithGuestAsync({}, loggedIn);

                await owner.sendChatMessageAsync('hello there');

                expect(guest.lobbyChatFrom(owner)).toEqual([]);
            });

            it('drops a message sent to an anonymous opponent', async function () {
                const { owner, guest } = await contextRef.harness.createLobbyWithGuestAsync(loggedIn, {});

                await owner.sendChatMessageAsync('hello there');

                expect(guest.lobbyChatFrom(owner)).toEqual([]);
            });

            it('drops a message from a user muted by a moderator action, and flags their chat as disabled', async function () {
                const { harness } = contextRef;
                const { owner, guest } = await harness.createLobbyWithGuestAsync(accountWith(harness, {}), loggedIn);
                await harness.server.modActionService.onActionSubmitted(owner.id, ModActionType.Mute, 'moderator-id', 'Moderator', 'spamming', 3);

                await owner.sendChatMessageAsync('hello there');

                expect(guest.lobbyChatFrom(owner)).toEqual([]);
                expect(guest.lobbyState.users.find((u: any) => u.id === owner.id).chatDisabled).toBeTrue();
            });

            it('drops a message from a user who disabled chat in their preferences', async function () {
                const { harness } = contextRef;
                const { owner, guest } = await harness.createLobbyWithGuestAsync(chatDisabledInPreferences(harness), loggedIn);

                await owner.sendChatMessageAsync('hello there');

                expect(guest.lobbyChatFrom(owner)).toEqual([]);
            });

            it('drops a message sent to an opponent who disabled chat in their preferences', async function () {
                const { harness } = contextRef;
                const { owner, guest } = await harness.createLobbyWithGuestAsync(loggedIn, chatDisabledInPreferences(harness));

                await owner.sendChatMessageAsync('hello there');

                expect(guest.lobbyChatFrom(owner)).toEqual([]);
            });

            it('drops messages in both directions once a user mutes the lobby chat', async function () {
                const { owner, guest } = await contextRef.harness.createLobbyWithGuestAsync(loggedIn, loggedIn);

                await guest.muteChatAsync();
                await owner.sendChatMessageAsync('from the owner');
                await guest.sendChatMessageAsync('from the guest');

                expect(owner.lobbyChatFrom(owner)).toEqual([]);
                expect(owner.lobbyChatFrom(guest)).toEqual([]);
            });

            it('ignores a typing state that is not a boolean', async function () {
                const { owner, guest } = await contextRef.harness.createLobbyWithGuestAsync(loggedIn, loggedIn);

                await owner.sendLobbyMessageAsync('typingState', { payload: 'not a boolean' });
                expect(guest.lobbyState.gameChat.typingState[owner.id]).toBeUndefined();

                await owner.typingStateAsync(true);
                expect(guest.lobbyState.gameChat.typingState[owner.id]).toBeTrue();
            });

            it('ignores the typing indicator from a user who cannot chat', async function () {
                const { owner, guest } = await contextRef.harness.createLobbyWithGuestAsync({}, loggedIn);

                await owner.typingStateAsync(true);

                expect(guest.lobbyState.gameChat.typingState[owner.id]).toBeUndefined();
            });
        });

        describe('in a private lobby', function () {
            it('delivers a message from an anonymous user', async function () {
                const { owner, guest } = await contextRef.harness.createLobbyWithGuestAsync({}, {}, { isPrivate: true });

                await owner.sendChatMessageAsync('hello there');

                expect(guest.lobbyChatFrom(owner)).toEqual(['hello there']);
            });

            it('still drops a message from a user who disabled chat in their preferences', async function () {
                const { harness } = contextRef;
                const { owner, guest } = await harness.createLobbyWithGuestAsync(chatDisabledInPreferences(harness), loggedIn, { isPrivate: true });

                await owner.sendChatMessageAsync('hello there');

                expect(guest.lobbyChatFrom(owner)).toEqual([]);
            });
        });

        describe('in a game', function () {
            it('delivers a message between two logged-in players', async function () {
                const { first: sender, second: opponent } = await contextRef.harness.startQuickGameAsync(loggedIn, loggedIn);

                await sender.sendGameChatAsync('good luck');

                expect(opponent.gameChatFrom(sender)).toEqual(['good luck']);
            });

            it('drops a message from an anonymous player', async function () {
                const { first: sender, second: opponent } = await contextRef.harness.startQuickGameAsync({}, loggedIn);

                await sender.sendGameChatAsync('good luck');

                expect(opponent.gameChatFrom(sender)).toEqual([]);
            });

            it('drops a message that is not a string', async function () {
                const { first: sender, second: opponent } = await contextRef.harness.startQuickGameAsync(loggedIn, loggedIn);

                await sender.sendGameMessageAsync('chat', { message: [{ type: 'playerChat', id: opponent.id, name: 'IMPERSONATED' }, 'x'] });
                await sender.sendGameChatAsync('good luck');

                expect(opponent.gameChat.some((entry) => entry.text.includes('IMPERSONATED'))).toBeFalse();
                expect(opponent.gameChatFrom(sender)).toEqual(['good luck']);
            });
        });
    });

    describe('when anonymous chat is enabled for local development', function () {
        serverIntegration(function (contextRef) {
            it('delivers a message from an anonymous user in a public lobby', async function () {
                const { owner, guest } = await contextRef.harness.createLobbyWithGuestAsync({}, loggedIn);

                await owner.sendChatMessageAsync('hello there');

                expect(guest.lobbyChatFrom(owner)).toEqual(['hello there']);
            });
        }, { config: { allowAnonymousChat: true } });
    });
});
