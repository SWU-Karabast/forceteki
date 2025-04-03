import { dynamoDbService } from '../../services/DynamoDBService';
import type { IDeckDataEntity, IDeckStatsEntity, ILocalStorageDeckData } from '../../services/DynamoDBInterfaces';
import { logger } from '../../logger';
import { v4 as uuid } from 'uuid';
import type { User } from '../user/User';
import * as Contract from '../../game/core/utils/Contract';
import { ScoreType } from './DeckInterfaces';

/**
 * Service class for handling deck-related operations
 */
export class DeckService {
    private dbService: typeof dynamoDbService = dynamoDbService;

    /**
     * Get all decks for a user with favorites first
     * @param userId The user ID
     * @returns Array of user decks with favorites first
     */
    public async getUserDecks(userId: string): Promise<ILocalStorageDeckData[]> {
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
                }));
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
                if (deck.deck.deckLinkID) {
                    existingDeckLinks.set(deck.deck.deckLinkID, deck);
                }
            });

            for (const unsyncedDeck of unsyncedDecks) {
                // skip if deck link already exists
                if (unsyncedDeck.deckLinkID && existingDeckLinks.has(unsyncedDeck.deckLinkID)) {
                    continue;
                }

                // Create new deck entry with proper format
                const deckData: IDeckDataEntity = {
                    id: uuid(), // Generate a unique ID for the deck
                    userId: userId,
                    deck: {
                        leader: { id: unsyncedDeck.leader.id },
                        base: { id: unsyncedDeck.base.id },
                        name: unsyncedDeck.name,
                        favourite: unsyncedDeck.favourite,
                        deckLink: unsyncedDeck.deckLink,
                        deckLinkID: unsyncedDeck.deckLinkID,
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
    public async saveDeck(deckData: IDeckDataEntity, user: User): Promise<string> {
        try {
            // Make sure the deck has the required fields
            if (!deckData.userId || !deckData.deck) {
                throw new Error('Deck data is missing required fields "userId" and "deck"');
            }

            // Check if a deck with this link id already exists for this user
            const deckLinkID = deckData.deck.deckLinkID;
            let updatedDeckData = null;
            const existingDeck = await this.dbService.getDeckByLink(user.getId(), deckLinkID);
            if (deckLinkID && existingDeck) {
                // If the deck already exists, update it instead of creating a new one
                logger.info(`DeckService: Deck with link ${deckLinkID} already exists for user ${user.getUsername()}, updating existing deck`);
                // Use the existing deck's ID
                updatedDeckData = {
                    ...deckData,
                    id: existingDeck.id
                };
            } else {
                // If no existing deck with the same link, or no link provided, create a new deck
                const newDeckId = uuid();
                deckData.deck.favourite = false;
                updatedDeckData = {
                    ...deckData,
                    userId: user.getId(),
                    id: newDeckId,
                };
            }
            // Save the new deck to the database
            await this.dbService.saveDeck(updatedDeckData);
            logger.info(`DeckService: Saved/updated new deck ${updatedDeckData.id} for user ${deckData.userId}`);
            return updatedDeckData;
        } catch (error) {
            logger.error(`Error saving deck for user ${user.getId()}:`, error);
            throw error;
        }
    }

    /**
     * Toggle the favorite status of a deck
     * @param userId User ID
     * @param deckId Deck ID
     * @param isFavorite Whether the deck should be marked as favorite
     * @returns Promise resolving to true if successful, false otherwise
     */
    public async toggleDeckFavorite(userId: string, deckId: string, isFavorite: boolean): Promise<IDeckDataEntity> {
        Contract.assertTrue(userId && deckId && isFavorite != null, `userId ${userId} or deckId ${deckId} or isFavorite ${isFavorite} doesn't exist`);
        try {
            // Get the deck using our flexible lookup method
            const deck = await this.getDeckById(userId, deckId);

            // If not found, return false
            if (!deck) {
                logger.error(`DeckService: Deck ${deckId} not found for user ${userId} when trying to toggle favorite`);
                throw new Error(`DeckService: Deck ${deckId} not found for user ${userId} when trying to toggle favorite`);
            }

            // Update the favorite status
            deck.deck.favourite = isFavorite;

            // Save the updated deck
            await this.dbService.saveDeck(deck);

            logger.info(`DeckService: Successfully ${isFavorite ? 'added' : 'removed'} deck ${deckId} as favorite for user ${userId}`);
            return deck;
        } catch (error) {
            logger.error(`DeckService: Error toggling favorite for deck ${deckId}, user ${userId}:`, error);
            throw error;
        }
    }

    /**
     * Delete multiple decks for a user
     * @param userId The user ID
     * @param deckId Array of deck IDs to delete
     * @returns Promise that resolves to an array of successfully deleted deck IDs
     */
    public async deleteDeck(userId: string, deckId: string) {
        try {
            Contract.assertTrue(
                userId && deckId.length > 0,
                `DeckService: Invalid parameters for delete operation. userId: ${userId}, deckId: ${deckId}`
            );
            // Verify the deck belongs to this user before deleting
            const deck = await this.dbService.getDeck(userId, deckId);
            if (!deck) {
                logger.warn(`DeckService: Deck ${deckId} not found for user ${userId}`);
                return;
            }

            // Delete the deck
            await this.dbService.deleteItem(`USER#${userId}`, `DECK#${deckId}`);
            logger.info(`DeckService: Successfully deleted deck ${deckId} for user ${userId}`);
            return;
        } catch (error) {
            logger.error(`DeckService: Error deleting deck ${deckId} for user ${userId}:`, error);
            return;
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
        result: ScoreType,
        opponentLeaderId: string,
        opponentBaseId: string
    ): Promise<IDeckStatsEntity> {
        try {
            // Get the deck using our new flexible lookup method
            const deck = await this.getDeckById(userId, deckId);

            // If not found after all lookup methods, throw error
            if (!deck) {
                throw new Error(`Deck with ID ${deckId} not found for user ${userId}`);
            }

            // Initialize stats if they don't exist
            const stats: IDeckStatsEntity = deck.stats || {
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
            switch (result) {
                case ScoreType.Win:
                    stats.wins += 1;
                    break;
                case ScoreType.Lose:
                    stats.losses += 1;
                    break;
                case ScoreType.Draw:
                    stats.draws += 1;
                    break;
                default:
                    Contract.fail(`Invalid match result: ${result}`);
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
            switch (result) {
                case ScoreType.Win:
                    opponentStat.wins += 1;
                    break;
                case ScoreType.Lose:
                    opponentStat.losses += 1;
                    break;
                case ScoreType.Draw:
                    opponentStat.draws += 1;
                    break;
                default:
                    Contract.fail(`Invalid match result for opponent stats: ${result}`);
            }
            // Save updated stats
            await this.dbService.updateDeckStats(userId, deckId, stats);
            logger.info(`DeckService: Updated stats for deck ${deckId}, user ${userId}, result: ${result}, opponent leader: ${opponentLeaderId}, opponent base: ${opponentBaseId}, stats: ${stats}`);
            return stats;
        } catch (error) {
            logger.error(`Error updating deck stats for deck ${deckId}, user ${userId}:`, error);
            throw error;
        }
    }

    /**
     * Get a deck by its ID, with fallback to check deckID and deckLinkID properties
     * @param userId User ID
     * @param deckId Deck ID, deckID, or deckLinkID to search for
     * @returns Promise that resolves to the deck data if found, null otherwise
     */
    public async getDeckById(userId: string, deckId: string): Promise<IDeckDataEntity | null> {
        try {
            // First, try direct lookup by ID
            let deck = await this.dbService.getDeck(userId, deckId);

            // If found directly, return it
            if (deck) {
                return deck;
            }

            // If not found directly, try to find by deckID or deckLinkID property
            logger.info(`DeckService: Deck with ID ${deckId} not found directly for user ${userId}, trying to find by deckID/deckLinkID properties`);

            // Get all decks for the user
            const allDecks = await this.dbService.getUserDecks(userId);

            if (allDecks && allDecks.length > 0) {
                // Find a deck where deck.deck.deckLID or deck.deck.deckID matches the provided deckId
                deck = allDecks.find((d) =>
                    (d.deck.deckLinkID && d.deck.deckLinkID === deckId)
                );

                if (deck) {
                    logger.info(`DeckService: Found deck with matching deckID/deckLinkID property: ${deck.id}`);
                    return deck;
                }
            }

            // Not found by any method
            logger.error(`DeckService: Deck with ID ${deckId} not found for user ${userId} (checked both direct ID and deckID/deckLinkID properties)`);
            return null;
        } catch (error) {
            logger.error(`Error getting deck by ID ${deckId} for user ${userId}:`, error);
            return null;
        }
    }
}