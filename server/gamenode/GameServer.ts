import fs from 'fs';
import path from 'path';
import http from 'http';
import express from 'express';
import cors from 'cors';
import type { DefaultEventsMap, Socket as IOSocket } from 'socket.io';
import { Server as IOServer } from 'socket.io';

import { logger } from '../logger';

import { Lobby, MatchType } from './Lobby';
import Socket from '../socket';
import * as env from '../env';
import type { Deck } from '../utils/deck/Deck';
import type { CardDataGetter } from '../utils/cardData/CardDataGetter';
import * as Contract from '../game/core/utils/Contract';
import { RemoteCardDataGetter } from '../utils/cardData/RemoteCardDataGetter';
import { DeckValidator } from '../utils/deck/DeckValidator';
import { SwuGameFormat } from '../SwuGameFormat';
import type { ISwuDbDecklist } from '../utils/deck/DeckInterfaces';
import QueueHandler from './QueueHandler';

/**
 * Represents a user object
 */
interface User {
    id: string;
    username: string;
}

/**
 * Represents additional Socket types we can leverage these later.
 */

interface SocketData {
    manualDisconnect?: boolean;
}

/**
 * Represents a player waiting in the queue.
 */
interface QueuedPlayer {
    deck: Deck;
    socket?: Socket;
    user: User;
}

export class GameServer {
    public static async createAsync(): Promise<GameServer> {
        let cardDataGetter: CardDataGetter;
        let testGameBuilder: any = null;

        if (process.env.ENVIRONMENT === 'development') {
            testGameBuilder = this.getTestGameBuilder();

            cardDataGetter = process.env.FORCE_REMOTE_CARD_DATA === 'true'
                ? await GameServer.buildRemoteCardDataGetter()
                : testGameBuilder.cardDataGetter;
        } else {
            cardDataGetter = await GameServer.buildRemoteCardDataGetter();
        }

        return new GameServer(
            cardDataGetter,
            await DeckValidator.createAsync(cardDataGetter),
            testGameBuilder
        );
    }

    private static buildRemoteCardDataGetter(): Promise<RemoteCardDataGetter> {
        // TODO: move this url to a config
        return RemoteCardDataGetter.createAsync('https://karabast-assets.s3.amazonaws.com/data/');
    }

    private static getTestGameBuilder() {
        const testDirPath = path.resolve(__dirname, '../../test');
        const gameStateBuilderPath = path.resolve(__dirname, '../../test/helpers/GameStateBuilder.js');

        Contract.assertTrue(fs.existsSync(testDirPath), `Test data directory not found at ${testDirPath}, please run 'npm run get-cards'`);
        Contract.assertTrue(fs.existsSync(gameStateBuilderPath), `Test tools file not found at ${gameStateBuilderPath}`);

        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const gameStateBuilderClass = require(gameStateBuilderPath);
        return new gameStateBuilderClass();
    }

    private readonly lobbies = new Map<string, Lobby>();
    private readonly userLobbyMap = new Map<string, string>();
    private readonly io: IOServer;
    private readonly cardDataGetter: CardDataGetter;
    private readonly deckValidator: DeckValidator;
    private readonly testGameBuilder?: any;
    private readonly queue: QueueHandler = new QueueHandler();

    private constructor(
        cardDataGetter: CardDataGetter,
        deckValidator: DeckValidator,
        testGameBuilder?: any
    ) {
        const app = express();
        app.use(express.json());
        const server = http.createServer(app);

        const corsOptions = {
            origin: ['http://localhost:3000', 'https://beta.karabast.net'],
            methods: ['GET', 'POST'],
            credentials: true, // Allow cookies or authorization headers
        };
        app.use(cors(corsOptions));

        this.setupAppRoutes(app);

        app.use((err, req, res, next) => {
            logger.error('Error in API route:', err);
            res.status(err.status || 500).json({
                success: false,
                error: err.message || 'Server error.',
            });
        });

        server.listen(env.gameNodeSocketIoPort);
        logger.info(`Game server listening on port ${env.gameNodeSocketIoPort}`);

        // Setup socket server
        this.io = new IOServer(server, {
            perMessageDeflate: false,
            path: '/ws',
            cors: {
                origin: ['http://localhost:3000', 'https://beta.karabast.net'],
                methods: ['GET', 'POST']
            }
        });

        // Currently for IOSockets we can use DefaultEventsMap but later we can customize these.
        this.io.on('connection', async (socket: IOSocket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, SocketData>) => {
            await this.onConnection(socket);
            socket.on('manualDisconnect', () => {
                socket.data.manualDisconnect = true;
                socket.disconnect();
            });
        });

        this.cardDataGetter = cardDataGetter;
        this.testGameBuilder = testGameBuilder;
        this.deckValidator = deckValidator;
    }

    private setupAppRoutes(app: express.Application) {
        app.get('/api/get-unimplemented', (req, res) => {
            return res.json(this.deckValidator.getUnimplementedCards());
        });

        app.get('/api/ongoing-games', (_, res) => {
            return res.json(this.getOngoingGamesData());
        });

        app.post('/api/create-lobby', async (req, res, next) => {
            const { user, deck, format, isPrivate } = req.body;
            // Check if the user is already in a lobby
            const userId = typeof user === 'string' ? user : user.id;
            if (this.userLobbyMap.has(userId)) {
                return res.status(403).json({
                    success: false,
                    message: 'User is already in a lobby'
                });
            }
            try {
                await this.processDeckValidation(deck, format, res, async () => {
                    await this.createLobby(user, deck, format, isPrivate);
                    res.status(200).json({ success: true });
                });
            } catch (err) {
                next(err);
            }
        });

        app.get('/api/available-lobbies', (_, res) => {
            const availableLobbies = Array.from(this.lobbiesWithOpenSeat().entries()).map(([id, lobby]) => ({
                id,
                name: `Game #${id}`,
                format: lobby.format,
            }));
            return res.json(availableLobbies);
        });

        app.post('/api/join-lobby', (req, res) => {
            const { lobbyId, user } = req.body;

            const lobby = this.lobbies.get(lobbyId);
            if (!lobby) {
                return res.status(404).json({ success: false, message: 'Lobby not found' });
            }

            if (lobby.isFilled()) {
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

        app.post('/api/start-test-game', async (req, res, next) => {
            const { filename } = req.body;
            try {
                await this.startTestGame(filename);
                return res.status(200).json({ success: true });
            } catch (err) {
                next(err);
            }
        });

        app.post('/api/enter-queue', async (req, res, next) => {
            const { format, user, deck } = req.body;
            // check if user is already in a lobby
            const userId = typeof user === 'string' ? user : user.id;
            if (this.userLobbyMap.has(userId)) {
                return res.status(403).json({
                    success: false,
                    message: 'User is already in a lobby'
                });
            }
            try {
                await this.processDeckValidation(deck, format, res, () => {
                    const success = this.enterQueue(format, user, deck);
                    if (!success) {
                        return res.status(400).json({ success: false, message: 'Failed to enter queue' });
                    }
                    res.status(200).json({ success: true });
                });
            } catch (err) {
                next(err);
            }
        });

        app.get('/api/health', (_, res) => {
            return res.status(200).json({ success: true });
        });
    }

    // method for validating the deck via API
    private async processDeckValidation(
        deck: ISwuDbDecklist,
        format: SwuGameFormat,
        res: express.Response,
        onValid: () => Promise<void> | void
    ): Promise<void> {
        const validationResults = this.deckValidator.validateSwuDbDeck(deck, format);
        if (Object.keys(validationResults).length > 0) {
            res.status(400).json({
                success: false,
                errors: validationResults,
            });
            return;
        }
        await onValid();
    }

    private getOngoingGamesData() {
        const ongoingGames = [];

        // Loop through all lobbies and check if they have an ongoing game
        for (const lobby of this.lobbies.values()) {
            if (lobby.hasOngoingGame()) {
                const gameState = lobby.getGamePreview();
                if (gameState) {
                    ongoingGames.push(gameState);
                }
            }
        }

        return {
            numberOfOngoingGames: ongoingGames.length,
            ongoingGames
        };
    }

    private lobbiesWithOpenSeat() {
        return new Map(
            Array.from(this.lobbies.entries()).filter(([_, lobby]) =>
                !lobby.isFilled() && !lobby.isPrivate && !lobby.hasOngoingGame()
            )
        );
    }

    /**
     * Creates a new lobby for the given user. If no user is provided and
     * the lobby is private, a default user is created.
     *
     * @param {User | string} user - The user creating the lobby. If string(id) is passed in for a private lobby, a default user is created with that id.
     * @param {Deck} deck - The deck used by this user.
     * @param {boolean} isPrivate - Whether or not this lobby is private.
     * @returns {string} The ID of the user who owns and created the newly created lobby.
     */
    private createLobby(user: User | string, deck: Deck, format: SwuGameFormat, isPrivate: boolean) {
        if (!user) {
            throw new Error('User must be provided to create a lobby');
        }
        if (!isPrivate && typeof user === 'string') {
            throw new Error('User must be provided for public lobbies');
        }

        // set default user if anonymous user is supplied for private lobbies
        if (typeof user === 'string') {
            user = { id: user, username: 'Player1' };
        }


        const lobby = new Lobby(
            isPrivate ? MatchType.Private : MatchType.Custom,
            format,
            this.cardDataGetter,
            this.deckValidator,
            this.testGameBuilder
        );
        this.lobbies.set(lobby.id, lobby);

        lobby.createLobbyUser(user, deck);
        lobby.setLobbyOwner(user.id);
        this.userLobbyMap.set(user.id, lobby.id);
    }

    private async startTestGame(filename: string) {
        const lobby = new Lobby(
            MatchType.Custom,
            SwuGameFormat.Open,
            this.cardDataGetter,
            this.deckValidator,
            this.testGameBuilder
        );
        this.lobbies.set(lobby.id, lobby);
        const order66 = { id: 'exe66', username: 'Order66' };
        const theWay = { id: 'th3w4y', username: 'ThisIsTheWay' };
        lobby.createLobbyUser(order66);
        lobby.createLobbyUser(theWay);
        this.userLobbyMap.set(order66.id, lobby.id);
        this.userLobbyMap.set(theWay.id, lobby.id);
        await lobby.startTestGameAsync(filename);
    }

    private getTestSetupGames() {
        const testGamesDirPath = path.resolve(__dirname, '../../../test/gameSetups');
        if (!fs.existsSync(testGamesDirPath)) {
            return [];
        }

        return fs.readdirSync(testGamesDirPath).filter((file) => {
            const filePath = path.join(testGamesDirPath, file);
            return fs.lstatSync(filePath).isFile();
        });
    }

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

    public async onConnection(ioSocket) {
        const user = JSON.parse(ioSocket.handshake.query.user);
        const requestedLobby = JSON.parse(ioSocket.handshake.query.lobby);

        if (user) {
            ioSocket.data.user = user;
        }

        if (!ioSocket.data.user) {
            logger.info('socket connected with no user, disconnecting');
            ioSocket.disconnect();
            return;
        }


        // 1. If user is already in a lobby
        if (this.userLobbyMap.has(user.id)) {
            const lobbyId = this.userLobbyMap.get(user.id);
            const lobby = this.lobbies.get(lobbyId);
            if (!lobby) {
                logger.info('No lobby for', ioSocket.data.user.username, 'disconnecting');
                ioSocket.disconnect();
                return;
            }

            // we get the user from the lobby since this way we can be sure it's the correct one.
            const socket = new Socket(ioSocket);
            lobby.addLobbyUser(user, socket);
            socket.send('connectedUser', user.id);
            socket.registerEvent('disconnect', () => this.onSocketDisconnected(ioSocket, user.id));
            return;
        }

        // 2. If user connected to the lobby via a link.
        if (requestedLobby.lobbyId) {
            const lobby = this.lobbies.get(requestedLobby.lobbyId);
            if (!lobby) {
                logger.info('No lobby with this link for', ioSocket.data.user.username, 'disconnecting');
                ioSocket.disconnect();
                return;
            }

            // check if the lobby is full
            if (lobby.isFilled() || lobby.hasOngoingGame()) {
                logger.info('Requested lobby', requestedLobby.lobbyId, 'is full or already in game, disconnecting');
                ioSocket.disconnect();
                return;
            }

            const socket = new Socket(ioSocket);

            // anonymous user joining existing game
            if (!user.username) {
                const newUser = { username: 'Player2', id: user.id };
                lobby.addLobbyUser(newUser, socket);
                this.userLobbyMap.set(newUser.id, lobby.id);
                socket.registerEvent('disconnect', () => this.onSocketDisconnected(ioSocket, user.id));
                return;
            }

            lobby.addLobbyUser(user, socket);
            this.userLobbyMap.set(user.id, lobby.id);
            socket.registerEvent('disconnect', () => this.onSocketDisconnected(ioSocket, user.id));
            return;
        }
        // 3. if they are not in the lobby they could be in a queue
        const queuedPlayer = this.queue.findPlayerInQueue(user.id);
        if (queuedPlayer) {
            queuedPlayer.socket = new Socket(ioSocket);

            // handle queue-specific events and add lobby disconnect
            queuedPlayer.socket.registerEvent('disconnect', () => this.onSocketDisconnected(ioSocket, user.id));

            await this.matchmakeAllQueues();
            return;
        }

        // A user should not get here
        ioSocket.emit('connection_error', 'Error connecting to lobby/game');
        ioSocket.disconnect();
        // this can happen when someone tries to reconnect to the game but are out of the mapping TODO make a notification for the player
        logger.info(`Error state when connecting to lobby/game ${user.id} disconnecting`);
    }

    /**
     * Put a user into the queue array. They always start with a null socket.
     */
    private enterQueue(format: SwuGameFormat, user: any, deck: any): boolean {
        // Quick check: if they're already in a lobby, no queue
        if (this.userLobbyMap.has(user.id)) {
            logger.info(`User ${user.id} already in a lobby, ignoring queue request.`);
            return false;
        }
        // Also check if they're already queued
        if (this.queue.findPlayerInQueue(user.id)) {
            logger.info(`User ${user.id} is already in queue, rejoining`);
            this.queue.removePlayer(user.id);
        }
        this.queue.addPlayer(
            format,
            {
                user,
                deck,
                socket: null
            }
        );
        return true;
    }

    private matchmakeAllQueues() {
        const formatsWithMatches = this.queue.findReadyFormats();

        for (const format of formatsWithMatches) {
            while (true) {
                const matchedPlayers = this.queue.getNextMatchPair(format);
                if (!matchedPlayers) {
                    break;
                }

                this.matchmakeQueuePlayers(format, matchedPlayers);
            }
        }
    }

    /**
     * Matchmake two users in a queue
     */
    private matchmakeQueuePlayers(format: SwuGameFormat, [p1, p2]: [QueuedPlayer, QueuedPlayer]): void {
        // Create a new Lobby
        const lobby = new Lobby(
            MatchType.Quick,
            format,
            this.cardDataGetter,
            this.deckValidator,
            this.testGameBuilder
        );
        this.lobbies.set(lobby.id, lobby);

        // Create the 2 lobby users
        lobby.createLobbyUser(p1.user, p1.deck);
        lobby.createLobbyUser(p2.user, p2.deck);

        // Attach their sockets to the lobby (if they exist)
        const socket1 = p1.socket ? p1.socket : null;
        const socket2 = p2.socket ? p2.socket : null;
        if (socket1) {
            lobby.addLobbyUser(p1.user, socket1);
            socket1.registerEvent('disconnect', () => this.onSocketDisconnected(socket1.socket, p1.user.id));
            socket1.registerEvent('requeue', () => this.requeueUser(socket1, format, p1.user, p1.deck));
        }
        if (socket2) {
            lobby.addLobbyUser(p2.user, socket2);
            socket2.registerEvent('disconnect', () => this.onSocketDisconnected(socket2.socket, p2.user.id));
            socket2.registerEvent('requeue', () => this.requeueUser(socket2, format, p2.user, p2.deck));
        }

        // Save user => lobby mapping
        this.userLobbyMap.set(p1.user.id, lobby.id);
        this.userLobbyMap.set(p2.user.id, lobby.id);

        // If needed, set tokens async
        lobby.setLobbyOwner(p1.user.id);
        // this needs to be here since we only send start game via the LobbyOwner.
        lobby.sendLobbyState();
        logger.info(`Matched players ${p1.user.username} and ${p2.user.username} in lobby ${lobby.id}.`);
    }

    /**
     * requeues the user and removes him from the previous lobby. If the lobby is empty, it cleans it up.
     */
    private async requeueUser(socket: Socket, format: SwuGameFormat, user: User, deck: any) {
        if (this.userLobbyMap.has(user.id)) {
            const lobbyId = this.userLobbyMap.get(user.id);
            const lobby = this.lobbies.get(lobbyId);
            this.userLobbyMap.delete(user.id);
            lobby.removeUser(user.id);
            // check if lobby is empty
            if (lobby.isEmpty()) {
                // cleanup process
                lobby.cleanLobby();
                this.lobbies.delete(lobbyId);
            }
        }
        // add user to queue
        this.queue.addPlayer(
            format,
            {
                user,
                deck,
                socket: socket
            }
        );

        // perform matchmaking
        await this.matchmakeAllQueues();
    }

    public onSocketDisconnected(socket: IOSocket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, SocketData>, id: string) {
        if (!this.userLobbyMap.has(id)) {
            this.queue.removePlayer(id);
            return;
        }
        const lobbyId = this.userLobbyMap.get(id);
        const lobby = this.lobbies.get(lobbyId);
        const wasManualDisconnect = !!socket?.data?.manualDisconnect;
        if (wasManualDisconnect) {
            this.userLobbyMap.delete(id);
            lobby.removeUser(id);

            // check if lobby is empty
            if (lobby.isEmpty()) {
                // cleanup process
                lobby.cleanLobby();
                this.lobbies.delete(lobbyId);
            }
            return;
        }
        // TODO perhaps add a timeout for lobbies so they clean themselves up if somehow they become empty
        //  without triggering onSocketDisconnect
        lobby.setUserDisconnected(id);
        setTimeout(() => {
            // Check if the user is still disconnected after the timer
            if (lobby.getUserState(id) === 'disconnected') {
                this.userLobbyMap.delete(id);
                lobby.removeUser(id);
                // Check if lobby is empty
                if (lobby.isEmpty()) {
                    // Start the cleanup process
                    lobby.cleanLobby();
                    this.lobbies.delete(lobbyId);
                }
            }
        }, 20000);
    }
}
