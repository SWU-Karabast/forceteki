import { DynamoDBService } from '../../services/DynamoDBService';
import type {IDeckData, IDeckStats, ILocalStorageDeckData} from '../../services/DynamoDBInterfaces';
import { logger } from '../../logger';
import { v4 as uuid } from 'uuid';
import type { User } from '../user/User';

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
                        draws: 0,
                        opponentStats: []
                    }
                };
                await this.dbService.saveDeck(deckData);
            }
        } catch (error) {
            logger.error(`Error syncing decks ${unsyncedDecks} for user ${userId}: `, error);
            throw error;
        }
    }


    /**
     * Save a deck to the database, checking first if a deck with the same link already exists
     * @param deckData The deck data to save
     * @param user submitting user
     * @returns Promise that resolves to the saved deck ID
     */
    public async saveDeck(deckData: IDeckData, user: User): Promise<string> {
        try {
            // Make sure the deck has the required fields
            if (!deckData.userId || !deckData.deck) {
                throw new Error('Deck data is missing required fields');
            }

            // Check if a deck with this link already exists for this user
            const deckLink = deckData.deck.deckLink;
            if (deckLink) {
                const existingDeck = await this.dbService.getDeckByLink(user.getId(), deckLink);

                if (existingDeck) {
                    // If the deck already exists, update it instead of creating a new one TODO delete this after dev
                    logger.info(`DeckService: Deck with link ${deckLink} already exists for user ${user.getUsername()}, updating existing deck`);

                    // Use the existing deck's ID
                    const updatedDeckData = {
                        ...deckData,
                        id: existingDeck.id
                    };

                    // Update existing deck
                    await this.dbService.saveDeck(updatedDeckData);
                    return existingDeck.id;
                }
            }

            // If no existing deck with the same link, or no link provided, create a new deck
            const newDeckId = uuid();
            deckData.deck.favourite = false;
            const newDeckData = {
                ...deckData,
                userId: user.getId(),
                id: newDeckId,
            };

            // Save the new deck to the database
            await this.dbService.saveDeck(newDeckData);

            logger.info(`DeckService: Saved new deck ${newDeckId} for user ${deckData.userId}`);
            return newDeckId;
        } catch (error) {
            logger.error(`Error saving deck for user ${user.getId()}:`, error);
            throw error;
        }
    }

    /**
     * Delete multiple decks for a user
     * @param userId The user ID
     * @param deckIds Array of deck IDs to delete
     * @returns Promise that resolves to an array of successfully deleted deck IDs
     */
    public async deleteDecks(userId: string, deckIds: string[]): Promise<string[]> {
        try {
            if (!userId || !deckIds || deckIds.length === 0) {
                logger.warn(`DeckService: Invalid parameters for delete operation. userId: ${userId}, deckIds: ${deckIds}`);
                return [];
            }

            const deletedDeckIds: string[] = [];
            const failedDeckIds: string[] = [];

            // Process each deck deletion individually to handle errors gracefully
            for (const deckId of deckIds) {
                try {
                    // Verify the deck belongs to this user before deleting
                    const deck = await this.dbService.getDeck(userId, deckId);
                    if (!deck) {
                        logger.warn(`DeckService: Deck ${deckId} not found for user ${userId} or does not belong to them.`);
                        failedDeckIds.push(deckId);
                        continue;
                    }

                    // Delete the deck
                    await this.dbService.deleteItem(`USER#${userId}`, `DECK#${deckId}`);
                    deletedDeckIds.push(deckId);
                    logger.info(`DeckService: Successfully deleted deck ${deckId} for user ${userId}`);
                } catch (error) {
                    logger.error(`DeckService: Error deleting deck ${deckId} for user ${userId}:`, error);
                    failedDeckIds.push(deckId);
                }
            }

            if (failedDeckIds.length > 0) {
                logger.warn(`DeckService: Failed to delete ${failedDeckIds.length} decks: ${failedDeckIds.join(', ')}`);
            }

            return deletedDeckIds;
        } catch (error) {
            logger.error(`DeckService: Error during batch delete operation for user ${userId}:`, error);
            throw error;
        }
    }

    /**
     * Update deck statistics after a game
     * @param userId User ID
     * @param deckId Deck ID
     * @param result Game result ('win', 'loss', or 'draw')
     * @param opponentLeaderId Opponent's leader ID
     * @param opponentBaseId Opponent's base ID
     * @returns Promise that resolves to the updated deck stats
     */
    public async updateDeckStats(
        userId: string,
        deckId: string,
        result: 'win' | 'loss' | 'draw',
        opponentLeaderId: string,
        opponentBaseId: string
    ): Promise<IDeckStats> {
        try {
            // Get the deck using our new flexible lookup method
            const deck = await this.getDeckById(userId, deckId);

            // If not found after all lookup methods, throw error
            if (!deck) {
                throw new Error(`Deck with ID ${deckId} not found for user ${userId}`);
            }

            // Initialize stats if they don't exist
            const stats: IDeckStats = deck.stats || {
                wins: 0,
                losses: 0,
                draws: 0,
                opponentStats: []
            };

            // Ensure opponentStats exists
            if (!stats.opponentStats) {
                stats.opponentStats = [];
            }

            // Update overall stats
            if (result === 'win') {
                stats.wins += 1;
            } else if (result === 'loss') {
                stats.losses += 1;
            } else {
                stats.draws += 1;
            }

            // Find or create opponent stat
            let opponentStat = stats.opponentStats.find((stat) =>
                stat.leaderId === opponentLeaderId && stat.baseId === opponentBaseId
            );
            if (!opponentStat) {
                opponentStat = {
                    leaderId: opponentLeaderId,
                    baseId: opponentBaseId,
                    wins: 0,
                    losses: 0,
                    draws: 0
                };
                stats.opponentStats.push(opponentStat);
            }

            // Update opponent-specific stats
            if (result === 'win') {
                opponentStat.wins += 1;
            } else if (result === 'loss') {
                opponentStat.losses += 1;
            } else {
                opponentStat.draws += 1;
            }

            // Save updated stats
            await this.dbService.updateItem(
                `USER#${userId}`,
                `DECK#${deckId}`,
                'SET stats = :stats',
                { ':stats': stats }
            );

            logger.info(`DeckService: Updated stats for deck ${deckId}, user ${userId}, result: ${result}, opponent leader: ${opponentLeaderId}, opponent base: ${opponentBaseId}`);
            return stats;
        } catch (error) {
            logger.error(`Error updating deck stats for deck ${deckId}, user ${userId}:`, error);
            throw error;
        }
    }

    /**
     * Get a deck by its ID, with fallback to check deckID and deckLID properties
     * @param userId User ID
     * @param deckId Deck ID, deckID, or deckLID to search for
     * @returns Promise that resolves to the deck data if found, null otherwise
     */
    public async getDeckById(userId: string, deckId: string): Promise<IDeckData | null> {
        try {
            // First, try direct lookup by ID
            let deck = await this.dbService.getDeck(userId, deckId);

            // If found directly, return it
            if (deck) {
                return deck;
            }

            // If not found directly, try to find by deckID or deckLID property
            logger.info(`DeckService: Deck with ID ${deckId} not found directly for user ${userId}, trying to find by deckID/deckLID properties`);

            // Get all decks for the user
            const allDecks = await this.dbService.getUserDecks(userId);

            if (allDecks && allDecks.length > 0) {
                // Find a deck where deck.deck.deckLID or deck.deck.deckID matches the provided deckId
                deck = allDecks.find((d) =>
                    (d.deck.deckLID && d.deck.deckLID === deckId)
                );

                if (deck) {
                    logger.info(`DeckService: Found deck with matching deckID/deckLID property: ${deck.id}`);
                    return deck;
                }
            }

            // Not found by any method
            logger.info(`DeckService: Deck with ID ${deckId} not found for user ${userId} (checked both direct ID and deckID/deckLID properties)`);
            return null;
        } catch (error) {
            logger.error(`Error getting deck by ID ${deckId} for user ${userId}:`, error);
            return null;
        }
    }
}