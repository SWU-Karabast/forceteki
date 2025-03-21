import { DynamoDBService } from '../../services/DynamoDBService';
import type { IDeckData, ILocalStorageDeckData } from '../../services/DynamoDBInterfaces';
import { logger } from '../../logger';
import { v4 as uuid } from 'uuid';

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
    public async getUserDecksFavouritesFirst(userId: string): Promise<ILocalStorageDeckData[]> {
        try {
            // Get all decks for the user
            const decks = await this.dbService.getUserDecks(userId);
            if (!decks || decks.length === 0) {
                return [];
            }

            return decks
                .map((deckData) => ({
                    // Extract just the inner deck object which matches ILocalStorageDeckData
                    ...deckData.deck,
                    deckID: deckData.id
                }))
                .sort((a, b) => {
                    // First sort by favorite status (favorites first)
                    if (a.favourite && !b.favourite) {
                        return -1;
                    }
                    if (!a.favourite && b.favourite) {
                        return 1;
                    }
                    // Then alphabetically by name if needed
                    return a.name.localeCompare(b.name);
                });
        } catch (error) {
            logger.error(`Error retrieving decks for user ${userId}:`, error);
            return [];
        }
    }

    /**
     * Syncs decks from localstorage for the user.
     * @param userId The user ID
     * @param unsyncedDecks decks that are in localstorage and not in the database
     */
    public async syncDecks(userId: string, unsyncedDecks: ILocalStorageDeckData[]) {
        try {
            // First get existing decks
            const existingDecks = await this.dbService.getUserDecks(userId) || [];

            // if we create a map it will be faster to lookup.
            const existingDeckLinks = new Map();
            existingDecks.forEach((deck) => {
                if (deck.deck.deckLink) {
                    existingDeckLinks.set(deck.deck.deckLink, deck);
                }
            });

            for (const unsyncedDeck of unsyncedDecks) {
                // skip if deck link already exists
                if (unsyncedDeck.deckLink && existingDeckLinks.has(unsyncedDeck.deckLink)) {
                    continue;
                }

                // Create new deck entry with proper format
                const deckData: IDeckData = {
                    id: uuid(), // Generate a unique ID for the deck
                    userId: userId,
                    deck: {
                        leader: { id: unsyncedDeck.leader.id },
                        base: { id: unsyncedDeck.base.id },
                        name: unsyncedDeck.name,
                        favourite: unsyncedDeck.favourite,
                        deckLink: unsyncedDeck.deckLink,
                        deckLID: unsyncedDeck.deckLID,
                        source: unsyncedDeck.source
                    },
                    stats: {
                        wins: 0,
                        losses: 0,
                        draws: 0
                    }
                };
                await this.dbService.saveDeck(deckData);
            }
        } catch (error) {
            logger.error(`Error syncing decks ${unsyncedDecks} for user ${userId}: `, error);
            throw error;
        }
    }
}