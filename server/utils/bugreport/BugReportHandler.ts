import type { IBugReport, IBugReportGameState, IPlayerBugReportState, IBugReportCardState } from './BugReportInterfaces';
import FormData from 'form-data';
import { logger } from '../../logger';
import type { User } from '../../Settings';
import { httpPostFormData } from '../../Util';

export class BugReportHandler {
    private discordWebhookUrl: string;

    public constructor() {
        // Use provided webhook URL or load from environment variables
        this.discordWebhookUrl = process.env.DISCORD_BUG_REPORT_WEBHOOK_URL;
        if (!this.discordWebhookUrl) {
            logger.warn('BugReportHandler initialized without a Discord webhook URL. Bug reports will be logged but not sent to Discord.');
        }
    }

    /**
     * Send a bug report to Discord via webhook
     * @param bugReport The bug report data
     * @returns Promise that resolves to true if successful, false otherwise
     */
    public async sendBugReportToDiscord(bugReport: IBugReport): Promise<boolean> {
        try {
            // Always log the bug report
            logger.info(`Bug report received from user ${bugReport.reporter.username}`, {
                lobbyId: bugReport.lobbyId,
                reporterId: bugReport.reporter.id,
                description: bugReport.description
            });

            // If no webhook URL is configured, just log it
            if (!this.discordWebhookUrl) {
                logger.warn('Bug report could not be sent to Discord: No webhook URL configured');
                return false;
            }

            // Create Discord message content
            const { content, embeds } = this.formatDiscordMessage(bugReport);

            // Create FormData for sending file attachment
            const formData = new FormData();

            // Add the message payload
            formData.append('payload_json', JSON.stringify({
                content,
                embeds
            }));

            // Add the game state as a file attachment
            const gameStateJson = JSON.stringify(bugReport.gameState, null, 2);
            const fileName = `bug-report-${bugReport.lobbyId}-${new Date().getTime()}.json`;
            formData.append('files[0]', Buffer.from(gameStateJson), {
                filename: fileName,
                contentType: 'application/json',
            });

            // Send to Discord webhook with file attachment using our custom function
            await httpPostFormData(this.discordWebhookUrl, formData);

            logger.info(`Bug report successfully sent to Discord from user ${bugReport.reporter.username}`, {
                lobbyId: bugReport.lobbyId
            });

            return true;
        } catch (error) {
            logger.error('Failed to send bug report to Discord', {
                error: { message: error.message, stack: error.stack },
                lobbyId: bugReport.lobbyId
            });

            return false;
        }
    }

    /**
     * Format the bug report as a Discord message
     * @param bugReport The bug report data
     * @returns Formatted Discord message object
     */
    private formatDiscordMessage(bugReport: IBugReport): { content: string; embeds: any[] } {
        // Truncate description if it's too long for Discord embeds
        const embedDescription = bugReport.description.length > 1024
            ? bugReport.description.substring(0, 1021) + '...'
            : bugReport.description;

        return {
            content: `New bug report from **${bugReport.reporter.username}**!`,
            embeds: [
                {
                    title: 'Bug Report',
                    color: 0xFF0000, // Red color
                    description: embedDescription,
                    fields: [
                        {
                            name: 'Reporter',
                            value: `${bugReport.reporter.username}`,
                            inline: true
                        },
                        {
                            name: 'Lobby ID',
                            value: bugReport.lobbyId,
                            inline: true
                        },
                        {
                            name: 'Game ID',
                            value: bugReport.gameId || 'N/A',
                            inline: true
                        },
                        {
                            name: 'Timestamp',
                            value: bugReport.timestamp,
                            inline: true
                        },
                        {
                            name: 'Game State',
                            value: 'See attached JSON file for complete game state'
                        }
                    ],
                    timestamp: new Date().toISOString()
                }
            ]
        };
    }

    /**
     * Create a bug report object from provided data
     * @param description User description of the bug
     * @param gameState Current game state snapshot
     * @param user User reporting the bug
     * @param lobbyId ID of the lobby where the bug occurred
     * @param gameId Optional ID of the game where the bug occurred
     * @returns Formatted bug report object
     */
    public createBugReport(
        description: string,
        gameState: IBugReportGameState,
        user: User,
        lobbyId: string,
        gameId?: string
    ): IBugReport {
        return {
            description,
            gameState,
            reporter: {
                id: user.id,
                username: user.username
            },
            lobbyId,
            gameId,
            timestamp: new Date().toISOString()
        };
    }

    /**
     * Captures the current game state for a bug report
     * @param game The current game instance
     * @returns A simplified game state representation
     */
    public captureGameState(game: any): IBugReportGameState {
        if (!game) {
            return {
                phase: 'unknown',
                player1: {},
                player2: {}
            };
        }

        const players = game.getPlayers();
        if (players.length !== 2) {
            return {
                phase: game.currentPhase || 'unknown',
                player1: {},
                player2: {}
            };
        }

        const player1 = players[0];
        const player2 = players[1];

        return {
            phase: game.currentPhase || 'unknown',
            player1: this.capturePlayerState(player1),
            player2: this.capturePlayerState(player2)
        };
    }

    /**
     * Captures a player's state for a bug report
     * @param player The player object
     * @returns A simplified player state representation
     */
    private capturePlayerState(player: any): IPlayerBugReportState {
        const state: IPlayerBugReportState = {};
        try {
            // Hand cards
            if (player.handZone && player.handZone.cards && player.handZone.cards.length > 0) {
                state.hand = player.handZone.cards.map((card) => card.internalName);
            }

            // Ground arena units
            if (player.game && player.game.groundArena) {
                const groundArenaCards = player.game.groundArena.getCards({ controller: player });
                if (groundArenaCards && groundArenaCards.length > 0) {
                    state.groundArena = groundArenaCards
                        .filter((card) => this.captureCardState(card) !== null)
                        .map((card) => this.captureCardState(card));
                }
            }

            // Space arena units
            if (player.game && player.game.spaceArena) {
                const spaceArenaCards = player.game.spaceArena.getCards({ controller: player });
                if (spaceArenaCards && spaceArenaCards.length > 0) {
                    state.spaceArena = spaceArenaCards
                        .filter((card) => this.captureCardState(card) !== null)
                        .map((card) => this.captureCardState(card));
                }
            }

            // Discard pile
            if (player.discardZone && player.discardZone.cards && player.discardZone.cards.length > 0) {
                state.discard = player.discardZone.cards.map((card) => card.internalName);
            }

            // Deck (top few cards only to avoid excessive data)
            if (player.deckZone && player.deckZone.cards && player.deckZone.cards.length > 0) {
                state.deck = player.deckZone.cards.slice(0, 5).map((card) => card.internalName);
            }

            // Resources
            if (player.readyResourceCount !== undefined) {
                state.resources = player.resourceZone.cards.map((card) => card.internalName);
            }

            // Leader
            if (player.leader) {
                state.leader = this.captureCardState(player.leader);
            }

            // Base
            if (player.base) {
                state.base = this.captureCardState(player.base);
            }

            // Initiative
            if (player.game && player.game.initiativePlayer === player) {
                state.hasInitiative = true;
            }
        } catch (error) {
            logger.error('Error capturing player state for bug report', {
                error: { message: error.message, stack: error.stack },
                playerId: player.id
            });
        }

        return state;
    }

    /**
     * Captures a card's state for a bug report
     * @param card The card object
     * @returns A simplified card state representation
     */
    private captureCardState(card: any): string | IBugReportCardState {
        if (!card || (typeof card.isAttached === 'function' && card.isAttached())) {
            return null;
        }
        try {
            if (card.isLeader() && !card.deployed) {
                return card.internalName;
            }

            // If the card is simple, just return its internal name
            if (!card.damage && !card.upgrades) {
                return card.internalName;
            }
            // Return a more detailed card state
            const cardState: IBugReportCardState = {
                card: card.internalName
            };

            if (card.damage) {
                cardState.damage = card.damage;
            }

            if (card.deployed !== undefined) {
                cardState.deployed = card.deployed;
            }

            if (card.exhausted !== undefined) {
                cardState.exhausted = card.exhausted;
            }
            // Capture upgrades/attachments
            if (card.upgrades && card.upgrades.length > 0) {
                cardState.upgrades = card.upgrades.map((upgrade) => upgrade.internalName);
            }
            return cardState;
        } catch (error) {
            logger.error('Error capturing card state for bug report', {
                error: { message: error.message, stack: error.stack },
                cardId: card.id
            });
            return card.internalName || 'unknown-card';
        }
    }
}