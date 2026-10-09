import { io as connectClient, type Socket as ClientSocket } from 'socket.io-client';
import jwt from 'jsonwebtoken';

import { CardPool, GamesToWinMode, SwuGameFormat } from '../../../server/game/core/Constants';
import { testNextAuthSecret } from '../../helpers/server/ServerTestEnv';
import { ServerTestHarness } from '../../helpers/server/ServerTestHarness';

/**
 * Guards the fake in-process transport (`FakeIoSocket` / `TestClient`) against drift from real
 * socket.io behaviour, by driving the *same* bound `TestGameServer` with a real `socket.io-client`
 * instead. `TestGameServer` already binds a real loopback port for `supertest`, so the socket.io
 * server attached to that same port is genuinely reachable - these tests use that rather than adding
 * a second real server.
 */
describe('socketio drift guard', function () {
    let harness: ServerTestHarness;
    let clientSockets: ClientSocket[];

    beforeEach(async function () {
        harness = await ServerTestHarness.createAsync();
        clientSockets = [];
    });

    afterEach(async function () {
        for (const socket of clientSockets) {
            socket.disconnect();
        }
        await harness.shutdownAsync();
    });

    function connectRealSocket(query: Record<string, string>, auth?: { token: string }): ClientSocket {
        const socket = connectClient(harness.server.baseUrl, {
            path: '/ws',
            // forceNew avoids the client library reusing a cached manager across tests sharing a URL
            forceNew: true,
            transports: ['websocket'],
            query,
            auth,
        });
        clientSockets.push(socket);
        return socket;
    }

    function waitForEvent<T = any>(socket: ClientSocket, event: string, timeoutMs = 2000): Promise<T> {
        return new Promise((resolve, reject) => {
            const timer = setTimeout(() => reject(new Error(`Timed out waiting for '${event}'`)), timeoutMs);
            socket.once(event, (payload: T) => {
                clearTimeout(timer);
                resolve(payload);
            });
        });
    }

    it('reaches lobbystate over a real connection after creating a public lobby', async function () {
        const owner = harness.createClient();
        const lobbyName = harness.uniqueLobbyName();

        const created = await owner.createLobbyAsync({
            lobbyName,
            deck: harness.decklists.validDecklist(),
            format: SwuGameFormat.Premier,
            cardPool: CardPool.Current,
            gamesToWinMode: GamesToWinMode.BestOfOne,
        });
        expect(created.status).toBe(200);

        const realSocket = connectRealSocket({
            user: JSON.stringify(owner.userPayload()),
            lobby: JSON.stringify({ lobbyId: null }),
            spectator: 'false',
        });

        const lobbyState = await waitForEvent(realSocket, 'lobbystate');
        expect(lobbyState.lobbyName).toBe(lobbyName);
    });

    it('rejects a connection whose JWT fails verification', async function () {
        const invalidToken = jwt.sign({ userId: 'someone' }, 'a-completely-wrong-secret');

        const realSocket = connectRealSocket(
            {
                user: JSON.stringify({ id: 'someone', username: 'Someone', authenticated: true }),
                lobby: JSON.stringify({ lobbyId: null }),
                spectator: 'false',
            },
            { token: invalidToken }
        );

        const error = await waitForEvent<Error>(realSocket, 'connect_error');
        expect(error.message).toBe('Authentication error');
    });

    it('accepts a connection with a JWT signed by the real secret', async function () {
        const token = jwt.sign({ userId: 'jwt-user' }, testNextAuthSecret);

        const realSocket = connectRealSocket(
            {
                user: JSON.stringify({ id: 'jwt-user', username: 'JwtUser', authenticated: true, showWelcomeMessage: false }),
                lobby: JSON.stringify({ lobbyId: null }),
                spectator: 'false',
            },
            { token }
        );

        // this user is not in a lobby or queue, so the server's "should not get here" branch applies -
        // the connection succeeds past authentication and is then cleanly rejected at the app level,
        // which only happens for a socket that made it past `io.use`
        const error = await waitForEvent<string>(realSocket, 'connection_error');
        expect(error).toBe('Connection error, please try again');
    });
});
