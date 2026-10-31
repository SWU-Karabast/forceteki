import { ModActionType, ModerationType } from '../../../../../server/services/DynamoDBInterfaces';
import type { IUserProfileDataEntity } from '../../../../../server/services/DynamoDBInterfaces';
import { premierBestOfOne } from '../../../../helpers/server/MatchConfigs';
import type { ITestClientOptions, TestClient } from '../../../../helpers/server/TestClient';
import { serverIntegration } from '../../../../helpers/server/ServerIntegrationHelper';
import type { ServerTestHarness } from '../../../../helpers/server/ServerTestHarness';

/** A logged-in player the way the real client presents itself after its first sync: with a profile of its own. */
const loggedIn: ITestClientOptions = { authenticated: true };

const threeDaysMs = 3 * 24 * 60 * 60 * 1000;

function legacyMute(): IUserProfileDataEntity['moderation'] {
    return {
        moderationType: ModerationType.Mute,
        daysRemaining: 3,
        endDate: new Date(Date.now() + threeDaysMs).toISOString(),
        hasSeen: true,
    };
}

/**
 * A logged-in player whose account has `profile` stored in the database and who signs in the way the real
 * client does on its first request of a session, so the server derives the profile from storage. Mutes and
 * chat preferences belong to the account, so they are seeded there rather than on the client.
 */
function accountWith(harness: ServerTestHarness, profile: Partial<IUserProfileDataEntity>): ITestClientOptions {
    return { authenticated: true, auth: 'token-only', account: harness.db.seedAccount({ profile }) };
}

const legacyMuted = (harness: ServerTestHarness) => accountWith(harness, { moderation: legacyMute() });
const chatDisabledInPreferences = (harness: ServerTestHarness) => accountWith(harness, { preferences: { gameOptions: { muteChat: true } } });

/**
 * The client hides the lobby and game chat inputs whenever its rules (`getChatDisabledInfo` in `Chat`
 * and `ChatDrawer`) say chat is off; these check the server applies the same rules to messages sent anyway.
 */
describe('Chat permissions', function () {
    function containsText(value: unknown, text: string): boolean {
        return JSON.stringify(value ?? null).includes(text);
    }

    function lobbyChatContains(client: TestClient, text: string): boolean {
        return containsText(client.lobbyState?.gameChat?.messages, text);
    }

    function gameChatContains(client: TestClient, text: string): boolean {
        return containsText(client.receivedEvents('gamestate').map((e) => e.args[0]?.newMessages), text);
    }

    async function setUpLobbyAsync(
        harness: ServerTestHarness,
        ownerOptions: ITestClientOptions,
        joinerOptions: ITestClientOptions,
        isPrivate = false
    ): Promise<{ owner: TestClient; joiner: TestClient }> {
        const owner = harness.createClient(ownerOptions);
        const joiner = harness.createClient(joinerOptions);

        await owner.createLobbyAsync({ lobbyName: harness.uniqueLobbyName(), deck: harness.decklists.validDecklist(), isPrivate, ...premierBestOfOne });
        await owner.connectAsync();
        const lobbyId = owner.lobbyId;

        if (isPrivate) {
            await joiner.connectAsync({ lobbyId });
        } else {
            expect((await joiner.joinLobbyAsync(lobbyId)).status).toBe(200);
            await joiner.connectAsync();
        }

        return { owner, joiner };
    }

    serverIntegration(function (contextRef) {
        describe('in a public lobby', function () {
            it('delivers a message between two logged-in users', async function () {
                const { owner, joiner } = await setUpLobbyAsync(contextRef.harness, loggedIn, loggedIn);

                await owner.sendLobbyMessageAsync('sendChatMessage', 'hello there');

                expect(lobbyChatContains(joiner, 'hello there')).toBeTrue();
            });

            it('drops a message from an anonymous user', async function () {
                const { owner, joiner } = await setUpLobbyAsync(contextRef.harness, {}, loggedIn);

                await owner.sendLobbyMessageAsync('sendChatMessage', 'hello there');

                expect(lobbyChatContains(joiner, 'hello there')).toBeFalse();
            });

            it('drops a message sent to an anonymous opponent', async function () {
                const { owner, joiner } = await setUpLobbyAsync(contextRef.harness, loggedIn, {});

                await owner.sendLobbyMessageAsync('sendChatMessage', 'hello there');

                expect(lobbyChatContains(joiner, 'hello there')).toBeFalse();
            });

            it('drops a message from a user muted by legacy moderation', async function () {
                const { harness } = contextRef;
                const { owner, joiner } = await setUpLobbyAsync(harness, legacyMuted(harness), loggedIn);

                await owner.sendLobbyMessageAsync('sendChatMessage', 'hello there');

                expect(lobbyChatContains(joiner, 'hello there')).toBeFalse();
            });

            it('drops a message from a user muted by a moderator action, and flags their chat as disabled', async function () {
                const { harness } = contextRef;
                const { owner, joiner } = await setUpLobbyAsync(harness, accountWith(harness, {}), loggedIn);
                await harness.server.modActionService.onActionSubmitted(owner.id, ModActionType.Mute, 'moderator-id', 'Moderator', 'spamming', 3);

                await owner.sendLobbyMessageAsync('sendChatMessage', 'hello there');

                expect(lobbyChatContains(joiner, 'hello there')).toBeFalse();
                expect(joiner.lobbyState.users.find((u: any) => u.id === owner.id).chatDisabled).toBeTrue();
            });

            it('drops a message from a user who disabled chat in their preferences', async function () {
                const { harness } = contextRef;
                const { owner, joiner } = await setUpLobbyAsync(harness, chatDisabledInPreferences(harness), loggedIn);

                await owner.sendLobbyMessageAsync('sendChatMessage', 'hello there');

                expect(lobbyChatContains(joiner, 'hello there')).toBeFalse();
            });

            it('drops a message sent to an opponent who disabled chat in their preferences', async function () {
                const { harness } = contextRef;
                const { owner, joiner } = await setUpLobbyAsync(harness, loggedIn, chatDisabledInPreferences(harness));

                await owner.sendLobbyMessageAsync('sendChatMessage', 'hello there');

                expect(lobbyChatContains(joiner, 'hello there')).toBeFalse();
            });

            it('drops messages in both directions once a user mutes the lobby chat', async function () {
                const { owner, joiner } = await setUpLobbyAsync(contextRef.harness, loggedIn, loggedIn);

                await joiner.sendLobbyMessageAsync('muteChat');
                await owner.sendLobbyMessageAsync('sendChatMessage', 'from the owner');
                await joiner.sendLobbyMessageAsync('sendChatMessage', 'from the joiner');

                expect(lobbyChatContains(owner, 'from the owner')).toBeFalse();
                expect(lobbyChatContains(owner, 'from the joiner')).toBeFalse();
            });

            it('ignores a typing state that is not a boolean', async function () {
                const { owner, joiner } = await setUpLobbyAsync(contextRef.harness, loggedIn, loggedIn);

                await owner.sendLobbyMessageAsync('typingState', { payload: 'not a boolean' });
                expect(containsText(joiner.lobbyState.gameChat.typingState, 'not a boolean')).toBeFalse();

                await owner.sendLobbyMessageAsync('typingState', true);
                expect(joiner.lobbyState.gameChat.typingState[owner.id]).toBeTrue();
            });

            it('ignores the typing indicator from a user who cannot chat', async function () {
                const { owner, joiner } = await setUpLobbyAsync(contextRef.harness, {}, loggedIn);

                await owner.sendLobbyMessageAsync('typingState', true);

                expect(joiner.lobbyState.gameChat.typingState[owner.id]).toBeUndefined();
            });
        });

        describe('in a private lobby', function () {
            it('delivers a message from an anonymous user', async function () {
                const { owner, joiner } = await setUpLobbyAsync(contextRef.harness, {}, {}, true);

                await owner.sendLobbyMessageAsync('sendChatMessage', 'hello there');

                expect(lobbyChatContains(joiner, 'hello there')).toBeTrue();
            });

            it('still drops a message from a user who disabled chat in their preferences', async function () {
                const { harness } = contextRef;
                const { owner, joiner } = await setUpLobbyAsync(harness, chatDisabledInPreferences(harness), loggedIn, true);

                await owner.sendLobbyMessageAsync('sendChatMessage', 'hello there');

                expect(lobbyChatContains(joiner, 'hello there')).toBeFalse();
            });
        });

        describe('in a game', function () {
            it('delivers a message between two logged-in players', async function () {
                const { first: sender, second: opponent } = await contextRef.harness.startQuickGameAsync(loggedIn, loggedIn);

                await sender.sendGameMessageAsync('chat', 'good luck');

                expect(gameChatContains(opponent, 'good luck')).toBeTrue();
            });

            it('drops a message from an anonymous player', async function () {
                const { first: sender, second: opponent } = await contextRef.harness.startQuickGameAsync({}, loggedIn);

                await sender.sendGameMessageAsync('chat', 'good luck');

                expect(gameChatContains(opponent, 'good luck')).toBeFalse();
            });

            it('drops a message that is not a string', async function () {
                const { first: sender, second: opponent } = await contextRef.harness.startQuickGameAsync(loggedIn, loggedIn);

                await sender.sendGameMessageAsync('chat', { message: [{ type: 'playerChat', id: opponent.id, name: 'IMPERSONATED' }, 'x'] });
                await sender.sendGameMessageAsync('chat', 'good luck');

                expect(gameChatContains(opponent, 'IMPERSONATED')).toBeFalse();
                expect(gameChatContains(opponent, 'good luck')).toBeTrue();
            });
        });
    }, { database: true });

    describe('when anonymous chat is enabled for local development', function () {
        serverIntegration(function (contextRef) {
            it('delivers a message from an anonymous user in a public lobby', async function () {
                const { owner, joiner } = await setUpLobbyAsync(contextRef.harness, {}, loggedIn);

                await owner.sendLobbyMessageAsync('sendChatMessage', 'hello there');

                expect(lobbyChatContains(joiner, 'hello there')).toBeTrue();
            });
        }, { config: { allowAnonymousChat: true } });
    });
});
