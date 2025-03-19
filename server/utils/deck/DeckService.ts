import { DynamoDBService } from '../../services/DynamoDBService';
import type { IDeckData } from '../../services/DynamoDBInterfaces';
import { logger } from '../../logger';


/**
 * Service class for handling deck-related operations
 */
export class DeckService {
    private dbService: DynamoDBService;
    private static instance: DeckService;

    /**
     * Get the singleton instance of DeckService
     */
    public static getInstance(): DeckService {
        if (!DeckService.instance) {
            DeckService.instance = new DeckService();
        }
        return DeckService.instance;
    }

    /**
     * Private constructor to enforce singleton pattern
     */
    private constructor() {
        this.dbService = DynamoDBService.getInstance();
    }

    /**
     * Get all decks for a user with favorites first
     * @param userId The user ID
     * @returns Array of user decks with favorites first
     */
    public async getUserDecksFavouritesFirst(userId: string): Promise<IDeckData[]> {
        try {
            // Get all decks for the user
            const decks = await this.dbService.getUserDecks(userId);

            if (!decks || decks.length === 0) {
                return [];
            }

            // Sort the decks to put favorites first, then sort by updated date (newest first)
            return decks.sort((a, b) => {
                // First sort by favorite status (favorites first)
                if (a.deck.favourite && !b.deck.favourite) {
                    return -1;
                }
                if (!a.deck.favourite && b.deck.favourite) {
                    return 1;
                }
                return 1;
            });
        } catch (error) {
            logger.error(`Error retrieving decks for user ${userId}:`, error);
            return [];
        }
    }
}