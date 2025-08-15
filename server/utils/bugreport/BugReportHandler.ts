import { logger } from '../../logger';
import type { User } from '../user/User';
import type {
    ISerializedGameState,
    ISerializedReportState, MessageText
} from '../../game/Interfaces';
import type { IDiscordDispatcher } from '../../game/core/DiscordDispatcher';
import { DiscordDispatcher } from '../../game/core/DiscordDispatcher';

export class BugReportHandler {
    private readonly discordDispatcher: IDiscordDispatcher = new DiscordDispatcher();

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
            // Create Discord message content
            const discordResponse = await this.discordDispatcher.formatAndSendBugReportAsync(bugReport);
            if (discordResponse === false) {
                return false;
            }

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
     * Create a bug report object from provided data
     * @param description User description of the bug
     * @param gameState Current game state snapshot
     * @param user User reporting the bug
     * @param opponent
     * @param messages
     * @param lobbyId ID of the lobby where the bug occurred
     * @param gameId Optional ID of the game where the bug occurred
     * @param screenResolution Optional screen resolution information
     * @param viewport Optional viewport information
     * @returns Formatted bug report object
     */
    public createBugReport(
        description: string,
        gameState: ISerializedGameState,
        user: User,
        opponent: User,
        messages: { date: Date; message: MessageText | { alert: { type: string; message: string | string[] } } }[],
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
            opponent: {
                id: opponent.getId(),
                username: opponent.getUsername(),
                playerInGameState: 'player2'
            },
            lobbyId,
            gameId,
            messages,
            timestamp: new Date().toISOString(),
            screenResolution: screenResolution,
            viewport: viewport
        };
    }
}