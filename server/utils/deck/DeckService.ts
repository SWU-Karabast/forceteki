import type {
    IDeckDataEntity,
    IDeckStatsEntity,
    IFeMatchupStatEntity,
    ILocalStorageDeckData,
    IMatchupStatEntity
} from '../../services/DynamoDBInterfaces';
import { logger } from '../../logger';
import { v4 as uuid } from 'uuid';
import type { User } from '../user/User';
import * as Contract from '../../game/core/utils/Contract';
import { ScoreType } from './DeckInterfaces';
import type { CardDataGetter } from '../cardData/CardDataGetter';
import { getDynamoDbServiceAsync } from '../../services/DynamoDBService';

/**
 * Service class for handling deck-related operations
 */
export class DeckService {
    private dbServicePromise = getDynamoDbServiceAsync();
    private readonly baseMapping30 = {
        aggression: '30hp-aggression-base',
        command: '30hp-command-base',
        cunning: '30hp-cunning-base',
        vigilance: '30hp-vigilance-base'
    };

    private readonly baseMapping28 = {
        aggression: '28hp-aggression-force-base',
        command: '28hp-command-force-base',
        cunning: '28hp-cunning-force-base',
        vigilance: '28hp-vigilance-force-base'
    };


    /**
     * Get all decks for a user with favorites first
     * @param userId The user ID
     * @returns Array of user decks with favorites first
     */
    public async getUserDecksAsync(userId: string): Promise<ILocalStorageDeckData[]> {
        try {
            const dbService = await this.dbServicePromise;
            // Get all decks for the user
            const decks = await dbService.getUserDecksAsync(userId);
            if (!decks || decks.length === 0) {
                return [];
            }

            return decks
                .map((deckData) => ({
                    // Extract just the inner deck object which matches ILocalStorageDeckData
                    ...deckData.deck,
                    deckID: deckData.id,
                }));
        } catch (error) {
            logger.error(`Error retrieving decks for user ${userId}:`, { error: { message: error.message, stack: error.stack } });
            throw error;
        }
    }

    /**
     * Syncs decks from localstorage for the user.
     * @param userId The user ID
     * @param unsyncedDecks decks that are in localstorage and not in the database
     */
    public async syncDecksAsync(userId: string, unsyncedDecks: ILocalStorageDeckData[]) {
        try {
            // First get existing decks
            const dbService = await this.dbServicePromise;
            const existingDecks = await dbService.getUserDecksAsync(userId) || [];

            // if we create a map it will be faster to lookup.
            const existingDeckLinks = new Map();
            for (const deck of existingDecks) {
                if (deck.deck.deckLink) {
                    existingDeckLinks.set(deck.deck.deckLink, deck);
                }
            }
            for (const unsyncedDeck of unsyncedDecks) {
                // skip if deck link already exists
                if (unsyncedDeck.deckLink && existingDeckLinks.has(unsyncedDeck.deckLink)) {
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
                        deckLinkID: unsyncedDeck.deckLinkID ?? unsyncedDeck.deckID,
                        source: unsyncedDeck.source
                    },
                    stats: {
                        wins: 0,
                        losses: 0,
                        draws: 0,
                        statsByMatchup: []
                    }
                };
                await dbService.saveDeckAsync(deckData);
            }
        } catch (error) {
            logger.error(`Error syncing decks ${unsyncedDecks} for user ${userId}: `, { error: { message: error.message, stack: error.stack } });
            throw error;
        }
    }


    /**
     * Save a deck to the database, checking first if a deck with the same link already exists
     * @param deckData The deck data to save
     * @param user submitting user
     * @returns Promise that resolves to the saved deck ID
     */
    public async saveDeckAsync(deckData: IDeckDataEntity, user: User): Promise<IDeckDataEntity> {
        try {
            // Make sure the deck has the required fields
            if (!deckData.userId || !deckData.deck) {
                throw new Error('Deck data is missing required fields "userId" and "deck"');
            }
            const dbService = await this.dbServicePromise;
            // Check if a deck with this link id already exists for this user
            const deckLinkID = deckData.deck.deckLinkID;
            let updatedDeckData = null;
            const existingDeck = await dbService.getDeckByLinkAsync(user.getId(), deckLinkID);
            if (deckLinkID && existingDeck) {
                // If the deck already exists don't do anything with it.
                logger.info(`DeckService: Deck with link ${deckLinkID} already exists for user ${user.getUsername()}.`);
                return existingDeck;
            }
            // If no existing deck with the same link, or no link provided, create a new deck
            const newDeckId = uuid();
            deckData.deck.favourite = false;
            updatedDeckData = {
                ...deckData,
                userId: user.getId(),
                id: newDeckId,
            };

            // Save the new deck to the database
            await dbService.saveDeckAsync(updatedDeckData);
            logger.info(`DeckService: Saved new deck ${updatedDeckData.id} for user ${deckData.userId}`);
            return updatedDeckData;
        } catch (error) {
            logger.error(`Error saving deck for user ${user.getId()}:`, { error: { message: error.message, stack: error.stack } });
            throw error;
        }
    }

    private updateScore(result: ScoreType, stats: IDeckStatsEntity | IMatchupStatEntity) {
        // Update stats
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
    }

    /**
     * Toggle the favorite status of a deck
     * @param userId User ID
     * @param deckId Deck ID
     * @param isFavorite Whether the deck should be marked as favorite
     * @returns Promise resolving to true if successful, false otherwise
     */
    public async toggleDeckFavoriteAsync(userId: string, deckId: string, isFavorite: boolean): Promise<IDeckDataEntity> {
        Contract.assertTrue(userId && deckId && isFavorite != null, `userId ${userId} or deckId ${deckId} or isFavorite ${isFavorite} doesn't exist`);
        try {
            const dbService = await this.dbServicePromise;
            // Get the deck using our flexible lookup method
            const deck = await this.getDeckByIdAsync(userId, deckId);

            // If not found, return false
            if (!deck) {
                logger.error(`DeckService: Deck ${deckId} not found for user ${userId} when trying to toggle favorite`);
                throw new Error(`DeckService: Deck ${deckId} not found for user ${userId} when trying to toggle favorite`);
            }

            // Update the favorite status
            deck.deck.favourite = isFavorite;

            // Save the updated deck
            await dbService.saveDeckAsync(deck);

            logger.info(`DeckService: Successfully ${isFavorite ? 'added' : 'removed'} deck ${deckId} as favorite for user ${userId}`);
            return deck;
        } catch (error) {
            logger.error(`DeckService: Error toggling favorite for deck ${deckId}, user ${userId}:`, { error: { message: error.message, stack: error.stack } });
            throw error;
        }
    }

    /**
     * Delete multiple decks for a user
     * @param userId The user ID
     * @param deckId Array of deck IDs to delete
     * @returns Promise that resolves to an array of successfully deleted deck IDs
     */
    public async deleteDeckAsync(userId: string, deckId: string) {
        try {
            const dbService = await this.dbServicePromise;
            Contract.assertTrue(
                userId && deckId.length > 0,
                `DeckService: Invalid parameters for delete operation. userId: ${userId}, deckId: ${deckId}`
            );
            // Verify the deck belongs to this user before deleting
            const deck = await dbService.getDeckAsync(userId, deckId);
            if (!deck) {
                logger.error(`DeckService: Deck ${deckId} not found for user ${userId}`);
                return null;
            }

            // Delete the deck
            await dbService.deleteItemAsync(`USER#${userId}`, `DECK#${deckId}`);
            logger.info(`DeckService: Successfully deleted deck ${deckId} for user ${userId}`);
            return deck.deck.deckLinkID;
        } catch (error) {
            logger.error(`DeckService: Error deleting deck ${deckId} for user ${userId}:`, { error: { message: error.message, stack: error.stack } });
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
    public async updateDeckStatsAsync(
        userId: string,
        deckId: string,
        result: ScoreType,
        opponentLeaderId: string,
        opponentBaseId: string,
    ): Promise<IDeckStatsEntity> {
        try {
            const dbService = await this.dbServicePromise;
            // Get the deck using our new flexible lookup method
            const deck = await this.getDeckByIdAsync(userId, deckId);
            Contract.assertNotNullLike(deck, `Deck with ID ${deckId} not found for user ${userId}`);

            // Initialize stats if they don't exist
            const stats: IDeckStatsEntity = deck.stats || {
                wins: 0,
                losses: 0,
                draws: 0,
                statsByMatchup: []
            };

            // Ensure opponentStats exists
            if (!stats.statsByMatchup) {
                stats.statsByMatchup = [];
            }

            // Update overall stats
            this.updateScore(result, stats);

            // Find or create opponent stat
            let opponentStat = stats.statsByMatchup.find((stat) =>
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
                stats.statsByMatchup.push(opponentStat);
            }

            this.updateScore(result, opponentStat);
            // Save updated stats
            await dbService.updateDeckStatsAsync(userId, deck.id, stats);
            logger.info(`DeckService: Updated stats for deck ${deckId}, user ${userId}, result: ${result}, opponent leader: ${opponentLeaderId}, opponent base: ${opponentBaseId}, stats: ${JSON.stringify(stats)}`);
            return stats;
        } catch (error) {
            logger.error(`Error updating deck stats for deck ${deckId}, user ${userId}:`, { error: { message: error.message, stack: error.stack } });
            throw error;
        }
    }

    /**
     * Get a deck by its ID, with fallback to check deckID and deckLinkID properties
     * @param userId User ID
     * @param deckId Deck ID, deckID, or deckLinkID to search for
     * @returns Promise that resolves to the deck data if found, null otherwise
     */
    public async getDeckByIdAsync(userId: string, deckId: string): Promise<IDeckDataEntity | null> {
        try {
            const dbService = await this.dbServicePromise;
            // First, try direct lookup by ID
            let deck = await dbService.getDeckAsync(userId, deckId);

            // If found directly, return it
            if (deck) {
                return deck;
            }

            // If not found directly, try to find by deckID or deckLinkID property
            logger.info(`DeckService: Deck with ID ${deckId} not found directly for user ${userId}, trying to find by deckID/deckLinkID properties`);

            // Get all decks for the user
            const allDecks = await dbService.getUserDecksAsync(userId);

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
            logger.error(`Error getting deck by ID ${deckId} for user ${userId}:`, { error: { message: error.message, stack: error.stack } });
            throw error;
        }
    }

    /**
     * Converts all opponent stats' internal names to card IDs
     * @param deck The deck data to process
     * @param cardDataGetter
     * @returns The processed deck data
     */
    public async convertOpponentStatsForFeAsync(deck: IDeckDataEntity, cardDataGetter: CardDataGetter): Promise<IDeckDataEntity> {
        // If there are no stats or no opponent stats, return the deck as is
        if (!deck.stats || !deck.stats.statsByMatchup || !deck.stats.statsByMatchup.length) {
            return Promise.resolve(deck);
        }

        // Create a map to aggregate stats by leader + base combination
        const aggregatedStats = new Map<string, IFeMatchupStatEntity>();
        for (const opponentStat of deck.stats.statsByMatchup) {
            const leaderCard = await cardDataGetter.getCardByNameAsync(opponentStat.leaderId);
            const baseCard = await cardDataGetter.getCardByNameAsync(opponentStat.baseId);

            Contract.assertNotNullLike(leaderCard || baseCard, `When converting match stats to for FE leaderCardId ${leaderCard} and baseCardId ${baseCard} are null`);

            const convertedLeaderId = leaderCard.setId.set + '_' + leaderCard.setId.number;
            const convertedLeaderMelee = leaderCard.title + `${leaderCard.subtitle ? ` | ${leaderCard.subtitle}` : ''}`;

            const convertedBase = await this.convertBaseIdForStatsAsync(baseCard, cardDataGetter);

            const matchupKey = `${convertedLeaderId}|${convertedBase.setId}`;

            const existingStats = aggregatedStats.get(matchupKey);
            if (existingStats) {
                existingStats.wins += opponentStat.wins;
                existingStats.losses += opponentStat.losses;
                existingStats.draws += opponentStat.draws;
            } else {
                aggregatedStats.set(matchupKey, {
                    leaderId: convertedLeaderId,
                    leaderMelee: convertedLeaderMelee,
                    baseId: convertedBase.setId,
                    baseMelee: convertedBase.meleeId,
                    wins: opponentStat.wins,
                    losses: opponentStat.losses,
                    draws: opponentStat.draws
                });
            }
        }
        // Convert the aggregated map back to an array
        deck.stats.statsByMatchup = Array.from(aggregatedStats.values());
        return deck;
    }

    private async convertBaseIdForStatsAsync(baseCard: any, cardDataGetter: CardDataGetter): Promise<{ setId: string; meleeId: string }> {
        const baseCardData = await cardDataGetter.getCardAsync(baseCard.id);

        if (this.isBasicBase(baseCardData)) {
            return this.createBasicBaseAggregatedId(baseCardData);
        }
        return { setId: baseCard.setId.set + '_' + baseCard.setId.number, meleeId: baseCardData.title + `${baseCardData.subtitle ? ` | ${baseCardData.subtitle}` : ''}` };
    }

    /**
    * @param baseCardData The card data object of a basic 28hp force base and a 30hp force base
    * @returns boolean True if this is a basic base
    */
    private isBasicBase(baseCardData: any): boolean {
        const hp = baseCardData.hp;
        return ((hp === 28 || hp === 30));
    }

    /**
    * @param baseCardData The card data object
    * @returns string The grouped identifier
    */
    private createBasicBaseAggregatedId(baseCardData: any): { setId: string; meleeId: string } {
        const aspects = baseCardData.aspects || [];
        const hp = baseCardData.hp;
        const mapping = hp === 30 ? this.baseMapping30 : this.baseMapping28;
        return { setId: mapping[aspects[0]], meleeId: mapping[aspects[0]] };
    }
}