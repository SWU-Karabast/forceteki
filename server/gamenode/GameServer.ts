import fs from 'fs';
import path from 'path';
import http from 'http';
import https from 'https';
import express from 'express';
import cors from 'cors';
import socketio from 'socket.io';

import { logger } from '../logger';

import { Lobby } from './Lobby';
import Socket from '../socket';
import * as env from '../env';

/**
 * Represents a player waiting in the queue.
 */
interface QueuedPlayer {
    user: any;
    deck: any;
    socket: socketio.Socket | null;
}

export class GameServer {
    private lobbies = new Map<string, Lobby>();
    private userLobbyMap = new Map<string, string>();
    private protocol = 'https';
    private host = env.gameNodeHost;
    private queue: QueuedPlayer[] = [];
    private io: socketio.Server;
    private titleCardData: any;
    private shortCardData: any;

    public constructor() {
        const app = express();
        app.use(express.json());
        let privateKey: undefined | string;
        let certificate: undefined | string;

        try {
            // privateKey = fs.readFileSync(env.gameNodeKeyPath).toString();
            // certificate = fs.readFileSync(env.gameNodeCertPath).toString();
        } catch (e) {
            this.protocol = 'http';
        }

        const server =
            !privateKey || !certificate
                ? http.createServer(app)
                : https.createServer({ key: privateKey, cert: certificate });


        const corsOptions = {
            origin: ['http://localhost:3000', 'https://your-production-domain.com'],
            methods: ['GET', 'POST'],
            credentials: true, // Allow cookies or authorization headers
        };
        app.use(cors(corsOptions));
        this.setupAppRoutes(app);

        server.listen(env.gameNodeSocketIoPort);
        logger.info(`Game server listening on port ${env.gameNodeSocketIoPort}`);

        const corsOrigin = process.env.NODE_ENV === 'production'
            ? 'https://tbd.com'
            : 'http://localhost:3000';

        this.io = new socketio.Server(server, {
            perMessageDeflate: false,
            cors: {
                origin: corsOrigin,
                methods: ['GET', 'POST']
            }
        });

        this.io.on('connection', (socket) => this.onConnection(socket));
    }

    private setupAppRoutes(app: express.Application) {
        app.post('/api/create-lobby', (req, res) => {
            if (this.createLobby(req.body.user, req.body.deck)) {
                return res.status(200).json({ success: true });
            }

            return res.status(400).json({ success: false });
        });
        app.get('/api/available-lobbies', (_, res) => {
            const availableLobbies = Array.from(this.lobbiesWithOpenSeat().entries()).map(([id, _]) => ({
                id,
                name: `Game #${id}`,
            }));
            return res.json(availableLobbies);
        });
        app.post('/api/join-lobby', (req, res) => {
            const { lobbyId, user } = req.body;

            const lobby = this.lobbies.get(lobbyId);
            if (!lobby) {
                return res.status(404).json({ success: false, message: 'Lobby not found' });
            }

            if (lobby.isLobbyFilled()) {
                return res.status(400).json({ success: false, message: 'Lobby is full' });
            }
            // Add the user to the lobby
            this.userLobbyMap.set(user.id, lobby.id);
            return res.status(200).json({ success: true });
        });
        app.get('/api/test-game-setups', (_, res) => {
            const testSetupFilenames = this.getTestSetupGames();
            return res.json(testSetupFilenames);
        });
        app.post('/api/start-test-game', (req, res) => {
            const { filename } = req.body;
            this.startTestGame(filename);
            return res.status(200).json({ success: true });
        });
        app.post('/api/enter-queue', (req, res) => {
            const { user, deck } = req.body;
            const success = this.enterQueue(user, deck, null);
            if (!success) {
                return res.status(400).json({ success: false, message: 'Failed to enter queue' });
            }
            return res.status(200).json({ success: true });
        });
    }

    private lobbiesWithOpenSeat() {
        return new Map(
            Array.from(this.lobbies.entries()).filter(([_, lobby]) => !lobby.isLobbyFilled())
        );
    }

    private createLobby(user: any, deck: any) {
        const lobby = new Lobby();
        this.lobbies.set(lobby.id, lobby);
        lobby.createLobbyUser(user, deck);
        lobby.setLobbyOwner(user.id);
        this.userLobbyMap.set(user.id, lobby.id);
        lobby.setTokens();
        return true;
    }

    private startTestGame(filename: string) {
        const lobby = new Lobby();
        this.lobbies.set(lobby.id, lobby);
        const order66 = { id: 'exe66', username: 'Order66' };
        const theWay = { id: 'th3w4y', username: 'ThisIsTheWay' };
        lobby.createLobbyUser(order66);
        lobby.createLobbyUser(theWay);
        this.userLobbyMap.set(order66.id, lobby.id);
        this.userLobbyMap.set(theWay.id, lobby.id);
        lobby.startTestGame(filename);
    }

    private getTestSetupGames() {
        const testGamesDirPath = path.resolve(__dirname, '../../test/gameSetups');
        if (!fs.existsSync(testGamesDirPath)) {
            return [];
        }

        return fs.readdirSync(testGamesDirPath).filter((file) => {
            const filePath = path.join(testGamesDirPath, file);
            return fs.lstatSync(filePath).isFile();
        });
    }

    // public debugDump() {
    //     const games = [];
    //     for (const game of this.games.values()) {
    //         const players = [];
    //         for (const player of Object.values<any>(game.playersAndSpectators)) {
    //             return {
    //                 name: player.name,
    //                 left: player.left,
    //                 disconnected: player.disconnected,
    //                 id: player.id,
    //                 spectator: game.isSpectator(player)
    //             };
    //         }
    //         games.push({
    //             name: game.name,
    //             players: players,
    //             id: game.id,
    //             started: game.started,
    //             startedAt: game.startedAt
    //         });
    //     }

    //     return {
    //         games: games,
    //         gameCount: this.games.size
    //     };
    // }


    // handshake(socket: socketio.Socket, next: () => void) {
    //     // if (socket.handshake.query.token && socket.handshake.query.token !== 'undefined') {
    //     //     jwt.verify(socket.handshake.query.token, env.secret, function (err, user) {
    //     //         if (err) {
    //     //             logger.info(err);
    //     //             return;
    //     //         }

    //     //         socket.request.user = user;
    //     //     });
    //     // }
    //     next();
    // }

    public onCardData(cardData) {
        this.titleCardData = cardData.titleCardData;
        this.shortCardData = cardData.shortCardData;
    }

    public onConnection(ioSocket) {
        const user = JSON.parse(ioSocket.handshake.query.user);
        if (user) {
            ioSocket.request.user = user;
        }
        if (!ioSocket.request.user) {
            logger.info('socket connected with no user, disconnecting');
            ioSocket.disconnect();
            return;
        }
        if (this.userLobbyMap.has(user.id)) {
            const lobbyId = this.userLobbyMap.get(user.id);
            const lobby = this.lobbies.get(lobbyId);
            if (!lobby) {
                logger.info('No lobby for', ioSocket.request.user.username, 'disconnecting');
                ioSocket.disconnect();
                return;
            }
            const socket = new Socket(ioSocket);
            lobby.addLobbyUser(user, socket);
            socket.on('disconnect', (_, reason) => this.onSocketDisconnected(user.id, reason));
            return;
        }

        // if they are not in the lobby they could be in a queue
        const queuedPlayer = this.queue.find((p) => p.user.id === user.id);
        if (queuedPlayer) {
            queuedPlayer.socket = ioSocket;

            // handle queue-specific events and add lobby disconnect
            ioSocket.on('disconnect', (reason) => {
                this.onSocketDisconnected(user.id, reason);
            });

            this.matchmakeQueuePlayers();
            return;
        }
    }

    /**
     * Put a user into the queue array.
     */
    private enterQueue(user: any, deck: any, socket: socketio.Socket | null): boolean {
        // Quick check: if they're already in a lobby, no queue
        if (this.userLobbyMap.has(user.id)) {
            logger.info(`User ${user.id} already in a lobby, ignoring queue request.`);
            return false;
        }
        // Also check if they're already queued
        if (this.queue.find((q) => q.user.id === user.id)) {
            logger.info(`User ${user.id} is already in queue, rejoining`);
            this.removeFromQueue(user.id);
        }

        this.queue.push({
            user,
            deck,
            socket
        });
        return true;
    }

    /**
     * Matchmake two users in a queue
     */
    private matchmakeQueuePlayers() {
        // Simple approach: if at least 2 in queue, pair them up
        while (this.queue.length >= 2) {
            const p1 = this.queue.shift();
            const p2 = this.queue.shift();
            if (!p1 || !p2) {
                break;
            } // Just in case

            // Create a new Lobby
            const lobby = new Lobby();
            this.lobbies.set(lobby.id, lobby);

            // Create the 2 lobby users
            lobby.createLobbyUser(p1.user, p1.deck);
            lobby.createLobbyUser(p2.user, p2.deck);

            // Attach their sockets to the lobby (if they exist)
            const socket1 = p1.socket ? new Socket(p1.socket) : null;
            const socket2 = p2.socket ? new Socket(p2.socket) : null;
            if (socket1) {
                lobby.addLobbyUser(p1.user, socket1);
                socket1.on('disconnect', (_, reason) => this.onSocketDisconnected(p1.user.id, reason));
            }
            if (socket2) {
                lobby.addLobbyUser(p2.user, socket2);
                socket2.on('disconnect', (_, reason) => this.onSocketDisconnected(p2.user.id, reason));
            }

            // Save user => lobby mapping
            this.userLobbyMap.set(p1.user.id, lobby.id);
            this.userLobbyMap.set(p2.user.id, lobby.id);

            // If needed, set tokens async
            lobby.setTokens();
            lobby.sendLobbyState();
            logger.info(`Matched players ${p1.user.username} and ${p2.user.username} in lobby ${lobby.id}.`);
        }
    }

    /**
     * Remove the user from the queue if they disconnect or otherwise.
     */
    private removeFromQueue(userId: string): void {
        this.queue = this.queue.filter((q) => q.user.id !== userId);
    }

    public onSocketDisconnected(id: string, reason: string) {
        if (!this.userLobbyMap.has(id)) {
            this.removeFromQueue(id);
            return;
        }
        const lobbyId = this.userLobbyMap.get(id);
        const lobby = this.lobbies.get(lobbyId);
        if (reason === 'client namespace disconnect') {
            this.userLobbyMap.delete(id);
            lobby.removeLobbyUser(id);
        } else if (reason === 'ping timeout' || reason === 'transport close') {
            lobby.setUserDisconnected(id);
            setTimeout(() => {
                // Check if the user is still disconnected after the timer
                if (lobby.getUserState(id) === 'disconnected') {
                    this.userLobbyMap.delete(id);
                    lobby.removeLobbyUser(id);
                    // Check if lobby is empty
                    if (lobby.isLobbyEmpty()) {
                        // Start the cleanup process
                        lobby.cleanLobby();
                        this.lobbies.delete(lobbyId);
                    }
                }
            }, 30000);
        }

        // check if lobby is empty
        if (lobby.isLobbyEmpty()) {
            // cleanup process
            lobby.cleanLobby();
            this.lobbies.delete(lobbyId);
        }
    }
}