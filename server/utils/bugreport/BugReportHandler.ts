import FormData from 'form-data';
import { logger } from '../../logger';
import type { User } from '../user/User';
import { httpPostFormData } from '../../Util';
import type {
    ISerializedGameState,
    ISerializedReportState
} from '../../game/Interfaces';

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
    public async sendBugReportToDiscord(bugReport: ISerializedReportState): Promise<boolean> {
        try {
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
            throw error;
        }
    }

    // Helper function to sanitize strings for JSON
    private sanitizeForJson(str: string): string {
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


    /**
     * Format the bug report as a Discord message
     * @param bugReport The bug report data
     * @returns Formatted Discord message object
     */
    private formatDiscordMessage(bugReport: ISerializedReportState): { content: string; embeds: any[] } {
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
            }
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

        return {
            content: `New bug report from **${bugReport.reporter.username}**!`,
            embeds: [
                {
                    title: 'Bug Report',
                    color: 0xFF0000, // Red color
                    description: embedDescription,
                    fields,
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
     * @param screenResolution Optional screen resolution information
     * @returns Formatted bug report object
     */
    public createBugReport(
        description: string,
        gameState: ISerializedGameState,
        user: User,
        lobbyId: string,
        gameId?: string,
        screenResolution?: { width: number; height: number } | null,
        viewport?: { width: number; height: number } | null
    ): ISerializedReportState {
        return {
            description: this.sanitizeForJson(description),
            gameState,
            reporter: {
                id: user.getId(),
                username: user.getUsername(),
                playerInGameState: 'player1'
            },
            lobbyId,
            gameId,
            timestamp: new Date().toISOString(),
            screenResolution: screenResolution,
            viewport: viewport
        };
    }
}