import type { User } from '../user/User';
import type {
    ISerializedGameState,
    ISerializedReportState, MessageText
} from '../../game/Interfaces';

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
export function formatBugReport(
    description: string,
    gameState: ISerializedGameState,
    user: User,
    opponent: User,
    messages: { date: Date; message: MessageText | { alert: { type: string; message: string | string[] } } }[],
    lobbyId: string,
    gameStepsSinceLastUndo?: number,
    gameId?: string,
    screenResolution?: { width: number; height: number } | null,
    viewport?: { width: number; height: number } | null
): ISerializedReportState {
    return {
        description: sanitizeForJson(description),
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
        screenResolution,
        viewport,
        gameStepsSinceLastUndo: gameStepsSinceLastUndo == null ? 'N/A' : gameStepsSinceLastUndo.toString()
    };
}
