import FormData from 'form-data';
import type { User } from '../../utils/user/User';
import { httpPostFormData } from '../../Util';
import type {
    ISerializedGameState, ISerializedMessage, ISerializedReportState, ISerializedUndoFailureState,
    MessageText, PlayerReportType
} from '../Interfaces';
import { logger } from '../../logger';
import * as Helpers from './utils/Helpers';
import type { MatchmakingType } from '../../gamenode/Lobby';
import type { SwuGameFormat } from './Constants';

interface IDiscordFormat {
    content: string;
    embeds: any[];
}

type EitherPostResponseOrBoolean = string | boolean;

export interface IDiscordDispatcher {

    /**
     * Format the bug report as a Discord message and dispatch it
     * @param report The report data
     * @param isBugReport Boolean field that seperates between a bug report and a player report
     * @returns Promise that returns the response body as a string if successful, throws an error otherwise
     */
    formatAndSendReportAsync(report: ISerializedReportState, isBugReport: boolean): Promise<EitherPostResponseOrBoolean>;

    /**
     * Format the undo failure report as a Discord message and dispatch it
     * @param undoFailure The undo failure data
     * @returns Promise that returns the response body as a string if successful, throws an error otherwise
     */
    formatAndSendUndoFailureReportAsync(undoFailure: ISerializedUndoFailureState): Promise<EitherPostResponseOrBoolean>;

    /**
     * Format and send a server error report to Discord
     * @param description A brief description of the error context
     * @param error The error object to report
     * @param lobbyId The lobby ID associated with the error
     * @returns Promise that returns the response body as a string if successful, throws an error otherwise
     */
    formatAndSendServerErrorAsync(
        description: string,
        error: Error,
        gameState: ISerializedGameState,
        messages: ISerializedMessage[],
        lobbyId: string,
        player1Id: string,
        player2Id: string,
        gameFormat: SwuGameFormat,
        matchType: MatchmakingType,
        gameStepsSinceLastUndo?: number,
    ): Promise<EitherPostResponseOrBoolean>;

    /**
     * Format and send a server error report to Discord indicating that a game failed to start and the lobby was closed
     * @param description A brief description of the error context
     * @param error The error object to report
     * @param lobbyId The lobby ID associated with the error
     * @returns Promise that returns the response body as a string if successful, throws an error otherwise
     */
    formatAndSendGameStartErrorAsync(
        description: string,
        error: Error,
        lobbyId: string,
        gameFormat: SwuGameFormat,
        matchType: MatchmakingType,
    ): Promise<EitherPostResponseOrBoolean>;
}

export class DiscordDispatcher implements IDiscordDispatcher {
    private static readonly MaxServerErrorCount = 3;
    private static readonly MaxUndoErrorCount = 3;
    private readonly _bugReportWebhookUrl: string;
    private readonly _serverErrorWebhookUrl: string;
    private readonly _playerReportWebhookUrl: string;
    private _serverErrorCount = 0;
    private _undoErrorCount = 0;

    public constructor() {
        this._bugReportWebhookUrl = process.env.DISCORD_BUG_REPORT_WEBHOOK_URL || '';
        this._serverErrorWebhookUrl = process.env.DISCORD_ERROR_REPORT_WEBHOOK_URL || '';
        this._playerReportWebhookUrl = process.env.DISCORD_PLAYER_REPORT_WEBHOOK_URL || '';
        if (process.env.NODE_ENV !== 'development' && process.env.NODE_ENV !== 'test') {
            if (!this._bugReportWebhookUrl) {
                throw new Error('No Discord webhook URL configured for bug reports. Bug reports cannot be sent to Discord.');
            }
            if (!this._serverErrorWebhookUrl) {
                throw new Error('No Discord webhook URL configured for server error reports. Server error reports cannot be sent to Discord.');
            }
            if (!this._playerReportWebhookUrl) {
                throw new Error('No Discord webhook URL configured for player reports. Player reports cannot be sent to Discord.');
            }
        }
    }

    public async formatAndSendReportAsync(report: ISerializedReportState, isBugReport: boolean): Promise<EitherPostResponseOrBoolean> {
        // Always log the report
        const logData = {
            lobbyId: report.lobbyId,
            reporterId: report.reporter.id,
            reportedPlayerId: report.opponent.id,
            reportType: isBugReport ? 'Bug report' : 'Player report',
            description: report.description,
            gameStateJson: JSON.stringify(report.gameState, null, 0)
        };

        // Only add screen resolution and viewport to log if they exist
        if (report.screenResolution) {
            Object.assign(logData, { screenResolution: report.screenResolution });
        }

        if (report.viewport) {
            Object.assign(logData, { viewport: report.viewport });
        }

        logger.info(`Report received from user ${report.reporter.username}`, logData);

        if (!this._bugReportWebhookUrl && isBugReport) {
            // If no webhook URL is configured, just log it
            if (process.env.NODE_ENV !== 'test') {
                logger.warn('Bug report could not be sent to Discord: No webhook URL configured for bug reports');
            }

            return false;
        } else if (!this._playerReportWebhookUrl && !isBugReport) {
            // If no webhook URL is configured, just log it
            if (process.env.NODE_ENV !== 'test') {
                logger.warn('Player report could not be sent to Discord: No webhook URL configured for player reports');
            }
            return false;
        }

        // Truncate description if it's too long for Discord embeds
        const embedDescription = report.description.length > 1024
            ? report.description.substring(0, 1021) + '...'
            : report.description;

        // Prepare fields for embed
        const fields = [
            {
                name: 'Reporter',
                value: `${report.reporter.username} (${report.reporter.id})`,
                inline: true,
            },
            ...(!isBugReport ? [{
                name: 'Offending player',
                value: `${report.opponent.username} (${report.opponent.id})`,
                inline: true,
            },
            {
                name: 'Offense',
                value: `${report.playerReportType}`,
                inline: true,
            }
            ] : []),
            {
                name: 'Lobby ID',
                value: report.lobbyId,
                inline: true,
            },
            {
                name: 'Game ID',
                value: report.gameId || 'N/A',
                inline: true,
            },
            {
                name: 'Timestamp',
                value: report.timestamp,
                inline: true,
            },
            {
                name: 'Game Steps Since Last Undo',
                value: report.gameStepsSinceLastUndo,
                inline: true,
            },
            {
                name: 'Game Format',
                value: report.gameFormat.toString(),
                inline: true
            },
            {
                name: 'Match Type',
                value: report.matchType.toString(),
                inline: true
            }
        ];

        // Add screen resolution if available
        if (report.screenResolution) {
            fields.push({
                name: 'Screen Resolution',
                value: `${report.screenResolution.width}x${report.screenResolution.height}`,
                inline: true
            });
        }

        // Add viewport information if available
        if (report.viewport) {
            fields.push({
                name: 'Viewport',
                value: `${report.viewport.width}x${report.viewport.height}`,
                inline: true
            });
        }

        // Add game state field
        if (isBugReport) {
            fields.push({
                name: 'Game State',
                value: 'See attached JSON file for complete game state',
                inline: false
            });
        }

        // Create FormData for sending file attachment
        const formData = new FormData();

        const data: IDiscordFormat = {
            content: `New ${isBugReport ? 'bug' : 'player'} report from **${report.reporter.username}**!`,
            embeds: [
                {
                    title: `${isBugReport ? 'Bug' : 'Player'} Report`,
                    color: 0xFF0000, // Red color
                    description: embedDescription,
                    fields,
                    timestamp: new Date().toISOString(),
                },
            ]
        };

        // Add the message payload
        formData.append('payload_json', JSON.stringify(data));

        const timestamp = new Date().getTime();
        if (isBugReport) {
            this.addGameStateToForm(formData, report.gameState, report.lobbyId, timestamp);
            this.addGameMessagesToForm(formData, report.messages, report.lobbyId, report.reporter.id, report.opponent.id, timestamp);
        } else {
            this.addGameMessagesToForm(formData, report.messages, report.lobbyId, report.reporter.id, report.opponent.id, timestamp, report.reporter.username, report.opponent.username);
        }

        // Send to Discord webhook with file attachment using our custom function
        try {
            // Create Discord message content
            await httpPostFormData(isBugReport ? this._bugReportWebhookUrl : this._playerReportWebhookUrl, formData);

            logger.info(`${isBugReport ? 'Bug' : 'Player'} report successfully sent to Discord from user ${report.reporter.username}`, {
                lobbyId: report.lobbyId
            });

            return true;
        } catch (error) {
            logger.error(`Failed to send ${isBugReport ? 'Bug' : 'Player'} report to Discord`, {
                error: { message: error.message, stack: error.stack },
                lobbyId: report.lobbyId
            });
            throw error;
        }
    }

    private addGameStateToForm(formData: FormData, gameState: any, lobbyId: string, timestamp: number): void {
        const gameStateJson = JSON.stringify(gameState, null, 2);
        const fileName = `bug-report-${lobbyId}-${timestamp}.json`;
        formData.append('files[0]', Buffer.from(gameStateJson), {
            filename: fileName,
            contentType: 'application/json',
        });
    }

    private addGameMessagesToForm(formData: FormData, messages: ISerializedMessage[], lobbyId: string, reporterId: string, opponentId: string, timestamp: number, reporterUsername = 'Player1', opponentUsername = 'Player2'): void {
        const messagesText = DiscordDispatcher.formatMessagesToText(messages, reporterId, opponentId, reporterUsername, opponentUsername);
        const fileName = `report-messages-${lobbyId}-${timestamp}.txt`;
        formData.append('files[1]', Buffer.from(messagesText), {
            filename: fileName,
            contentType: 'text/plain',
        });
    }

    public formatAndSendUndoFailureReportAsync(undoFailure: ISerializedUndoFailureState): Promise<EitherPostResponseOrBoolean> {
        if (!this._serverErrorWebhookUrl) {
            // If no webhook URL is configured, just log it
            if (process.env.NODE_ENV !== 'test') {
                logger.warn('Undo failure could not be sent to Discord: No webhook URL configured for server errors');
            }
            return Promise.resolve(false);
        }
        if (this._undoErrorCount >= DiscordDispatcher.MaxUndoErrorCount) {
            if (process.env.NODE_ENV !== 'test') {
                logger.warn('Undo failure could not be sent to Discord: Maximum error count reached for undo failures');
            }
            return Promise.resolve(false);
        }
        this._undoErrorCount++;

        const embedDescription = 'Undo failed due to an unexpected error.';
        const fields = [
            {
                name: 'Lobby ID',
                value: undoFailure.lobbyId,
                inline: true,
            },
            {
                name: 'Game ID',
                value: undoFailure.gameId || 'N/A',
                inline: true,
            },
            {
                name: 'Pre Undo State',
                value: 'See attached JSON file for the pre-undo game state',
                inline: false,
            },
            {
                name: 'Snapshot Settings',
                value: 'See attached JSON file for the snapshot settings used during the undo attempt',
                inline: false,
            },
        ];

        const formData = new FormData();

        const data: IDiscordFormat = {
            content: `New Undo Failure from Lobby **${undoFailure.lobbyId}** with GameID **${undoFailure.gameId}**!`,
            embeds: [
                {
                    title: 'Undo Failure',
                    color: 0xFF0000, // Red color
                    description: embedDescription,
                    fields,
                    timestamp: new Date().toISOString()
                }
            ]
        };

        // Add the message payload
        formData.append('payload_json', JSON.stringify(data));

        // Add the pre-undo state as a file attachment
        const preUndoStateJson = JSON.stringify(undoFailure.preUndoState, null, 2);
        const fileName = `undo-failure-pre-state-${undoFailure.lobbyId}-${new Date().getTime()}.json`;
        formData.append('files[0]', Buffer.from(preUndoStateJson), {
            filename: fileName,
            contentType: 'application/json',
        });

        // Add the snapshot settings as a file attachment
        const snapshotSettingsJson = JSON.stringify(undoFailure.settings, null, 2);
        const snapshotFileName = `undo-failure-snapshot-settings-${undoFailure.lobbyId}-${new Date().getTime()}.json`;
        formData.append('files[1]', Buffer.from(snapshotSettingsJson), {
            filename: snapshotFileName,
            contentType: 'application/json',
        });

        return httpPostFormData(this._serverErrorWebhookUrl, formData);
    }

    public formatAndSendServerErrorAsync(
        description: string,
        error: Error,
        gameState: ISerializedGameState,
        messages: ISerializedMessage[],
        lobbyId: string,
        player1Id: string,
        player2Id: string,
        gameFormat: SwuGameFormat,
        matchType: MatchmakingType,
        gameStepsSinceLastUndo?: number
    ): Promise<EitherPostResponseOrBoolean> {
        if (!this._serverErrorWebhookUrl) {
            // If no webhook URL is configured, just log it
            if (process.env.NODE_ENV !== 'test') {
                logger.warn('Server error could not be sent to Discord: No webhook URL configured for server errors');
            }
            return Promise.resolve(false);
        }
        if (this._serverErrorCount >= DiscordDispatcher.MaxServerErrorCount) {
            if (process.env.NODE_ENV !== 'test') {
                logger.warn('Server error could not be sent to Discord: Maximum error count reached for server errors');
            }
            return Promise.resolve(false);
        }
        this._serverErrorCount++;

        // Truncate description if it's too long for Discord embeds
        const embedDescription = description.length > 1024
            ? description.substring(0, 1021) + '...'
            : description;

        const fields = [
            {
                name: 'Lobby ID',
                value: lobbyId,
                inline: true,
            },
            {
                name: 'Error Message',
                value: error.message,
                inline: false,
            },
            {
                name: 'Game Steps Since Last Undo',
                value: gameStepsSinceLastUndo != null ? gameStepsSinceLastUndo.toString() : 'N/A',
                inline: true,
            },
            {
                name: 'Game Format',
                value: gameFormat.toString(),
                inline: false
            },
            {
                name: 'Match Type',
                value: matchType.toString(),
                inline: true
            }
        ];

        const data: IDiscordFormat = {
            content: `Server error in Lobby **${lobbyId}**!`,
            embeds: [
                {
                    title: 'Server Error Report',
                    color: 0xFF0000, // Red color
                    description: embedDescription,
                    fields,
                    timestamp: new Date().toISOString(),
                },
            ]
        };

        const formData = new FormData();
        // Add the message payload
        formData.append('payload_json', JSON.stringify(data));

        const timestamp = new Date().getTime();

        this.addGameStateToForm(formData, gameState, lobbyId, timestamp);
        this.addGameMessagesToForm(formData, messages, lobbyId, player1Id, player2Id, timestamp);

        const fileName = `server-error-stack-trace-${lobbyId}-${timestamp}.txt`;
        formData.append('files[2]', Buffer.from(error.stack || ''), {
            filename: fileName,
            contentType: 'text/plain',
        });

        return httpPostFormData(this._serverErrorWebhookUrl, formData);
    }

    public formatAndSendGameStartErrorAsync(
        description: string,
        error: Error,
        lobbyId: string,
        gameFormat: SwuGameFormat,
        matchType: MatchmakingType,
    ): Promise<EitherPostResponseOrBoolean> {
        if (!this._serverErrorWebhookUrl) {
            // If no webhook URL is configured, just log it
            if (process.env.NODE_ENV !== 'test') {
                logger.warn('Server error could not be sent to Discord: No webhook URL configured for server errors');
            }
            return Promise.resolve(false);
        }

        // Truncate description if it's too long for Discord embeds
        const embedDescription = description.length > 1024
            ? description.substring(0, 1021) + '...'
            : description;

        const fields = [
            {
                name: 'Lobby ID',
                value: lobbyId,
                inline: true,
            },
            {
                name: 'Error Message',
                value: error.message,
                inline: false,
            },
            {
                name: 'Game Format',
                value: gameFormat.toString(),
                inline: false
            },
            {
                name: 'Match Type',
                value: matchType.toString(),
                inline: true
            }
        ];

        const data: IDiscordFormat = {
            content: `Server error in Lobby **${lobbyId}**!`,
            embeds: [
                {
                    title: 'Server Error Report',
                    color: 0xFF0000, // Red color
                    description: embedDescription,
                    fields,
                    timestamp: new Date().toISOString(),
                },
            ]
        };

        const formData = new FormData();
        // Add the message payload
        formData.append('payload_json', JSON.stringify(data));

        const timestamp = new Date().getTime();

        const fileName = `server-error-stack-trace-${lobbyId}-${timestamp}.txt`;
        formData.append('files[0]', Buffer.from(error.stack || ''), {
            filename: fileName,
            contentType: 'text/plain',
        });

        return httpPostFormData(this._serverErrorWebhookUrl, formData);
    }

    /**
     * Formats game messages into a readable text format
     * @param messages Array of message objects
     * @param reporter Reporting player
     * @returns Formatted text string
     */
    private static formatMessagesToText(messages: ISerializedMessage[], reporter: string, opponent: string, reporterUsername: string, opponentUsername: string): string {
        return messages.map((messageEntry) => {
            let message = messageEntry.message;

            // Handle alert messages
            if (typeof message === 'object' && 'alert' in message) {
                message = [`[ALERT - ${message.alert.type}] `, ...Helpers.asArray(message.alert.message)];
            }

            // Handle regular messages (arrays)
            if (Array.isArray(message)) {
                // Convert message array to string, handling objects within the array
                const messageText = message.map((part) => {
                    if (typeof part === 'string' || typeof part === 'number') {
                        return part;
                    } else if (part && typeof part === 'object' && 'name' in part) {
                        return part['id'] === reporter ? reporterUsername : part['id'] === opponent ? opponentUsername : part['name'];
                    }
                    return '';
                }).join('');

                return `${messageText}`;
            }

            // Handle string messages
            if (typeof message === 'string') {
                return `${message}`;
            }

            return '[Unknown message format]';
        }).join('\n');
    }

    /**
     * Create a bug report object from provided data
     * @param description User description of the bug
     * @param gameState Current game state snapshot
     * @param playerReportType
     * @param user User reporting the bug
     * @param opponent
     * @param messages
     * @param lobbyId ID of the lobby where the bug occurred
     * @param gameFormat
     * @param matchType
     * @param gameStepsSinceLastUndo
     * @param gameId Optional ID of the game where the bug occurred
     * @param screenResolution Optional screen resolution information
     * @param viewport Optional viewport information
     * @returns Formatted bug report object
     */
    public formatReport(
        description: string,
        gameState: ISerializedGameState,
        playerReportType: PlayerReportType | null,
        user: User,
        opponent: { id: string; username: string },
        messages: { date: Date; message: MessageText | { alert: { type: string; message: string | string[] } } }[],
        lobbyId: string,
        gameFormat: SwuGameFormat,
        matchType: MatchmakingType,
        gameStepsSinceLastUndo?: number,
        gameId?: string,
        screenResolution?: { width: number; height: number } | null,
        viewport?: { width: number; height: number } | null
    ): ISerializedReportState {
        return {
            description: sanitizeForJson(description),
            gameState,
            playerReportType,
            reporter: {
                id: user.getId(),
                username: user.getUsername(),
                playerInGameState: 'player1'
            },
            opponent: {
                id: opponent.id,
                username: opponent.username,
                playerInGameState: 'player2'
            },
            lobbyId,
            gameId,
            messages,
            timestamp: new Date().toISOString(),
            screenResolution,
            viewport,
            gameStepsSinceLastUndo: gameStepsSinceLastUndo == null ? 'N/A' : gameStepsSinceLastUndo.toString(),
            gameFormat,
            matchType
        };
    }
}


// Helper function to sanitize strings for JSON
function sanitizeForJson(str: string): string {
    if (!str) {
        return '';
    }
    return str
        .replace(/\\/g, '\\\\')     // Backslashes
        .replace(/"/g, '\\"')       // Double quotes
        .replace(/\n/g, '\\n')      // New lines
        .replace(/\r/g, '\\r')      // Carriage returns
        .replace(/\t/g, '\\t')      // Tabs
        .replace(/\f/g, '\\f')      // Form feeds
        .replace(/[\u0000-\u001F\u007F-\u009F]/g, ''); // Control characters
}

