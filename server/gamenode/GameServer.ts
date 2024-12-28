import axios, { all } from 'axios';
import fs from 'fs';
import path from 'path';
import http from 'http';
import https from 'https';
import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import socketio from 'socket.io';

import { logger } from '../logger';

import { Lobby } from './Lobby';
import Socket from '../socket';
import * as env from '../env';

export class GameServer {
    private lobbies = new Map<string, Lobby>();
    private userLobbyMap = new Map<string, string>();

    private protocol = 'https';
    private host = env.gameNodeHost;
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

        if (!this.userLobbyMap.has(user.id)) {
            logger.info('No lobby for', ioSocket.request.user.username, 'disconnecting');
            ioSocket.disconnect();
            return;
        }
        const lobbyId = this.userLobbyMap.get(user.id);
        const lobby = this.lobbies.get(lobbyId);
        const socket = new Socket(ioSocket);
        lobby.addLobbyUser(user, socket);
        socket.on('disconnect', (_, reason) => this.onSocketDisconnected(user.id, reason));
    }

    public onSocketDisconnected(id: string, reason: string) {
        if (!this.userLobbyMap.has(id)) {
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