import fs from 'fs';
import path from 'path';
import http from 'http';
import express from 'express';
import cors from 'cors';
import type { DefaultEventsMap, Socket as IOSocket } from 'socket.io';
import { Server as IOServer } from 'socket.io';
import { constants as zlibConstants } from 'zlib';
import { getHeapStatistics } from 'v8';
import { freemem, cpus } from 'os';
import { monitorEventLoopDelay, performance, PerformanceObserver, constants as NodePerfConstants, type EventLoopUtilization, type IntervalHistogram } from 'perf_hooks';

import { logger, jsonOnlyLogger } from '../logger';

import { Lobby, MatchType } from './Lobby';
import Socket from '../socket';
import type { User } from '../utils/user/User';
import * as env from '../env';
import type { Deck } from '../utils/deck/Deck';
import type { CardDataGetter } from '../utils/cardData/CardDataGetter';
import * as Contract from '../game/core/utils/Contract';
import { RemoteCardDataGetter } from '../utils/cardData/RemoteCardDataGetter';
import { DeckValidator } from '../utils/deck/DeckValidator';
import { SwuGameFormat } from '../SwuGameFormat';
import type { ISwuDbDecklist } from '../utils/deck/DeckInterfaces';
import type { QueuedPlayer } from './QueueHandler';
import { QueueHandler } from './QueueHandler';
import * as Helpers from '../game/core/utils/Helpers';
import { authMiddleware } from '../middleware/AuthMiddleWare';
import { UserFactory } from '../utils/user/UserFactory';
import { DeckService } from '../utils/deck/DeckService';
import { usernameContainsProfanity } from '../utils/profanityFilter/ProfanityFilter';
import { SwuStatsHandler } from '../utils/SWUStats/SwuStatsHandler';
import { GameServerMetrics } from '../utils/GameServerMetrics';
import { requireEnvVars } from '../env';
import * as EnumHelpers from '../game/core/utils/EnumHelpers';

/**
 * Represents additional Socket types we can leverage these later.
 */

interface SocketData {
    manualDisconnect?: boolean;
    forceDisconnect?: boolean;
    user?: User;
}

enum UserRole {
    Player = 'player',
    Spectator = 'spectator'
}

interface ILobbyMapping {
    lobbyId: string;
    role: UserRole;
}
export interface ISwuStatsToken {
    accessToken: string;
    refreshToken: string;
    creationDateTime: Date;
    timeToLiveSeconds: number;
}

// Interface for GC performance entries using the modern 'detail' property
interface GCPerformanceEntry {
    name: string;
    entryType: string;
    startTime: number;
    duration: number;
    detail: {
        kind: number; // 1 = Scavenge (minor GC), other values = Mark-Sweep (major GC)
    };
}

export class GameServer {
    public static async createAsync(): Promise<GameServer> {
        let cardDataGetter: CardDataGetter;
        let testGameBuilder: any = null;

        console.log('SETUP: Initiating server start.');
        console.log('SETUP: Retrieving card data.');
        if (process.env.ENVIRONMENT === 'development') {
            testGameBuilder = this.getTestGameBuilder();

            cardDataGetter = process.env.FORCE_REMOTE_CARD_DATA === 'true'
                ? await GameServer.buildRemoteCardDataGetter()
                : testGameBuilder.cardDataGetter;
        } else {
            cardDataGetter = await GameServer.buildRemoteCardDataGetter();
        }

        // downloads all card data to build deck validator
        const deckValidator = await DeckValidator.createAsync(cardDataGetter);

        console.log('SETUP: Card data downloaded.');
        // increase stack trace limit for better error logging
        Error.stackTraceLimit = 50;

        return new GameServer(
            cardDataGetter,
            deckValidator,
            testGameBuilder
        );
    }

    private static buildRemoteCardDataGetter(): Promise<RemoteCardDataGetter> {
        // TODO: move this url to a config
        return RemoteCardDataGetter.createAsync('https://karabast-data.s3.amazonaws.com/data/');
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
    private readonly playerMatchmakingDisconnectedTime = new Map<string, Date>();
    private readonly userLobbyMap = new Map<string, ILobbyMapping>();
    public swuStatsTokenMapping = new Map<string, ISwuStatsToken>();
    private readonly io: IOServer;
    private readonly cardDataGetter: CardDataGetter;
    private readonly deckValidator: DeckValidator;
    private readonly testGameBuilder?: any;
    private readonly queue: QueueHandler = new QueueHandler();
    private lastCpuUsage: NodeJS.CpuUsage;
    private lastCpuUsageTime: bigint;
    private loopDelayHistogram: IntervalHistogram;
    private lastLoopUtilization: EventLoopUtilization;
    private gcStats = {
        totalDuration: 0,
        scavengeCount: 0,
        scavengeDuration: 0,
        maxScavengeDuration: 0,
        markSweepCount: 0,
        markSweepDuration: 0,
        maxMarkSweepDuration: 0,
        incrementalCount: 0,
        incrementalDuration: 0,
        maxIncrementalDuration: 0,
        weakCallbackCount: 0,
        weakCallbackDuration: 0,
        maxWeakCallbackDuration: 0,
        intervalStartTime: 0
    };

    private readonly userFactory: UserFactory = new UserFactory();
    public readonly deckService: DeckService = new DeckService();
    public readonly swuStatsHandler: SwuStatsHandler;
    private readonly tokenCleanupInterval: NodeJS.Timeout;

    private constructor(
        cardDataGetter: CardDataGetter,
        deckValidator: DeckValidator,
        testGameBuilder?: any
    ) {
        const app = express();
        app.use(express.json());
        const server = http.createServer(app);

        const corsOptions = {
            origin: env.corsOrigins,
            methods: ['GET', 'POST', 'PUT', 'DELETE'],
            credentials: true, // Allow cookies or authorization headers
        };
        app.use(cors(corsOptions));

        app.use((req, res, next) => {
            const start = process.hrtime.bigint();

            res.on('finish', () => {
                const end = process.hrtime.bigint();
                const durationMs = Number(end - start) / 1e6;

                if (durationMs > 100) {
                    logger.info('[GameServer] API request took more than 100ms', {
                        method: req.method,
                        path: req.originalUrl.split('?')[0],
                        status: res.statusCode,
                        durationMs: Number(durationMs.toFixed(2)),
                        timestamp: new Date().toISOString()
                    });
                }
            });

            next();
        });

        this.setupAppRoutes(app);
        app.use((err, req, res, next) => {
            logger.error('GameServer: Error in API route:', err);
            res.status(err.status || 500).json({
                success: false,
                error: err.message || 'Server error.',
            });
        });


        server.listen(env.gameNodeSocketIoPort);
        logger.info(`GameServer: listening on port ${env.gameNodeSocketIoPort}`);
        logger.info(`GameServer: Detected ${cpus().length} logical CPU cores.`);

        // check if NEXTAUTH variable is set
        requireEnvVars(
            ['INTRASERVICE_SECRET'],
            'GameServer',
            ['NEXTAUTH_SECRET']
        );

        // TOKEN CLEANUP
        this.tokenCleanupInterval = setInterval(() => {
            this.cleanupInvalidTokens();
        }, 3600000); // 1 hour

        // Setup socket server
        this.io = new IOServer(server, {
            perMessageDeflate: {
                level: zlibConstants.Z_BEST_SPEED
            },
            path: '/ws',
            cors: {
                origin: env.corsOrigins,
                methods: ['GET', 'POST']
            }
        });

        // Setup Socket.IO middleware for Next-auth token verification
        this.io.use(async (socket, next) => {
            try {
                // Get token from handshake auth
                const token = socket.handshake.auth.token;
                let user;

                // Case 1: Token is present - attempt authenticated user flow
                if (token) {
                    const queryUser = socket.handshake.query.user;
                    if (queryUser) {
                        // Parse user data from query parameter
                        const userData = typeof queryUser === 'string'
                            ? JSON.parse(queryUser)
                            : queryUser;

                        // If client sent pre-authenticated user data, use it directly
                        if (userData.authenticated) {
                            user = this.userFactory.verifyTokenAndCreateAuthenticatedUser(token, userData);
                        } else {
                            // User data exists but not marked as authenticated
                            // Verify with token instead
                            user = await this.userFactory.createUserFromTokenAsync(token);
                        }
                    } else {
                        // No user data in query, authenticate using token only
                        user = await this.userFactory.createUserFromTokenAsync(token);
                    }
                // Case 2: No token - create anonymous user
                } else {
                    user = this.userFactory.createAnonymousUserFromQuery(socket.handshake.query);
                }
                // we check if we have an actual user
                if (user.isAnonymousUser() || user.isAuthenticatedUser()) {
                    socket.data.user = user;
                    return next();
                }
                logger.error('Socket connection rejected: Error when creating user, no valid authentication provided');
                return next(new Error('Authentication failed'));
            } catch (error) {
                logger.error('Socket auth middleware error:', error);
                next(new Error('Authentication error'));
            }
        });
        // Currently for IOSockets we can use DefaultEventsMap but later we can customize these.
        this.io.on('connection', async (socket: IOSocket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, SocketData>) => {
            try {
                await this.onConnectionAsync(socket);
                socket.on('manualDisconnect', () => {
                    try {
                        socket.data.manualDisconnect = true;
                        socket.disconnect();
                    } catch (err) {
                        logger.error('GameServer: Error in manualDisconnect:', err);
                    }
                });
            } catch (err) {
                logger.error('GameServer: Error in socket connection:', err);
            }
        });

        this.cardDataGetter = cardDataGetter;
        this.testGameBuilder = testGameBuilder;
        this.deckValidator = deckValidator;
        this.swuStatsHandler = new SwuStatsHandler(this.userFactory);
        // set up queue heartbeat once a second
        setInterval(() => this.queue.sendHeartbeat(), 500);

        if (process.env.ENVIRONMENT !== 'development' || process.env.FORCE_ENABLE_STATS_LOGGING === 'true') {
            // initialize cpu usage and event loop stats
            this.lastCpuUsage = process.cpuUsage();
            this.lastCpuUsageTime = process.hrtime.bigint();
            this.loopDelayHistogram = monitorEventLoopDelay({ resolution: 10 });
            this.loopDelayHistogram.enable();
            this.lastLoopUtilization = performance.eventLoopUtilization();

            // initialize GC monitoring
            this.setupGCMonitoring();

            // log initial memory state on startup
            this.logHeapStats();

            // set up periodic memory, cpu and event loop monitoring for every 30 seconds
            setInterval(() => {
                this.logHeapStats();
                this.logCpuUsage();
                this.logEventLoopStats();
                this.logPlayerStats();
                this.logGCStats();
            }, 30000);
        }
    }

    private setupAppRoutes(app: express.Application) {
        app.get('/api/get-unimplemented', (req, res, next) => {
            try {
                return res.json(this.deckValidator.getUnimplementedCards());
            } catch (err) {
                logger.error('GameServer (get-unimplemented) Server error: ', err);
                next(err);
            }
        });

        app.post('/api/spectate-game', (req, res, next) => {
            try {
                const { gameId, user } = req.body;
                const lobby = this.lobbies.get(gameId);
                // if they are in a game already we give them 403 forbidden
                if (!this.canUserJoinNewLobby(user.id)) {
                    logger.error(`GameServer (spectate-game): User ${user.id} attempted to spectate a game while playing a game`);
                    return res.status(403).json({
                        success: false,
                        message: 'User is already in a game'
                    });
                }
                if (!lobby || !lobby.hasOngoingGame() || lobby.isPrivate) {
                    logger.error(`GameServer (spectate-game): User ${user.id} attempted to spectate a game that does not exist or is set to private`);
                    return res.status(404).json({
                        success: false,
                        message: 'Game not found or does not allow spectators'
                    });
                }

                // Register this user as a spectator for the game
                this.userLobbyMap.set(user.id, { lobbyId: lobby.id, role: UserRole.Spectator });
                return res.status(200).json({ success: true });
            } catch (err) {
                logger.error('GameServer (spectate-game) Server error: ', err);
                next(err);
            }
        });

        // *** Start of User Object calls ***

        app.post('/api/get-user', authMiddleware('get-user'), (req, res, next) => {
            try {
                // const { decks, preferences } = req.body;
                const user = req.user as User;
                // We try to sync the decks first
                // if (decks.length > 0) {
                //     try {
                //         await this.deckService.syncDecksAsync(user.getId(), decks);
                //     } catch (err) {
                //         logger.error(`GameServer (get-user): Error with syncing decks for User ${user.getId()}`, err);
                //         next(err);
                //     }
                // }
                // if (preferences) {
                //     try {
                //         user.setPreferences(await this.userFactory.updateUserPreferencesAsync(user.getId(), preferences));
                //     } catch (err) {
                //         logger.error(`GameServer (get-user): Error with syncing Preferences for User ${user.getId()}`, err);
                //     }
                // }
                return res.status(200).json({ success: true, user: {
                    id: user.getId(),
                    username: user.getUsername(),
                    showWelcomeMessage: user.getShowWelcomeMessage(),
                    preferences: user.getPreferences(),
                    needsUsernameChange: user.needsUsernameChange(),
                    swuStatsRefreshToken: user.getSwuStatsRefreshToken(),
                    moderation: user.getModeration(),
                } });
            } catch (err) {
                logger.error('GameServer (get-user) Server error:', err);
                next(err);
            }
        });

        app.post('/api/toggle-welcome-message', authMiddleware(), async (req, res, next) => {
            try {
                const user = req.user as User;
                // Check if user is authenticated (not an anonymous user)
                if (user.isAnonymousUser()) {
                    logger.error(`GameServer (toogle-welcome-message): Anonymous user ${user.getId()} is attempting to retrieve toggle-welcome-message`);
                    return res.status(401).json({
                        success: false,
                        message: 'Authentication required to retrieve toggle-welcome-message info'
                    });
                }
                const result = await this.userFactory.setWelcomeMessageStatus(user.getId());
                return res.status(200).json({
                    succeess: result,
                });
            } catch (err) {
                logger.error('GameServer (toggle-welcome-message) Server Error: ', err);
                next(err);
            }
        });

        app.post('/api/get-change-username-info', authMiddleware(), async (req, res, next) => {
            try {
                const user = req.user as User;
                // Check if user is authenticated (not an anonymous user)
                if (user.isAnonymousUser()) {
                    logger.error(`GameServer (change-username): Anonymous user ${user.getId()} is attempting to retrieve canchangeUsername info`);
                    return res.status(401).json({
                        success: false,
                        message: 'Authentication required to retrieve canchangeUsername info'
                    });
                }
                const result = await this.userFactory.canChangeUsernameAsync(user.getId());
                return res.status(200).json({
                    succeess: true,
                    result: result,
                });
            } catch (err) {
                logger.error('GameServer (get-change-username-info) Server Error: ', err);
                next(err);
            }
        });

        app.post('/api/change-username', authMiddleware(), async (req, res, next) => {
            try {
                const { newUsername } = req.body;
                const user = req.user as User;

                // Check if user is authenticated (not an anonymous user)
                if (user.isAnonymousUser()) {
                    logger.error(`GameServer (change-username): Anonymous user ${user.getId()} is attempting to change username`);
                    return res.status(401).json({
                        success: false,
                        message: 'Authentication required to change username'
                    });
                }

                // Validate the new username
                if (!newUsername || typeof newUsername !== 'string') {
                    logger.error(`GameServer (change-username): User ${user.getId()} submitted a invalid username ${newUsername}`);
                    return res.status(400).json({
                        success: false,
                        message: 'Username invalid'
                    });
                }

                // Check for profanity
                if (usernameContainsProfanity(newUsername)) {
                    logger.warn(`GameServer (change-username): User ${user.getId()} attempted to use a username containing profanity: ${newUsername}`);
                    return res.status(400).json({
                        success: false,
                        message: 'Username contains inappropriate words'
                    });
                }

                // Call the changeUsername method
                const result = await this.userFactory.changeUsernameAsync(user.getId(), newUsername);
                if (result.success) {
                    return res.status(200).json({
                        succeess: true,
                        message: 'Username successfully changed',
                        username: result.username
                    });
                }
                return res.status(403).json({
                    succeess: result.success,
                    message: result.message,
                });
            } catch (err) {
                logger.error('GameServer (change-username) Server Error: ', err);
                next(err);
            }
        });

        app.post('/api/set-moderation-seen', authMiddleware(), async (req, res, next) => {
            try {
                const user = req.user as User;

                // Check if user is authenticated (not an anonymous user)
                if (user.isAnonymousUser()) {
                    logger.error(`GameServer (set-moderation-seen): Anonymous user ${user.getId()} attempted to set moderation seen`, { userId: user.getId() });
                    return res.status(403).json({
                        success: false,
                        message: 'Authentication required to set moderation seen'
                    });
                }

                const result = await this.userFactory.setModerationSeenAsync(user.getId());

                return res.status(200).json({
                    success: result,
                    message: 'Moderation status updated'
                });
            } catch (err) {
                logger.error('GameServer (set-moderation-seen) Server Error: ', err);
                next(err);
            }
        });

        // SWUSTATS
        // This endpoint is being called by the FE server and not the client which is why we are authenticating the server.
        app.post('/api/link-swustats', async (req, res, next) => {
            try {
                const { userId, swuStatsToken, internalApiKey } = req.body;
                if (process.env.ENVIRONMENT === 'development' && !process.env.INTRASERVICE_SECRET) {
                    throw new Error('Environment variable INTRASERVICE_SECRET not set');
                }
                if (internalApiKey !== process.env.INTRASERVICE_SECRET) {
                    return res.status(403).json({
                        success: false,
                        message: 'Forbidden'
                    });
                }
                // We test the refresh token if it correctly returns a new access token.
                const newRefreshToken = await this.swuStatsHandler.refreshTokensAsync(swuStatsToken.refreshToken);
                await this.userFactory.addSwuStatsRefreshTokenAsync(userId, newRefreshToken.refreshToken);
                // add token mapping
                this.swuStatsTokenMapping.set(userId, newRefreshToken);
                return res.status(200).json({
                    success: true,
                    message: 'SWUStats linked successfully'
                });
            } catch (err) {
                logger.error('GameServer (link-swustats) Server error:', err);
                next(err);
            }
        });

        app.post('/api/unlink-swustats', authMiddleware(), async (req, res, next) => {
            try {
                const user = req.user as User;
                if (user.isAnonymousUser()) {
                    logger.error(`GameServer (unlink-swustats): Anonymous user ${user.getId()} attempted to change swustats setting in dynamodb`);
                    return res.status(403).json({
                        success: false,
                        message: 'Error attempting to unlink swu-stats'
                    });
                }
                await this.userFactory.unlinkSwuStatsAsync(user.getId());
                this.swuStatsTokenMapping.delete(user.getId());
                return res.status(200).json({
                    success: true,
                    message: 'SWUStats unlinked successfully'
                });
            } catch (err) {
                logger.error('GameServer (unlink-swustats) Server error:', err);
                next(err);
            }
        });

        app.put('/api/user/:userId/preferences', authMiddleware('PUT-preferences'), async (req, res, next) => {
            try {
                const { preferences } = req.body;
                const { userId } = req.params;
                const user = req.user as User;
                if (user.isAnonymousUser()) {
                    logger.error(`GameServer (PUT-preferences): Anonymous user ${user.getId()} attempted to save sound preferences to dynamodb`);
                    return res.status(401).json({
                        success: false,
                        message: 'Error attempting to save preferences'
                    });
                }
                await this.userFactory.updateUserPreferencesAsync(userId, preferences);
                return res.status(200).json({
                    success: true,
                    message: 'Preferences saved successfully',
                });
            } catch (err) {
                logger.error('GameServer (PUT-preferences) Server error:', err);
                next(err);
            }
        });
        // *** End of User Object calls ***

        // user DECKS
        app.post('/api/get-decks', authMiddleware('get-decks'), async (req, res, next) => {
            try {
                const user = req.user as User;
                if (user.isAnonymousUser()) {
                    logger.error(`GameServer (get-decks): Authentication error for anonymous user ${user.getId()}`);
                    return res.status(403).json({
                        success: false,
                        message: 'Server error'
                    });
                }
                // we retrieve the decks for the FE
                try {
                    const usersDecks = await this.deckService.getUserDecksAsync(user.getId());
                    return res.status(200).json(usersDecks);
                } catch (err) {
                    logger.error(`GameServer (get-decks): Error in getting a users ${user.getId()} decks: `, err);
                    next(err);
                }
            } catch (err) {
                logger.error('GameServer (get-decks) Server error: ', err);
                next(err);
            }
        });

        // Add this to the setupAppRoutes method in GameServer.ts
        app.post('/api/get-deck/:deckId', authMiddleware(), async (req, res, next) => {
            try {
                const { deckId } = req.params;
                const user = req.user;

                if (!user || user.isAnonymousUser()) {
                    logger.error(`GameServer (get-deck/:deckId): Authentication error for user ${user} with id ${user.getId()}`);
                    return res.status(401).json({
                        success: false,
                        message: 'Authentication error'
                    });
                }

                if (!deckId) {
                    logger.error(`GameServer (get-deck/:deckId): User ${user.getId()} attempted to get deck with invalid deckId: ${deckId}`);
                    return res.status(400).json({
                        success: false,
                        message: 'Server error'
                    });
                }

                // Get the deck using the flexible lookup method
                const deck = await this.deckService.getDeckByIdAsync(user.getId(), deckId);
                if (!deck) {
                    logger.error(`GameServer (get-deck/:deckId): User ${user.getId()} attempted to get deck that does not exist: ${deckId}`);
                    return res.status(404).json({
                        success: false,
                        message: 'Server error'
                    });
                }
                const processedDeck = await this.deckService.convertOpponentStatsForFeAsync(deck, this.cardDataGetter);
                // Clean up the response data - remove internal DB fields
                const cleanDeck = {
                    id: processedDeck.id,
                    userId: processedDeck.userId,
                    deck: processedDeck.deck,
                    stats: processedDeck.stats
                };
                return res.status(200).json({
                    success: true,
                    deck: cleanDeck
                });
            } catch (err) {
                logger.error('GameServer (get-deck/:deckId) Server error: ', err);
                next(err);
            }
        });

        app.post('/api/save-deck', authMiddleware(), async (req, res, next) => {
            try {
                const { deck } = req.body;
                const user = req.user as User;
                if (user.isAnonymousUser()) {
                    logger.error(`GameServer (save-deck): A anonymous user ${user.getId()} attempted to save deck ${deck.id}`);
                    return res.status(401).json({
                        success: false,
                        message: 'Authentication error'
                    });
                }
                // we save the deck
                const newDeck = await this.deckService.saveDeckAsync(deck, user);
                return res.status(200).json({
                    success: true,
                    message: 'Deck saved successfully',
                    deck: newDeck
                });
            } catch (err) {
                logger.error('GameServer (save-deck) Server error: ', err);
                next(err);
            }
        });

        app.put('/api/deck/:deckId/favorite', authMiddleware(), async (req, res, next) => {
            try {
                const { deckId } = req.params;
                const { isFavorite } = req.body;
                const user = req.user as User;
                if (user.isAnonymousUser()) {
                    logger.error(`GameServer (deck/:deckId/favorite): A anonymous user ${user.getId()} attempted to favorite a deck ${deckId}`);
                    return res.status(401).json({
                        success: false,
                        message: 'Authentication error'
                    });
                }

                if (isFavorite === undefined) {
                    logger.error(`GameServer (deck/:deckId/favorite): A User ${user.getId()} attempted to favorite a deck ${deckId} without isFavorite param`);
                    return res.status(400).json({
                        success: false,
                        message: 'Server error'
                    });
                }
                const updatedDeck = await this.deckService.toggleDeckFavoriteAsync(user.getId(), deckId, isFavorite);
                return res.status(200).json({
                    success: true,
                    message: `Deck ${isFavorite ? 'added to' : 'removed from'} favorites successfully`,
                    deck: updatedDeck
                });
            } catch (err) {
                logger.error('GameServer (deck/:deckId/favorite) Server error: ', err);
                next(err);
            }
        });

        app.post('/api/delete-decks', authMiddleware(), async (req, res, next) => {
            try {
                const { deckIds } = req.body;
                const user = req.user as User;

                if (!user || user.isAnonymousUser()) {
                    logger.error(`GameServer (delete-decks): A anonymous user ${user.getId()} attempted to delete decks ${deckIds}`);
                    return res.status(401).json({
                        success: false,
                        message: 'Authentication error'
                    });
                }

                if (!deckIds || !Array.isArray(deckIds) || deckIds.length === 0) {
                    logger.error(`GameServer (delete-decks): Error in delete-decks received empty array of deck ids ${deckIds} from user ${user.getId()}`);
                    return res.status(400).json({
                        success: false,
                        message: 'Server error'
                    });
                }

                // Delete the decks
                const removedDeckLinks: string[] = [];
                for (const deckId of deckIds) {
                    const deletedDeckLink = await this.deckService.deleteDeckAsync(user.getId(), deckId);
                    removedDeckLinks.push(deletedDeckLink);
                }
                return res.status(200).json({
                    success: true,
                    message: `Successfully deleted ${deckIds.length} decks`,
                    removedDeckLinks
                });
            } catch (err) {
                logger.error('GameServer (delete-decks) Server error :', err);
                next(err);
            }
        });

        app.get('/api/ongoing-games', (_, res, next) => {
            try {
                return res.json(this.getOngoingGamesData());
            } catch (err) {
                logger.error('GameServer (ongoing-games) Server Error: ', err);
                next(err);
            }
        });

        app.post('/api/create-lobby', authMiddleware(), async (req, res, next) => {
            try {
                const { deck, format, isPrivate, lobbyName, enableUndo } = req.body;
                const user = req.user;

                // Check if the user is already in a lobby
                if (!this.canUserJoinNewLobby(user.getId())) {
                    // TODO shouldn't return 403
                    logger.error(`GameServer (create-lobby): Error in create-lobby User ${user.getId()} attempted to create a different lobby while already being in a lobby`);
                    logger.info(`enableUndo value: '${enableUndo}'`);
                    return res.status(403).json({
                        success: false,
                        message: 'User is already in a lobby'
                    });
                }

                if (!EnumHelpers.isEnumValue(format, SwuGameFormat)) {
                    logger.error(`GameServer (create-lobby): Invalid game format parameter ${format}`);
                    return res.status(400).json({ success: false, message: `Invalid game format '${format}'` });
                }

                await this.processDeckValidation(deck, format, res, () => {
                    this.createLobby(lobbyName, user, deck, format, isPrivate, enableUndo);
                    res.status(200).json({ success: true });
                });
            } catch (err) {
                logger.error('GameServer (create-lobby) Server error:', err);
                next(err);
            }
        });

        app.get('/api/available-lobbies', (_, res, next) => {
            try {
                const availableLobbies = Array.from(this.lobbiesWithOpenSeat().entries()).map(([id, lobby]) => {
                    const lobbyState = lobby.getLobbyState();
                    const lobbyOwnerUser = lobby.users.find((user) => user.id === lobbyState.lobbyOwnerId);

                    return {
                        id,
                        name: lobby.name,
                        format: lobby.format,
                        host: lobbyOwnerUser?.deck ? {
                            leader: lobbyOwnerUser.deck.leader,
                            base: lobbyOwnerUser.deck.base
                        } : null
                    };
                });
                return res.json(availableLobbies);
            } catch (err) {
                logger.error('GameServer (available-lobbies) Server error: ', err);
                next(err);
            }
        });

        app.post('/api/join-lobby', authMiddleware(), (req, res, next) => {
            try {
                const { lobbyId } = req.body;
                const user = req.user;

                if (!this.canUserJoinNewLobby(user.getId())) {
                    logger.error(`GameServer (join-lobby): Error in join-lobby User ${user.getId()} attempted to join a different lobby while already being in a lobby`);
                    return res.status(403).json({
                        success: false,
                        message: 'User is already in a lobby'
                    });
                }
                const lobby = this.lobbies.get(lobbyId);
                if (!lobby) {
                    logger.error(`GameServer (join-lobby): Error in join-lobby User ${user.getId()} attempted to join a lobby that doesn't exist`);
                    return res.status(404).json({ success: false, message: 'Lobby not found' });
                }

                if (lobby.isFilled()) {
                    return res.status(400).json({ success: false, message: 'Lobby is full' });
                }

                // Add the user to the lobby
                this.userLobbyMap.set(user.getId(), { lobbyId: lobby.id, role: UserRole.Player });
                return res.status(200).json({ success: true });
            } catch (err) {
                logger.error('GameServer (join-lobby) Server error:', err);
                next(err);
            }
        });

        app.get('/api/test-game-setups', (_, res, next) => {
            try {
                const testSetupFilenames = this.getTestSetupGames();
                return res.json(testSetupFilenames);
            } catch (err) {
                logger.error('GameServer: Error in test-game=setups:', err);
                next(err);
            }
        });

        app.post('/api/start-test-game', async (req, res, next) => {
            const { filename } = req.body;
            try {
                await this.startTestGame(filename);
                return res.status(200).json({ success: true });
            } catch (err) {
                logger.error('GameServer: Error in start-test=game:', err);
                next(err);
            }
        });

        app.post('/api/enter-queue', authMiddleware(), async (req, res, next) => {
            try {
                const { format, deck } = req.body;
                const user = req.user;
                // check if user is already in a lobby
                if (!this.canUserJoinNewLobby(user.getId())) {
                    logger.error(`GameServer (enter-queue): Error in enter-queue User ${user.getId()} attempted to join queue while being in a lobby`);
                    return res.status(403).json({
                        success: false,
                        message: 'User is already in a lobby'
                    });
                }

                if (!EnumHelpers.isEnumValue(format, SwuGameFormat)) {
                    logger.error(`GameServer (enter-queue): Invalid game format parameter ${format}`);
                    return res.status(400).json({ success: false, message: `Invalid game format '${format}'` });
                }

                await this.processDeckValidation(deck, format, res, () => {
                    const success = this.enterQueue(format, user, deck);
                    if (!success) {
                        logger.error(`GameServer (enter-queue): Error in enter-queue User ${user.getId()} failed to enter queue`);
                        return res.status(500).json({ success: false, message: 'Failed to enter queue' });
                    }
                    res.status(200).json({ success: true });
                });
            } catch (err) {
                logger.error('GameServer (enter-queue) Server error: ', err);
                next(err);
            }
        });

        app.get('/api/health', (_, res, next) => {
            try {
                return res.status(200).json({ success: true });
            } catch (err) {
                logger.error('GameServer: Error in health:', err);
                next(err);
            }
        });

        app.get('/api/all-leaders', (_, res, next) => {
            try {
                return res.json(this.cardDataGetter.getLeaderCards());
            } catch (err) {
                logger.error('GameServer (all-leaders) Server error: ', err);
                next(err);
            }
        });
    }

    private canUserJoinNewLobby(userId: string) {
        // player ditched out of a matchmaking game, make them wait 20s
        const playerLeftMatchmakingTime = this.playerMatchmakingDisconnectedTime.get(userId);
        if (playerLeftMatchmakingTime) {
            const elapsedSeconds = Math.floor((Date.now() - playerLeftMatchmakingTime.getTime()) / 1000);
            if (elapsedSeconds < 20) {
                logger.info(`GameServer: user ${userId} blocked from joining due to leaving a matchmaking game during coundown`);
                return false;
            }

            this.playerMatchmakingDisconnectedTime.delete(userId);
        }

        // check if user is already in a lobby and if their last activity was within 30s, just in case the lobby entry is stale somehow
        const previousLobbyForUser = this.userLobbyMap.get(userId)?.lobbyId;
        if (previousLobbyForUser) {
            const previousRole = this.userLobbyMap.get(userId)?.role;
            const previousLobby = this.lobbies.get(previousLobbyForUser);
            if (previousLobby) {
                const userLastActivity = previousLobby.getLastActivityForUser(userId);

                if (previousRole === UserRole.Player) {
                    if (userLastActivity == null) {
                        return true;
                    }

                    const elapsedSeconds = Math.floor((Date.now() - userLastActivity.getTime()) / 1000);
                    if (elapsedSeconds < 60) {
                        logger.info(`GameServer: user ${userId} blocked from joining due to still being in lobby ${previousLobby.id}`);
                        return false;
                    }
                }

                this.userLobbyMap.delete(userId);
                this.removeUserMaybeCleanupLobby(previousLobby, userId);
            } else {
                this.userLobbyMap.delete(userId);
            }
        }

        if (this.queue.findPlayer(userId)) {
            this.queue.removePlayer(userId, 'User made an API call for creating / joining / queueing');
        }

        return true;
    }

    public getUserLobbyId(userId: string): string | undefined {
        return this.userLobbyMap.get(userId)?.lobbyId;
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
        let numberOfOngoingGames = 0;

        // Loop through all lobbies and check if they have an ongoing game
        // reverse the order of lobbies so newest games are first
        for (const lobby of Array.from(this.lobbies.values()).reverse()) {
            if (lobby.hasOngoingGame()) {
                const gameState = lobby.getGamePreview();
                if (gameState) {
                    numberOfOngoingGames++;

                    // don't show entries for private games
                    if (lobby.gameType !== MatchType.Private) {
                        ongoingGames.push(gameState);
                    }
                }
            }
        }

        return {
            numberOfOngoingGames,
            ongoingGames
        };
    }

    private getGameAndPlayerCounts() {
        let playerCount = 0;
        let spectatorCount = 0;
        let anonymousPlayerCount = 0;
        let anonymousSpectatorCount = 0;
        let totalGameCount = 0;

        for (const lobby of this.lobbies.values()) {
            if (lobby.hasOngoingGame() && lobby.getGamePreview()) {
                totalGameCount++;
                playerCount += lobby.users.length;
                spectatorCount += lobby.spectators.length;

                anonymousPlayerCount += lobby.users.filter((user) => user.socket?.user?.isAnonymousUser() === true).length;
                anonymousSpectatorCount += lobby.spectators.filter((spectator) => spectator.socket?.user?.isAnonymousUser() === true).length;
            }
        }

        const totalUserCount = playerCount + spectatorCount;

        return {
            totalGameCount,
            totalUserCount,
            playerCount,
            spectatorCount,
            anonymousPlayerCount,
            anonymousSpectatorCount
        };
    }

    private lobbiesWithOpenSeat() {
        return new Map(
            Array.from(this.lobbies.entries()).filter(([, lobby]) =>
                !lobby.isFilled() &&
                !lobby.isPrivate &&
                lobby.gameType !== MatchType.Quick &&
                !lobby.hasOngoingGame() &&
                lobby.hasConnectedPlayer()
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
    private createLobby(lobbyName: string, user: User, deck: Deck, format: SwuGameFormat, isPrivate: boolean, enableUndo = false) {
        if (!user) {
            throw new Error('User must be provided to create a lobby');
        }
        if (!isPrivate && typeof user === 'string') {
            throw new Error('User must be provided for public lobbies');
        }

        // set default user if anonymous user is supplied for private lobbies
        const lobby = new Lobby(
            lobbyName,
            isPrivate ? MatchType.Private : MatchType.Custom,
            format,
            this.cardDataGetter,
            this.deckValidator,
            this,
            this.testGameBuilder,
            enableUndo
        );
        this.lobbies.set(lobby.id, lobby);
        lobby.createLobbyUser(user, deck);
        lobby.setLobbyOwner(user.getId());
        this.userLobbyMap.set(user.getId(), { lobbyId: lobby.id, role: UserRole.Player });
    }

    private async startTestGame(filename: string) {
        const lobby = new Lobby(
            'Test Game',
            MatchType.Custom,
            SwuGameFormat.Open,
            this.cardDataGetter,
            this.deckValidator,
            this,
            this.testGameBuilder,
            true
        );
        this.lobbies.set(lobby.id, lobby);
        const order66 = this.userFactory.createAnonymousUser('exe66', 'Order66');
        const theWay = this.userFactory.createAnonymousUser('th3w4y', 'ThisIsTheWay');
        lobby.createLobbyUser(order66);
        lobby.createLobbyUser(theWay);
        this.userLobbyMap.set(order66.id, { lobbyId: lobby.id, role: UserRole.Player });
        this.userLobbyMap.set(theWay.id, { lobbyId: lobby.id, role: UserRole.Player });
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

    public registerDisconnect(socket: Socket, userId: string) {
        if (socket.eventContainsListener('disconnect')) {
            socket.removeEventsListeners(['disconnect']);
        }

        socket.registerEvent('disconnect', () => {
            this.onSocketDisconnected(socket.socket, userId);
        });
    }

    public async onConnectionAsync(ioSocket: IOSocket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, SocketData>): Promise<void> {
        const user = ioSocket.data.user as User;
        const requestedLobby = JSON.parse(Helpers.getSingleOrThrow(ioSocket.handshake.query.lobby));
        const isSpectator = ioSocket.handshake.query.spectator === 'true';

        if (!ioSocket.data.user) {
            logger.warn(`GameServer: socket connected with no user${!!ioSocket.data.user ? ' id' : ''}, disconnecting`);
            ioSocket.disconnect();
            return Promise.resolve();
        }

        const lobbyUserEntry = this.userLobbyMap.get(user.getId());
        // 0. If user is spectator
        if (isSpectator) {
            // Check if user is registered as a spectator
            if (!lobbyUserEntry || lobbyUserEntry.role !== UserRole.Spectator) {
                logger.warn(`GameServer: User ${user.getId()} attempted to connect as spectator but is not registered in any lobby, disconnecting`);
                ioSocket.disconnect();
                return Promise.resolve();
            }
            const lobbyId = this.userLobbyMap.get(user.getId()).lobbyId;
            const lobby = this.lobbies.get(lobbyId);

            if (!lobby || !lobby.hasOngoingGame()) {
                logger.warn(`GameServer: No lobby or ongoing game for spectator ${user.getId()}, disconnecting`);
                this.userLobbyMap.delete(user.getId());
                ioSocket.disconnect();
                return Promise.resolve();
            }
            const socket = new Socket(ioSocket);
            this.registerDisconnect(socket, user.getId());
            lobby.addSpectator(user, socket);
            return Promise.resolve();
        }

        // 1. If user is already in a lobby
        if (lobbyUserEntry) {
            // we check the role if it is correct
            if (lobbyUserEntry.role !== UserRole.Player) {
                logger.warn(`GameServer: User ${user.getId()} tried to join lobby with ${lobbyUserEntry.role} instead of ${UserRole.Player}, disconnecting`);
                ioSocket.disconnect();
                return Promise.resolve();
            }
            const lobbyId = lobbyUserEntry.lobbyId;
            const lobby = this.lobbies.get(lobbyId);

            if (!lobby) {
                this.userLobbyMap.delete(user.getId());
                logger.warn(`GameServer: Found no lobby for user ${user.getId()}, disconnecting`);
                ioSocket.emit('connection_error', 'Lobby does not exist');
                ioSocket.disconnect();
                return Promise.resolve();
            }

            // there can be a race condition where two users hit `join-lobby` at the same time, so we need to check if the lobby is filled already
            if (lobby.isFilled() && !lobby.hasPlayer(user.getId())) {
                logger.warn(`GameServer: Lobby is full for user ${user.getId()}, disconnecting`);
                ioSocket.emit('connection_error', 'Lobby is full');
                this.userLobbyMap.delete(user.getId());
                return;
            }

            // we get the user from the lobby since this way we can be sure it's the correct one.
            const socket = new Socket(ioSocket);

            try {
                await lobby.addLobbyUserAsync(user, socket);
            } catch (err) {
                this.userLobbyMap.delete(user.getId());
                ioSocket.emit('connection_error', 'Error connecting to lobby');
                ioSocket.disconnect();
                throw err;
            }

            socket.send('connectedUser', user.getId());

            // If a user refreshes while they are matched with another player in the queue they lose the requeue listener
            // this is why we reinitialize the requeue listener
            if (lobby.gameType === MatchType.Quick) {
                if (!socket.eventContainsListener('requeue')) {
                    const lobbyUser = lobby.users.find((u) => u.id === user.getId());
                    socket.registerEvent('requeue', () => this.requeueUser(socket, lobby.format, user, {
                        ...lobbyUser.deck.getDecklist(),
                        deckID: lobbyUser.deck.id,
                        deckLink: lobbyUser.decklist.deckLink,
                        deckSource: lobbyUser.decklist.deckSource,
                        isPresentInDb: lobbyUser.decklist.isPresentInDb,
                    }));
                }
            }

            this.registerDisconnect(socket, user.getId());
            return Promise.resolve();
        }

        // 2. If user connected to the lobby via a link.
        if (requestedLobby?.lobbyId) {
            const lobby = this.lobbies.get(requestedLobby.lobbyId);
            if (!lobby) {
                logger.warn(`GameServer: No lobby with this link for user ${user.getId()}, disconnecting`);
                ioSocket.disconnect();
                return Promise.resolve();
            }

            // check if the lobby is full
            if (lobby.isFilled() || lobby.hasOngoingGame()) {
                logger.warn(`GameServer: Requested lobby ${requestedLobby.lobbyId} is full or already in game, disconnecting user ${user.getId()}`);
                ioSocket.disconnect();
                return Promise.resolve();
            }

            const socket = new Socket(ioSocket);

            // check if user is already in a lobby
            if (!this.canUserJoinNewLobby(user.getId())) {
                logger.warn(`GameServer: User ${user.getId()} is already in a different lobby, disconnecting`);
                ioSocket.disconnect();
                return Promise.resolve();
            }
            // anonymous user joining existing game
            /* if (!user.username) {
                const newUser = { username: 'Player2', id: user.id };
                await lobby.addLobbyUserAsync(newUser, socket);
                this.userLobbyMap.set(newUser.id, { lobbyId: lobby.id, role: UserRole.Player });
                this.registerDisconnect(socket, user.id);
                return Promise.resolve();
           }*/

            await lobby.addLobbyUserAsync(user, socket);
            this.userLobbyMap.set(user.getId(), { lobbyId: lobby.id, role: UserRole.Player });
            this.registerDisconnect(socket, user.getId());
            return Promise.resolve();
        }

        // 3. if they are not in the lobby they could be in a queue
        const queueEntry = this.queue.findPlayer(user.getId());
        if (queueEntry) {
            const queuedPlayer = queueEntry.player;

            const socket = new Socket(ioSocket);

            // if there is an older socket, clean it up first
            if (queuedPlayer.socket && queuedPlayer.socket.id !== socket.id) {
                queuedPlayer.socket.removeEventsListeners(['disconnect']);
                queuedPlayer.socket.disconnect();
            }
            queuedPlayer.socket = socket;

            // handle queue-specific events and add lobby disconnect
            queuedPlayer.socket.registerEvent('disconnect', () => this.onQueueSocketDisconnected(socket, queueEntry.player));

            this.queue.connectPlayer(user.getId(), queuedPlayer.socket);

            return this.matchmakeAllQueuesAsync();
        }

        // A user should not get here
        ioSocket.emit('connection_error', 'Connection error, please try again');
        ioSocket.disconnect();
        // this can happen when someone tries to reconnect to the game but are out of the mapping TODO make a notification for the player
        logger.error(`GameServer: Error state when connecting to lobby/game, ${user.getId()} disconnecting`);

        return Promise.resolve();
    }

    /**
     * Put a user into the queue array. They always start with a null socket.
     */
    private enterQueue(format: SwuGameFormat, user: User, deck: any): boolean {
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

    private async matchmakeAllQueuesAsync(): Promise<void> {
        const formatsWithMatches = this.queue.findReadyFormats();

        for (const format of formatsWithMatches) {
            // track exceptions to avoid getting stuck in a loop
            let exceptionCount = 0;

            while (true) {
                let matchedPlayers: [QueuedPlayer, QueuedPlayer];

                // try-catch here so that all matchmaking doesn't halt on a single failure
                try {
                    matchedPlayers = this.queue.getNextMatchPair(format);
                    if (!matchedPlayers) {
                        break;
                    }

                    await this.matchmakeQueuePlayersAsync(format, matchedPlayers);
                } catch (error) {
                    logger.error(
                        `GameServer: Error matchmaking players ${matchedPlayers?.map((p) => p?.user?.getId()).join(', ')} for format ${format}`,
                        { error: { message: error.message, stack: error.stack } }
                    );

                    exceptionCount++;

                    if (exceptionCount > 10) {
                        // TODO: should we flush the queue here?
                        logger.error(`GameServer: Too many exceptions in matchmaking for format ${format}, moving to next queue`);
                        break;
                    }
                }
            }
        }

        return Promise.resolve();
    }

    /**
     * Matchmake two users in a queue
     */
    private async matchmakeQueuePlayersAsync(format: SwuGameFormat, [p1, p2]: [QueuedPlayer, QueuedPlayer]): Promise<void> {
        Contract.assertFalse(p1.user.getId() === p2.user.getId(), 'Cannot matchmake the same user');
        // Create a new Lobby
        const lobby = new Lobby(
            'Quick Game',
            MatchType.Quick,
            format,
            this.cardDataGetter,
            this.deckValidator,
            this
        );

        this.lobbies.set(lobby.id, lobby);

        // Create the 2 lobby users
        lobby.createLobbyUser(p1.user, p1.deck);
        lobby.createLobbyUser(p2.user, p2.deck);

        // Save user => lobby mapping
        this.userLobbyMap.set(p1.user.getId(), { lobbyId: lobby.id, role: UserRole.Player });
        this.userLobbyMap.set(p2.user.getId(), { lobbyId: lobby.id, role: UserRole.Player });

        // Attach their sockets to the lobby (if they exist)
        await this.setupQueueSocketAsync(p1, lobby, format);
        await this.setupQueueSocketAsync(p2, lobby, format);

        // this needs to be here since we only send start game via the LobbyOwner.
        lobby.setLobbyOwner(p1.user.getId());
        lobby.sendLobbyState();

        logger.info(`GameServer: Matched players ${p1.user.getId()} and ${p2.user.getId()} in lobby ${lobby.id}.`);

        return Promise.resolve();
    }

    private async setupQueueSocketAsync(player: QueuedPlayer, lobby: Lobby, format: SwuGameFormat): Promise<void> {
        const socket = player?.socket;
        if (!socket) {
            return Promise.resolve();
        }

        await lobby.addLobbyUserAsync(player.user, socket);
        socket.registerEvent('disconnect', () => this.onQueueSocketDisconnected(socket.socket, player));
        if (!socket.eventContainsListener('requeue')) {
            socket.registerEvent('requeue', () => this.requeueUser(socket, format, player.user, player.deck));
        }

        return Promise.resolve();
    }

    /**
     * requeues the user and removes them from the previous lobby. If the lobby is empty, it cleans it up.
     */
    public requeueUser(socket: Socket, format: SwuGameFormat, user: User, deck: any) {
        try {
            const userLobbyMapEntry = this.userLobbyMap.get(user.getId());
            if (userLobbyMapEntry) {
                const lobbyId = userLobbyMapEntry.lobbyId;
                this.userLobbyMap.delete(user.getId());

                const lobby = this.lobbies.get(lobbyId);
                this.removeUserMaybeCleanupLobby(lobby, user.getId());
            }

            // add user to queue
            this.queue.addPlayer(format, { user, deck, socket });

            this.matchmakeAllQueuesAsync();
        } catch (err) {
            logger.error('GameServer: Error in requeueUser:', err);
        }
    }

    private removeUserMaybeCleanupLobby(lobby: Lobby | null, userId: string) {
        lobby?.removeUser(userId);
        lobby?.removeSpectator(userId);
        // Check if lobby is empty
        if (lobby?.isEmpty()) {
            // Start the cleanup process
            lobby.cleanLobby();
            this.lobbies.delete(lobby.id);
        }
    }

    public removeLobby(lobby: Lobby, errorMessage?: string) {
        this.lobbies.delete(lobby.id);

        for (const user of lobby.users) {
            this.userLobbyMap.delete(user.id);
            user.socket?.send('connection_error', errorMessage);
        }

        lobby.cleanLobby();
    }

    public onQueueSocketDisconnected(
        socket: Socket,
        player: QueuedPlayer
    ) {
        this.onSocketDisconnected(socket.socket, player.user.getId(), 3, true);
    }

    public handleIntentionalDisconnect(id: string, wasManualDisconnect: boolean, lobby?: Lobby) {
        this.queue.removePlayer(id, wasManualDisconnect ? 'Player disconnect' : 'Force disconnect');
        this.userLobbyMap.delete(id);
        this.removeUserMaybeCleanupLobby(lobby, id);
    }

    public onSocketDisconnected(
        socket: IOSocket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, SocketData>,
        id: string,
        timeoutSeconds = 20,
        isMatchmaking = false
    ) {
        try {
            if (!!socket?.data?.forceDisconnect) {
                return;
            }

            const lobbyEntry = this.userLobbyMap.get(id);
            let lobby = null;

            if (lobbyEntry) {
                const lobbyId = lobbyEntry.lobbyId;
                lobby = this.lobbies.get(lobbyId);
            } else if (!isMatchmaking) {
                return;
            }

            const wasManualDisconnect = !!socket?.data?.manualDisconnect;
            if (wasManualDisconnect) {
                this.handleIntentionalDisconnect(id, wasManualDisconnect, lobby);
                return;
            }

            lobby?.setUserDisconnected(id, socket.id);
            this.queue.disconnectPlayer(id, socket.id);

            const timeoutValue = timeoutSeconds * 1000;

            setTimeout(() => {
                try {
                    if (isMatchmaking && !this.queue.isConnected(id, socket.id)) {
                        this.queue.removePlayer(id, `Timeout disconnect on socket id ${socket.id}`);
                    }

                    // Check if the user is still disconnected after the timer
                    if (lobby?.isDisconnected(id, socket.id)) {
                        logger.info(`GameServer: User ${id} on socket id ${socket.id} is disconnected from lobby ${lobby.id} for more than ${timeoutSeconds}s, removing from lobby`, { userId: id, lobbyId: lobby.id });

                        this.userLobbyMap.delete(id);

                        if (isMatchmaking) {
                            logger.info(
                                `GameServer: User ${id} disconnected from matchmaking during countdown for lobby ${lobby.id}, setting 20s restriction for joining new game`,
                                { userId: id, lobbyId: lobby.id }
                            );
                            this.playerMatchmakingDisconnectedTime.set(id, new Date());

                            lobby.removeUser(id);
                            lobby.handleMatchmakingDisconnect();
                        } else {
                            this.removeUserMaybeCleanupLobby(lobby, id);
                        }
                    }
                } catch (err) {
                    logger.error('GameServer: Error in setTimeout for onSocketDisconnected:', err);
                }
            }, timeoutValue);
        } catch (err) {
            logger.error('GameServer: Error in onSocketDisconnected:', err);
        }
    }

    private logCpuUsage(): void {
        try {
            const cpuUsageDiff = process.cpuUsage(this.lastCpuUsage);
            const nowTime = process.hrtime.bigint();
            const elapsedTimeNanos = Number(nowTime - this.lastCpuUsageTime);

            const elapsedUserNanos = cpuUsageDiff.user * 1000;
            const elapsedSystemNanos = cpuUsageDiff.system * 1000;

            const totalPercent = (((elapsedUserNanos + elapsedSystemNanos) / elapsedTimeNanos) * 100).toFixed(1);
            const userPercent = (((elapsedUserNanos) / elapsedTimeNanos) * 100).toFixed(1);
            const systemPercent = (((elapsedSystemNanos) / elapsedTimeNanos) * 100).toFixed(1);

            logger.info(`[CpuStats] Total Usage: ${totalPercent}% (User: ${userPercent}%, System: ${systemPercent}%) | System Cores: ${cpus().length}`);

            this.lastCpuUsageTime = nowTime;
            this.lastCpuUsage = process.cpuUsage();
        } catch (error) {
            logger.error(`Error logging cpu stats: ${error}`);
        }
    }

    private logHeapStats(): void {
        try {
            const heapStats = getHeapStatistics();
            const usedHeapSizeInMB = (heapStats.used_heap_size / 1024 / 1024).toFixed(1);
            const totalHeapSizeInMB = (heapStats.total_heap_size / 1024 / 1024).toFixed(1);
            const heapSizeLimitInMB = (heapStats.heap_size_limit / 1024 / 1024).toFixed(1);
            const heapUsagePercent = ((heapStats.used_heap_size / heapStats.heap_size_limit) * 100).toFixed(1);
            const rssSizeInMB = (process.memoryUsage().rss / 1024 / 1024).toFixed(1);

            const freeSystemMemoryInGB = (freemem() / 1024 / 1024 / 1024).toFixed(2);
            logger.info(`[HeapStats] Used: ${usedHeapSizeInMB}MB / ${totalHeapSizeInMB}MB (${heapUsagePercent}% of ${heapSizeLimitInMB}MB limit) | Total physical usage: ${rssSizeInMB}MB | System free: ${freeSystemMemoryInGB}GB`);
        } catch (error) {
            logger.error(`Error logging heap stats: ${error}`);
        }
    }

    private logEventLoopStats(): void {
        try {
            const currentUtilization = performance.eventLoopUtilization();
            const deltaUtilization = performance.eventLoopUtilization(currentUtilization, this.lastLoopUtilization);

            const eventLoopPercent = deltaUtilization.utilization * 100;
            const loopDelayP50Ms = this.loopDelayHistogram.percentile(50) / 1e6;
            const loopDelayP90Ms = this.loopDelayHistogram.percentile(90) / 1e6;
            const loopDelayP99Ms = this.loopDelayHistogram.percentile(99) / 1e6;
            const loopDelayMaxMs = this.loopDelayHistogram.max / 1e6;

            // Log a standard human readable log
            logger.info(`[EventLoopStats] Event Loop Utilization: ${eventLoopPercent.toFixed(1)}% | Event Loop Duration (ms): P50: ${loopDelayP50Ms.toFixed(1)}, P90: ${loopDelayP90Ms.toFixed(1)}, P99: ${loopDelayP99Ms.toFixed(1)}, max: ${loopDelayMaxMs.toFixed(1)}`);

            // Log this again in EMF format for CloudWatch metrics capture
            jsonOnlyLogger.info(GameServerMetrics.eventLoopPerformance(eventLoopPercent, loopDelayP99Ms, loopDelayMaxMs));

            this.lastLoopUtilization = currentUtilization;
            this.loopDelayHistogram.reset();
        } catch (error) {
            logger.error(`Error logging event loop stats: ${error}`);
        }
    }

    private logPlayerStats(): void {
        try {
            const gameAndPlayerCounts = this.getGameAndPlayerCounts();
            const anonymousPlayerPercentage = gameAndPlayerCounts.playerCount > 0
                ? ((gameAndPlayerCounts.anonymousPlayerCount / gameAndPlayerCounts.playerCount) * 100).toFixed(1)
                : '0.0';
            const anonymousSpectatorPercentage = gameAndPlayerCounts.spectatorCount > 0
                ? ((gameAndPlayerCounts.anonymousSpectatorCount / gameAndPlayerCounts.spectatorCount) * 100).toFixed(1)
                : '0.0';

            // Log a standard human readable log
            logger.info(`[PlayerStats] ${gameAndPlayerCounts.totalUserCount} total users playing in ${gameAndPlayerCounts.totalGameCount} games | Player Count: ${gameAndPlayerCounts.playerCount} (${anonymousPlayerPercentage}% anon) | Spectator Count: ${gameAndPlayerCounts.spectatorCount} (${anonymousSpectatorPercentage}% anon)`);

            // Log this again in EMF format for CloudWatch custom metrics capture
            jsonOnlyLogger.info(GameServerMetrics.gameAndPlayerCount(gameAndPlayerCounts.spectatorCount, gameAndPlayerCounts.totalGameCount));
        } catch (error) {
            logger.error(`Error logging player stats: ${error}`);
        }
    }

    /**
     * Clean up invalid/expired tokens from the user token map
     */
    private cleanupInvalidTokens(): void {
        try {
            const newTokenMapping = new Map<string, ISwuStatsToken>();
            // Create new map with only valid tokens
            for (const [userId, token] of this.swuStatsTokenMapping.entries()) {
                if (this.swuStatsHandler.isTokenValid(token)) {
                    newTokenMapping.set(userId, token);
                }
            }
            // Replace the old map with the new one
            this.swuStatsTokenMapping = newTokenMapping;
        } catch (error) {
            logger.error('GameServer: Error during token cleanup:', {
                error: { message: error.message, stack: error.stack }
            });
        }
    }

    private setupGCMonitoring(): void {
        this.gcStats.intervalStartTime = Date.now();
        const gcObserver = new PerformanceObserver((list) => {
            try {
                for (const entry of list.getEntries()) {
                    this.gcStats.totalDuration += entry.duration;

                    if ((entry as unknown as GCPerformanceEntry).detail.kind === NodePerfConstants.NODE_PERFORMANCE_GC_MINOR) { // Scavenge (minor GC)
                        this.gcStats.scavengeCount++;
                        this.gcStats.scavengeDuration += entry.duration;
                        this.gcStats.maxScavengeDuration = Math.max(this.gcStats.maxScavengeDuration, entry.duration);
                    } else if ((entry as unknown as GCPerformanceEntry).detail.kind === NodePerfConstants.NODE_PERFORMANCE_GC_MAJOR) { // Mark-Sweep (major GC)
                        this.gcStats.markSweepCount++;
                        this.gcStats.markSweepDuration += entry.duration;
                        this.gcStats.maxMarkSweepDuration = Math.max(this.gcStats.maxMarkSweepDuration, entry.duration);
                    } else if ((entry as unknown as GCPerformanceEntry).detail.kind === NodePerfConstants.NODE_PERFORMANCE_GC_INCREMENTAL) { // Incremental GC
                        this.gcStats.incrementalCount++;
                        this.gcStats.incrementalDuration += entry.duration;
                        this.gcStats.maxIncrementalDuration = Math.max(this.gcStats.maxIncrementalDuration, entry.duration);
                    } else if ((entry as unknown as GCPerformanceEntry).detail.kind === NodePerfConstants.NODE_PERFORMANCE_GC_WEAKCB) { // Weak callback GC
                        this.gcStats.weakCallbackCount++;
                        this.gcStats.weakCallbackDuration += entry.duration;
                        this.gcStats.maxWeakCallbackDuration = Math.max(this.gcStats.maxWeakCallbackDuration, entry.duration);
                    }
                }
            } catch (error) {
                logger.error(`Error capturing GC stats from PerformanceObserver: ${error}`);
            }
        });
        gcObserver.observe({ entryTypes: ['gc'] });
    }

    private logGCStats(): void {
        try {
            const intervalDuration = Date.now() - this.gcStats.intervalStartTime;
            const scavengeAvg = this.gcStats.scavengeCount > 0 ? this.gcStats.scavengeDuration / this.gcStats.scavengeCount : 0;
            const markSweepAvg = this.gcStats.markSweepCount > 0 ? this.gcStats.markSweepDuration / this.gcStats.markSweepCount : 0;
            const incrementalAvg = this.gcStats.incrementalCount > 0 ? this.gcStats.incrementalDuration / this.gcStats.incrementalCount : 0;
            const weakCallbackAvg = this.gcStats.weakCallbackCount > 0 ? this.gcStats.weakCallbackDuration / this.gcStats.weakCallbackCount : 0;

            logger.info(
                `[GCStats] Duration: ${(intervalDuration / 1000).toFixed(1)}s | Total GC time: ${this.gcStats.totalDuration.toFixed(1)}ms | ` +
                `Minor: ${this.gcStats.scavengeCount} (total ${this.gcStats.scavengeDuration.toFixed(1)}ms, avg: ${scavengeAvg.toFixed(1)}ms, max: ${this.gcStats.maxScavengeDuration.toFixed(1)}ms) | ` +
                `Major: ${this.gcStats.markSweepCount} (total ${this.gcStats.markSweepDuration.toFixed(1)}ms, avg: ${markSweepAvg.toFixed(1)}ms, max: ${this.gcStats.maxMarkSweepDuration.toFixed(1)}ms) | ` +
                `Incremental: ${this.gcStats.incrementalCount} (total ${this.gcStats.incrementalDuration.toFixed(1)}ms, avg: ${incrementalAvg.toFixed(1)}ms, max: ${this.gcStats.maxIncrementalDuration.toFixed(1)}ms) | ` +
                `WeakCB: ${this.gcStats.weakCallbackCount} (total ${this.gcStats.weakCallbackDuration.toFixed(1)}ms, avg: ${weakCallbackAvg.toFixed(1)}ms, max: ${this.gcStats.maxWeakCallbackDuration.toFixed(1)}ms)`
            );

            // Log this again in EMF format for CloudWatch custom metrics capture
            const totalCount = this.gcStats.scavengeCount + this.gcStats.markSweepCount + this.gcStats.incrementalCount + this.gcStats.weakCallbackCount;
            const maxDuration = Math.max(this.gcStats.maxScavengeDuration, this.gcStats.maxMarkSweepDuration, this.gcStats.maxIncrementalDuration, this.gcStats.maxWeakCallbackDuration);
            jsonOnlyLogger.info(GameServerMetrics.gcPerformance(this.gcStats.totalDuration, totalCount, maxDuration));

            // Reset stats for next interval
            this.gcStats = {
                totalDuration: 0,
                scavengeCount: 0,
                scavengeDuration: 0,
                maxScavengeDuration: 0,
                markSweepCount: 0,
                markSweepDuration: 0,
                maxMarkSweepDuration: 0,
                incrementalCount: 0,
                incrementalDuration: 0,
                maxIncrementalDuration: 0,
                weakCallbackCount: 0,
                weakCallbackDuration: 0,
                maxWeakCallbackDuration: 0,
                intervalStartTime: Date.now()
            };
        } catch (error) {
            logger.error(`Error logging GC stats: ${error}`);
        }
    }
}

