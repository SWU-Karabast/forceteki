import FormData from 'form-data';

import { httpPostFormData } from '../../Util';
import type { ISerializedReportState, ISerializedUndoFailureState, MessageText } from '../Interfaces';
import { logger } from '../../logger';

interface IDiscordFormat {
    content: string;
    embeds: any[];
}

type EitherPostResponseOrBoolean = string | boolean;

export interface IDiscordDispatcher {

    /**
     * Format the bug report as a Discord message and dispatch it
     * @param bugReport The bug report data
     * @returns Promise that returns the response body as a string if successful, throws an error otherwise
     */
    formatAndSendBugReportAsync(bugReport: ISerializedReportState): Promise<EitherPostResponseOrBoolean>;

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
    formatAndSendServerErrorAsync(description: string, error: Error, lobbyId: string): Promise<EitherPostResponseOrBoolean>;
}

export class DiscordDispatcher implements IDiscordDispatcher {
    private static readonly MaxServerErrorCount = 3;
    private static readonly MaxUndoErrorCount = 3;
    private readonly _bugReportWebhookUrl: string;
    private readonly _serverErrorWebhookUrl: string;
    private _bugReportErrorCount = 0;
    private _serverErrorCount = 0;
    private _undoErrorCount = 0;

    public constructor() {
        this._bugReportWebhookUrl = process.env.DISCORD_BUG_REPORT_WEBHOOK_URL || '';
        this._serverErrorWebhookUrl = process.env.DISCORD_ERROR_REPORT_WEBHOOK_URL || '';
        if (process.env.NODE_ENV !== 'development' && process.env.NODE_ENV !== 'test') {
            if (!this._bugReportWebhookUrl) {
                throw new Error('No Discord webhook URL configured for bug reports. Bug reports cannot be sent to Discord.');
            }
            if (!this._serverErrorWebhookUrl) {
                throw new Error('No Discord webhook URL configured for server error reports. Server error reports cannot be sent to Discord.');
            }
        }
    }

    public async formatAndSendBugReportAsync(bugReport: ISerializedReportState): Promise<EitherPostResponseOrBoolean> {
        // Always log the bug report
        const logData = {
            lobbyId: bugReport.lobbyId,
            reporterId: bugReport.reporter.id,
            description: bugReport.description,
            gameStateJson: JSON.stringify(bugReport.gameState, null, 0)
        };

        // Only add screen resolution and viewport to log if they exist
        if (bugReport.screenResolution) {
            Object.assign(logData, { screenResolution: bugReport.screenResolution });
        }

        if (bugReport.viewport) {
            Object.assign(logData, { viewport: bugReport.viewport });
        }

        logger.info(`Bug report received from user ${bugReport.reporter.username}`, logData);

        if (!this._bugReportWebhookUrl) {
            // If no webhook URL is configured, just log it
            if (process.env.NODE_ENV !== 'test') {
                logger.warn('Bug report could not be sent to Discord: No webhook URL configured for bug reports');
            }

            return false;
        }

        this._bugReportErrorCount++;
        // Truncate description if it's too long for Discord embeds
        const embedDescription = bugReport.description.length > 1024
            ? bugReport.description.substring(0, 1021) + '...'
            : bugReport.description;

        // Prepare fields for embed
        const fields = [
            {
                name: 'Reporter',
                value: `${bugReport.reporter.username} (player1)`,
                inline: true,
            },
            {
                name: 'Lobby ID',
                value: bugReport.lobbyId,
                inline: true,
            },
            {
                name: 'Game ID',
                value: bugReport.gameId || 'N/A',
                inline: true,
            },
            {
                name: 'Timestamp',
                value: bugReport.timestamp,
                inline: true,
            },
        ];

        // Add screen resolution if available
        if (bugReport.screenResolution) {
            fields.push({
                name: 'Screen Resolution',
                value: `${bugReport.screenResolution.width}x${bugReport.screenResolution.height}`,
                inline: true
            });
        }

        // Add viewport information if available
        if (bugReport.viewport) {
            fields.push({
                name: 'Viewport',
                value: `${bugReport.viewport.width}x${bugReport.viewport.height}`,
                inline: true
            });
        }

        // Add game state field
        fields.push({
            name: 'Game State',
            value: 'See attached JSON file for complete game state',
            inline: false
        });

        // Create FormData for sending file attachment
        const formData = new FormData();

        const data: IDiscordFormat = {
            content: `New bug report from **${bugReport.reporter.username}**!`,
            embeds: [
                {
                    title: 'Bug Report',
                    color: 0xFF0000, // Red color
                    description: embedDescription,
                    fields,
                    timestamp: new Date().toISOString(),
                },
            ]
        };

        // Add the message payload
        formData.append('payload_json', JSON.stringify(data));

        // Add the game state as a file attachment
        const gameStateJson = JSON.stringify(bugReport.gameState, null, 2);
        const fileName = `bug-report-${bugReport.lobbyId}-${new Date().getTime()}.json`;
        formData.append('files[0]', Buffer.from(gameStateJson), {
            filename: fileName,
            contentType: 'application/json',
        });

        // Add the messages as a text file attachment
        const messagesText = DiscordDispatcher.formatMessagesToText(bugReport.messages, bugReport.reporter.id, bugReport.opponent.id);
        const messagesFileName = `bug-report-messages-${bugReport.lobbyId}-${new Date().getTime()}.txt`;
        formData.append('files[1]', Buffer.from(messagesText), {
            filename: messagesFileName,
            contentType: 'text/plain',
        });

        // Send to Discord webhook with file attachment using our custom function
        try {
            // Create Discord message content
            await httpPostFormData(this._bugReportWebhookUrl, formData);

            logger.info(`Bug report successfully sent to Discord from user ${bugReport.reporter.username}`, {
                lobbyId: bugReport.lobbyId
            });

            return true;
        } catch (error) {
            logger.error('Failed to send bug report to Discord', {
                error: { message: error.message, stack: error.stack },
                lobbyId: bugReport.lobbyId
            });
            throw error;
        }
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

    public formatAndSendServerErrorAsync(description: string, error: Error, lobbyId: string): Promise<EitherPostResponseOrBoolean> {
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
                name: 'Server Error Description',
                value: embedDescription,
                inline: false,
            },
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

        const fileName = `server-error-stack-trace-${lobbyId}-${new Date().getTime()}.txt`;
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
    private static formatMessagesToText(messages: { date: Date; message: MessageText | { alert: { type: string; message: string | string[] } } }[], reporter: string, opponent: string): string {
        return messages.map((messageEntry) => {
            const message = messageEntry.message;

            // Handle alert messages
            if (typeof message === 'object' && 'alert' in message) {
                const alertMessage = Array.isArray(message.alert.message)
                    ? message.alert.message.join(' ')
                    : message.alert.message;
                return `[ALERT - ${message.alert.type}] ${alertMessage}`;
            }

            // Handle regular messages (arrays)
            if (Array.isArray(message)) {
                // Convert message array to string, handling objects within the array
                const messageText = message.map((part) => {
                    if (typeof part === 'string' || typeof part === 'number') {
                        return part;
                    } else if (part && typeof part === 'object' && 'name' in part) {
                        return part['id'] === reporter ? 'Player1' : part['id'] === opponent ? 'Player2' : part['name'];
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
}