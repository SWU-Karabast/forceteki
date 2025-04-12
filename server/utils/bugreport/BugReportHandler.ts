import FormData from 'form-data';
import { logger } from '../../logger';
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
    public async sendBugReportToDiscord(bugReport: string): Promise<boolean> {
        try {
            // Always log the bug report
            logger.info(`Bug report received ${bugReport}`, {
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
            const gameStateJson = '{JUST ANOTHER FILE}';
            const fileName = `bug-report-${bugReport}-${new Date().getTime()}.json`;
            formData.append('files[0]', Buffer.from(gameStateJson), {
                filename: fileName,
                contentType: 'application/json',
            });

            // Send to Discord webhook with file attachment using our custom function
            await httpPostFormData(this.discordWebhookUrl, formData);

            logger.info('Bug report successfully sent to Discord');
            return true;
        } catch (error) {
            logger.error('Failed to send bug report to Discord', {
                error: { message: error.message, stack: error.stack },
                lobbyId: bugReport
            });
            throw error;
        }
    }

    /**
     * Format the bug report as a Discord message
     * @param bugReport The bug report data
     * @returns Formatted Discord message object
     */
    private formatDiscordMessage(bugReport: string): { content: string; embeds: any[] } {
        // Truncate description if it's too long for Discord embeds
        const embedDescription = bugReport.length > 1024
            ? bugReport.substring(0, 1021) + '...'
            : bugReport;

        return {
            content: 'New bug report from **TEST**!',
            embeds: [
                {
                    title: 'Bug Report',
                    color: 0xFF0000, // Red color
                    description: embedDescription,
                    fields: [
                        {
                            name: 'Reporter',
                            value: 'test',
                            inline: true
                        },
                        {
                            name: 'Lobby ID',
                            value: 'test',
                            inline: true
                        },
                        {
                            name: 'Game ID',
                            value: 'N/A',
                            inline: true
                        },
                        {
                            name: 'Timestamp',
                            value: 'test',
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
}