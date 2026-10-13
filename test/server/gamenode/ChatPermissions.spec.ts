import { CardPool, GamesToWinMode, SwuGameFormat } from '../../../server/game/core/Constants';
import { ModerationType } from '../../../server/services/DynamoDBInterfaces';
import type { ITestClientOptions, TestClient } from '../../helpers/server/TestClient';
import { serverIntegration } from '../../helpers/server/ServerIntegrationHelper';
import type { ServerTestHarness } from '../../helpers/server/ServerTestHarness';

const matchConfig = {
    format: SwuGameFormat.Premier,
    cardPool: CardPool.Current,
    gamesToWinMode: GamesToWinMode.BestOfOne,
};

const loggedIn: ITestClientOptions = { authenticated: true };

const legacyMute: ITestClientOptions = {
    authenticated: true,
    userDataOverrides: {
        moderation: {
            moderationType: ModerationType.Mute,
            daysRemaining: 3,
            endDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
            hasSeen: true,
        },
    },
};

const chatDisabledInPreferences: ITestClientOptions = {
    authenticated: true,
    userDataOverrides: { preferences: { gameOptions: { muteChat: true } } as any },
};

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

        await owner.createLobbyAsync({ lobbyName: harness.uniqueLobbyName(), deck: harness.decklists.validDecklist(), isPrivate, ...matchConfig });
        await owner.connectAsync();
        const lobbyId = new URL(owner.lobbyState.connectionLink).searchParams.get('lobbyId');

        if (isPrivate) {
            await joiner.connectAsync({ lobbyId });
        } else {
            expect((await joiner.joinLobbyAsync(lobbyId)).status).toBe(200);
            await joiner.connectAsync();
        }

        return { owner, joiner };
    }

    /** Both players queue for a quick match and are taken through to a started game. */
    async function setUpGameAsync(
        harness: ServerTestHarness,
        senderOptions: ITestClientOptions,
        opponentOptions: ITestClientOptions
    ): Promise<{ sender: TestClient; opponent: TestClient }> {
        const sender = harness.createClient(senderOptions);
        const opponent = harness.createClient(opponentOptions);

        for (const client of [sender, opponent]) {
            const response = await client.enterQueueAsync({ deck: harness.decklists.validDecklist(), ...matchConfig });
            expect(response.status).withContext(JSON.stringify(response.body))
                .toBe(200);
            await client.connectAsync();
        }

        await harness.clock.advanceAsync(6_000);
        expect(sender.gameState).toBeDefined();

        return { sender, opponent };
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
                const { owner, joiner } = await setUpLobbyAsync(contextRef.harness, legacyMute, loggedIn);

                await owner.sendLobbyMessageAsync('sendChatMessage', 'hello there');

                expect(lobbyChatContains(joiner, 'hello there')).toBeFalse();
            });

            it('drops a message from a user muted by a moderator action, and flags their chat as disabled', async function () {
                const { harness } = contextRef;
                const { owner, joiner } = await setUpLobbyAsync(harness, loggedIn, loggedIn);
                (harness.server as any).modActionService = { isPlayerMuted: (playerId: string) => playerId === owner.id };

                await owner.sendLobbyMessageAsync('sendChatMessage', 'hello there');

                expect(lobbyChatContains(joiner, 'hello there')).toBeFalse();
                expect(joiner.lobbyState.users.find((u: any) => u.id === owner.id).chatDisabled).toBeTrue();
            });

            it('drops a message from a user who disabled chat in their preferences', async function () {
                const { owner, joiner } = await setUpLobbyAsync(contextRef.harness, chatDisabledInPreferences, loggedIn);

                await owner.sendLobbyMessageAsync('sendChatMessage', 'hello there');

                expect(lobbyChatContains(joiner, 'hello there')).toBeFalse();
            });

            it('drops a message sent to an opponent who disabled chat in their preferences', async function () {
                const { owner, joiner } = await setUpLobbyAsync(contextRef.harness, loggedIn, chatDisabledInPreferences);

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
                const { owner, joiner } = await setUpLobbyAsync(contextRef.harness, chatDisabledInPreferences, loggedIn, true);

                await owner.sendLobbyMessageAsync('sendChatMessage', 'hello there');

                expect(lobbyChatContains(joiner, 'hello there')).toBeFalse();
            });
        });

        describe('in a game', function () {
            it('delivers a message between two logged-in players', async function () {
                const { sender, opponent } = await setUpGameAsync(contextRef.harness, loggedIn, loggedIn);

                await sender.sendGameMessageAsync('chat', 'good luck');

                expect(gameChatContains(opponent, 'good luck')).toBeTrue();
            });

            it('drops a message from an anonymous player', async function () {
                const { sender, opponent } = await setUpGameAsync(contextRef.harness, {}, loggedIn);

                await sender.sendGameMessageAsync('chat', 'good luck');

                expect(gameChatContains(opponent, 'good luck')).toBeFalse();
            });
        });
    });

    describe('when anonymous chat is enabled for local development', function () {
        serverIntegration(function (contextRef) {
            it('delivers a message from an anonymous user in a public lobby', async function () {
                const { owner, joiner } = await setUpLobbyAsync(contextRef.harness, {}, loggedIn);

                await owner.sendLobbyMessageAsync('sendChatMessage', 'hello there');

                expect(lobbyChatContains(joiner, 'hello there')).toBeTrue();
            });
        }, { allowAnonymousChat: true });
    });
});
