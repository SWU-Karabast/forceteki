import './GameServerTestEnv';
import type Socket from '../../../server/socket';
import { CardPool, GamesToWinMode, SwuGameFormat } from '../../../server/game/core/Constants';
import { GameServer } from '../../../server/gamenode/GameServer';
import { Lobby } from '../../../server/gamenode/Lobby';

interface TestParticipant {
    id: string;
    username: string;
    state: 'connected' | 'disconnected';
    ready: boolean;
    reportedBugs: number;
    socket: Pick<Socket, 'send' | 'removeEventsListeners' | 'registerEvent' | 'eventContainsListener'>;
}

function createParticipant(id: string): TestParticipant {
    return {
        id,
        username: id,
        state: 'connected',
        ready: false,
        reportedBugs: 0,
        socket: {
            send: jasmine.createSpy('send'),
            removeEventsListeners: jasmine.createSpy('removeEventsListeners'),
            registerEvent: jasmine.createSpy('registerEvent'),
            eventContainsListener: jasmine.createSpy('eventContainsListener').and.returnValue(false)
        }
    };
}

function createLobby(users: TestParticipant[] = [], spectators: TestParticipant[] = []): Lobby {
    const lobby = Object.create(Lobby.prototype) as Lobby;
    Object.defineProperty(lobby, '_id', {
        value: 'lobby-1',
        writable: true
    });
    lobby.users = [...users] as unknown as Lobby['users'];
    lobby.spectators = [...spectators] as unknown as Lobby['spectators'];
    lobby.cleanLobby = jasmine.createSpy('cleanLobby');
    lobby.removeUser = jasmine.createSpy('removeUser').and.callFake((userId: string) => {
        lobby.users = lobby.users.filter((user) => user.id !== userId);
    });
    lobby.removeSpectator = jasmine.createSpy('removeSpectator').and.callFake((userId: string) => {
        lobby.spectators = lobby.spectators.filter((spectator) => spectator.id !== userId);
    });
    lobby.setUserDisconnected = jasmine.createSpy('setUserDisconnected');
    lobby.isDisconnected = jasmine.createSpy('isDisconnected').and.returnValue(true);
    lobby.handleMatchmakingDisconnect = jasmine.createSpy('handleMatchmakingDisconnect');

    return lobby;
}

function createServer(): GameServer {
    const server = Object.create(GameServer.prototype) as GameServer;
    Object.defineProperty(server, 'lobbies', {
        value: new Map<string, Lobby>(),
        writable: true
    });
    Object.defineProperty(server, 'userLobbyMap', {
        value: new Map<string, { lobbyId: string; role: string }>(),
        writable: true
    });
    Object.defineProperty(server, 'playerMatchmakingDisconnectedTime', {
        value: new Map<string, Date>(),
        writable: true
    });
    Object.defineProperty(server, 'queue', {
        value: {
            addPlayer: jasmine.createSpy('addPlayer'),
            disconnectPlayer: jasmine.createSpy('disconnectPlayer'),
            isConnected: jasmine.createSpy('isConnected').and.returnValue(false),
            removePlayer: jasmine.createSpy('removePlayer')
        },
        writable: true
    });

    return server;
}

function setLobbyMapping(server: GameServer, userId: string, lobbyId: string, role: string): void {
    // Bypass typescript's private modifier to set up the test scenario
    const userLobbyMap = server['userLobbyMap'] as unknown as Map<string, { lobbyId: string; role: string }>;
    userLobbyMap.set(userId, { lobbyId, role });
}

describe('GameServer spectator cleanup', function() {
    it('removes spectator mappings and listeners when a lobby is removed', function() {
        const server = createServer();
        const player = createParticipant('player-1');
        const spectator = createParticipant('spectator-1');
        const lobby = createLobby([player], [spectator]);

        server['lobbies'].set(lobby.id, lobby);
        setLobbyMapping(server, player.id, lobby.id, 'player');
        setLobbyMapping(server, spectator.id, lobby.id, 'spectator');

        server.removeLobby(lobby, 'Lobby timed out');

        expect(server['lobbies'].has(lobby.id)).toBeFalse();
        expect(server['userLobbyMap'].has(player.id)).toBeFalse();
        expect(server['userLobbyMap'].has(spectator.id)).toBeFalse();
        expect(player.socket.send).toHaveBeenCalledWith('connection_error', 'Lobby timed out');
        expect(spectator.socket.send).toHaveBeenCalledWith('connection_error', 'Lobby timed out');
        expect(player.socket.removeEventsListeners).toHaveBeenCalledWith(['game', 'lobby', 'disconnect']);
        expect(spectator.socket.removeEventsListeners).toHaveBeenCalledWith(['lobby', 'disconnect']);
        expect(lobby.cleanLobby).toHaveBeenCalled();
    });

    it('removes a disconnected spectator without tearing down an active player lobby', function() {
        const server = createServer();
        const player = createParticipant('player-1');
        const spectator = createParticipant('spectator-1');
        const lobby = createLobby([player], [spectator]);

        server['lobbies'].set(lobby.id, lobby);
        setLobbyMapping(server, player.id, lobby.id, 'player');
        setLobbyMapping(server, spectator.id, lobby.id, 'spectator');

        server['removeUserMaybeCleanupLobby'](lobby, spectator.id);

        expect(lobby.removeSpectator).toHaveBeenCalledWith(spectator.id);
        expect(lobby.removeUser).not.toHaveBeenCalled();
        expect(server['userLobbyMap'].has(spectator.id)).toBeFalse();
        expect(server['userLobbyMap'].has(player.id)).toBeTrue();
        expect(server['lobbies'].has(lobby.id)).toBeTrue();
        expect(spectator.socket.removeEventsListeners).toHaveBeenCalledWith(['lobby', 'disconnect']);
        expect(spectator.socket.send).not.toHaveBeenCalled();
        expect(lobby.cleanLobby).not.toHaveBeenCalled();
    });

    it('removes the lobby when the last remaining participant is a spectator', function() {
        const server = createServer();
        const spectator = createParticipant('spectator-1');
        const lobby = createLobby([], [spectator]);

        server['lobbies'].set(lobby.id, lobby);
        setLobbyMapping(server, spectator.id, lobby.id, 'spectator');

        server['removeUserMaybeCleanupLobby'](lobby, spectator.id);

        expect(lobby.removeSpectator).toHaveBeenCalledWith(spectator.id);
        expect(server['userLobbyMap'].has(spectator.id)).toBeFalse();
        expect(server['lobbies'].has(lobby.id)).toBeFalse();
        expect(lobby.cleanLobby).toHaveBeenCalled();
    });

    it('keeps isEmpty player-only while hasNoParticipants includes spectators', function() {
        const lobby = Object.create(Lobby.prototype) as Lobby;
        lobby.users = [] as Lobby['users'];
        lobby.spectators = [createParticipant('spectator-1')] as unknown as Lobby['spectators'];

        expect(lobby.isEmpty()).toBeTrue();
        expect(lobby.hasNoParticipants()).toBeFalse();

        lobby.spectators = [] as Lobby['spectators'];

        expect(lobby.hasNoParticipants()).toBeTrue();
    });

    it('removes matchmaking player mappings after disconnect timeout', function() {
        jasmine.clock().install();

        try {
            const server = createServer();
            const player = createParticipant('player-1');
            const lobby = createLobby([player], []);
            const socket = {
                id: 'socket-1',
                data: {}
            };

            server['lobbies'].set(lobby.id, lobby);
            setLobbyMapping(server, player.id, lobby.id, 'player');

            server.onSocketDisconnected(socket as never, player.id, 1, true);
            jasmine.clock().tick(1000);

            expect(server['userLobbyMap'].has(player.id)).toBeFalse();
            expect(server['playerMatchmakingDisconnectedTime'].has(player.id)).toBeTrue();
            expect(lobby.removeUser).toHaveBeenCalledWith(player.id);
            expect(lobby.handleMatchmakingDisconnect).toHaveBeenCalled();
            expect(player.socket.removeEventsListeners).toHaveBeenCalledWith(['game', 'lobby', 'disconnect']);
        } finally {
            jasmine.clock().uninstall();
        }
    });

    it('re-registers queue disconnect handling when a player requeues', function() {
        const server = createServer();
        const player = createParticipant('player-1');
        const lobby = createLobby([player], []);
        const socket = player.socket;
        const deck = {
            metadata: {
                name: 'Test Deck',
                author: 'Spec'
            }
        };
        const format = {
            format: SwuGameFormat.Premier,
            cardPool: CardPool.Current,
            gamesToWinMode: GamesToWinMode.BestOfOne
        };
        const user = {
            getId: () => player.id
        };

        server['lobbies'].set(lobby.id, lobby);
        setLobbyMapping(server, player.id, lobby.id, 'player');
        server['matchmakeAllQueuesAsync'] = jasmine.createSpy('matchmakeAllQueuesAsync');

        server.requeueUser(socket as never, format, user as never, deck);

        expect(server['queue'].addPlayer).toHaveBeenCalledWith(
            format,
            jasmine.objectContaining({ user, deck, socket })
        );
        expect(socket.eventContainsListener).toHaveBeenCalledWith('disconnect');
        expect(socket.registerEvent).toHaveBeenCalled();
        const registerEventSpy = socket.registerEvent as jasmine.Spy;
        expect(registerEventSpy.calls.mostRecent().args[0]).toBe('disconnect');
        expect(server['matchmakeAllQueuesAsync']).toHaveBeenCalled();
    });
});
