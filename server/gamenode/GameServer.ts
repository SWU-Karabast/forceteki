import axios, { all } from 'axios';
import fs from 'fs';
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
                res.status(200).json({ success: true });
            } else {
                res.status(400).json({ success: false });
            }
        });
        app.get('/api/available-lobbies', (_, res) => {
            const availableLobbies = Array.from(this.lobbiesWithOpenSeat().entries()).map(([id, _]) => ({
                id,
                name: `Game #${id}`,
            }));
            res.json(availableLobbies);
        });
        app.post('/api/join-lobby', (req, res) => {
            const { lobbyId, userId } = req.body;

            const lobby = this.lobbies.get(lobbyId);
            if (!lobby) {
                return res.status(404).json({ success: false, message: 'Lobby not found' });
            }

            if (lobby.isLobbyFilled()) {
                return res.status(400).json({ success: false, message: 'Lobby is full' });
            }
            // Add the user to the lobby
            this.userLobbyMap.set(userId, lobby.id);
            return res.status(200).json({ success: true });
        });
    }

    private lobbiesWithOpenSeat() {
        return new Map(
            Array.from(this.lobbies.entries()).filter(([_, lobby]) => !lobby.isLobbyFilled())
        );
    }

    private createLobby(user: string, deck: any) {
        const lobby = new Lobby();
        this.lobbies.set(lobby.id, lobby);
        // Using default user for now
        // set the user
        lobby.createLobbyUser('Order66', deck);
        this.userLobbyMap.set('Order66', lobby.id);
        this.userLobbyMap.set('ThisIsTheWay', lobby.id);
        lobby.setTokens();
        return true;
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

    // public gameWon(game: Game, reason: string, winner: Player): void {
    // const saveState = game.getSaveState();
    // // this.zmqSocket.send('GAMEWIN', { game: saveState, winner: winner.name, reason: reason });

    // void axios
    //     .post(
    //         `https://l5r-analytics-engine-production.up.railway.app/api/game-report/${env.environment}`,
    //         saveState
    //     )
    //     .catch(() => {});
    // }

    // TODO: Once we have lobbies this will take in game details. Not sure if we end up doing that through L5R's PendingGame or not.
    // public onStartGame(): void {
    //     const game = new Game(defaultGameSettings, { router: this, shortCardData: this.shortCardData });
    //     this.games.set(defaultGameSettings.id, game);


    //     game.started = true;
    //     // for (const player of Object.values<Player>(pendingGame.players)) {
    //     //     game.selectDeck(player.name, player.deck);
    //     // }
    //     game.selectDeck('Order66', defaultGameSettings.players[0].deck);
    //     game.selectDeck('ThisIsTheWay', defaultGameSettings.players[1].deck);

    //     game.initialise();
    // }

    // onSpectator(pendingGame: PendingGame, user) {
    //     const game = this.games.get(pendingGame.id);
    //     if (!game) {
    //         return;
    //     }

    //     game.watch('TBA', user);

    //     this.sendGameState(game);
    // }

    // onGameSync(callback) {
    //     const gameSummaries = [];
    //     for (const game of this.games.values()) {
    //         const retGame = game.getSummary();
    //         if (retGame) {
    //             retGame.password = game.password;
    //         }
    //         return gameSummaries.push(retGame);
    //     }

    //     logger.info('syncing', gameSummaries.length, ' games');

    //     callback(gameSummaries);
    // }

    // onFailedConnect(gameId, username) {
    //     const game = this.findGameForUser(username);
    //     if (!game || game.id !== gameId) {
    //         return;
    //     }

    //     game.failedConnect(username);

    //     if (game.isEmpty()) {
    //         this.games.delete(game.id);
    //         // this.zmqSocket.send('GAMECLOSED', { game: game.id });
    //     }

    //     this.sendGameState(game);
    // }

    // public onCloseGame(gameId) {
    //     const game = this.games.get(gameId);
    //     if (!game) {
    //         return;
    //     }

    //     this.games.delete(gameId);
    //     // this.zmqSocket.send('GAMECLOSED', { game: game.id });
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

        if (!this.userLobbyMap.has(user.username)) {
            logger.info('No lobby for', ioSocket.request.user.username, 'disconnecting');
            ioSocket.disconnect();
            return;
        }
        const lobbyId = this.userLobbyMap.get(user.username);
        const lobby = this.lobbies.get(lobbyId);
        const socket = new Socket(ioSocket);
        lobby.addLobbyUser(user.username, socket);
        socket.on('disconnect', (_, reason) => this.onSocketDisconnected(user.username, reason));

        // const player = game.playersAndSpectators[socket.user.username];
        // if (!player) {
        //     return;
        // }

        // player.id = socket.id;
        // if (player.disconnected) {
        //     logger.info(`user ${socket.user.username} reconnected to game`);
        //     game.reconnect(socket, player.name);
        // }


        // player.socket = socket;

        // if (!game.isSpectator(player)) {
        //     game.addMessage('{0} has connected to the game server', player);
        // }
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

        // logger.info(`user ${socket.user.username} disconnected from a game: ${reason}`);

        // const isSpectator = game.isSpectator(game.playersAndSpectators[socket.user.username]);

        // game.disconnect(socket.user.username);

        // if (game.isEmpty()) {
        //     this.games.delete(game.id);

        //     // this.zmqSocket.send('GAMECLOSED', { game: game.id });
        // } else if (isSpectator) {
        //     // this.zmqSocket.send('PLAYERLEFT', {
        //     //     gameId: game.id,
        //     //     game: game.getSaveState(),
        //     //     player: socket.user.username,
        //     //     spectator: true
        //     // });
        // }

        // this.sendGameState(game);
    }

    // public onLeaveGame(socket) {
    //     const game = this.findGameForUser(socket.user.username);
    //     if (!game) {
    //         return;
    //     }

    //     const isSpectator = game.isSpectator(game.playersAndSpectators[socket.user.username]);

    //     game.leave(socket.user.username);

    //     // this.zmqSocket.send('PLAYERLEFT', {
    //     //     gameId: game.id,
    //     //     game: game.getSaveState(),
    //     //     player: socket.user.username,
    //     //     spectator: isSpectator
    //     // });

    //     socket.send('cleargamestate');
    //     socket.leaveChannel(game.id);

    //     // if (game.isEmpty()) {
    //     //     this.games.delete(game.id);

    //     //     // this.zmqSocket.send('GAMECLOSED', { game: game.id });
    //     // }

    //     this.sendGameState(game);
    // }
}