import http from 'http';
import { Server as IoServer } from 'socket.io';
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
describe('Socket transport fidelity (real socket.io-client)', function () {
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

/**
 * Regression-locks a real, non-obvious fact about this repo's exact socket.io version that
 * `FakeIoSocket`'s design depends on: a server emit with an acknowledgement callback only fires that
 * callback if the client's registered listener explicitly invokes the function socket.io injects as
 * its extra trailing argument. A listener that declares fewer parameters - as every real listener in
 * `forceteki-client`'s `Game.context.tsx` does, including its `gamestate` handler - never triggers it.
 *
 * This was confirmed empirically against this exact dependency before `FakeIoSocket` was written, so
 * its "do not auto-ack" default models reality rather than a guess. It means `Lobby.sendGameState`'s
 * ack callback (`() => this.safeSetUserConnected(...)`) never actually fires against the real
 * production client today - see the open findings in the project's design doc.
 *
 * Deliberately independent of `TestGameServer`/`ServerTestHarness`: this is a property of the
 * socket.io library itself, not of anything this project built on top of it.
 */
describe('socket.io acknowledgement semantics (library-level regression lock)', function () {
    let httpServer: http.Server;
    let ioServer: IoServer;
    let clientSocket: ClientSocket;

    async function startServerAsync(): Promise<string> {
        httpServer = http.createServer();
        ioServer = new IoServer(httpServer, { path: '/ws' });

        await new Promise<void>((resolve) => httpServer.listen(0, '127.0.0.1', resolve));
        const address = httpServer.address() as { port: number };
        return `http://127.0.0.1:${address.port}`;
    }

    afterEach(async function () {
        clientSocket?.disconnect();
        ioServer?.close();
        await new Promise<void>((resolve) => (httpServer ? httpServer.close(() => resolve()) : resolve()));
    });

    it('does not fire the ack when the client listener ignores the injected callback', async function () {
        const baseUrl = await startServerAsync();
        let ackFired = false;

        const serverReceivedConnection = new Promise<void>((resolve) => {
            ioServer.on('connection', (socket) => {
                socket.emit('probeEvent', { payload: true }, () => {
                    ackFired = true;
                });
                resolve();
            });
        });

        clientSocket = connectClient(baseUrl, { path: '/ws', transports: ['websocket'] });

        // mirrors the real client: a single-parameter listener, never touching the ack callback
        const clientReceivedEvent = new Promise<void>((resolve) => {
            clientSocket.on('probeEvent', (_payload) => resolve());
        });

        await serverReceivedConnection;
        await clientReceivedEvent;

        // give the (nonexistent) ack every reasonable chance to arrive before asserting its absence
        await new Promise((resolve) => setTimeout(resolve, 100));

        expect(ackFired).toBe(false);
    });

    it('fires the ack when the client listener explicitly invokes the injected callback', async function () {
        const baseUrl = await startServerAsync();
        let ackFired = false;

        const serverReceivedConnection = new Promise<void>((resolve) => {
            ioServer.on('connection', (socket) => {
                socket.emit('probeEvent', { payload: true }, () => {
                    ackFired = true;
                    resolve();
                });
            });
        });

        clientSocket = connectClient(baseUrl, { path: '/ws', transports: ['websocket'] });

        // declares the second, injected parameter and calls it - this is the opt-in shape
        // `FakeIoSocket.ackEvent` models for a test that wants to simulate an acking client
        clientSocket.on('probeEvent', (_payload, ack: () => void) => ack());

        await serverReceivedConnection;

        expect(ackFired).toBe(true);
    });
});
