import type { ICardMap, ICardMapEntry } from './cardData/CardDataInterfaces';

export interface IPlayerSummary {
    base: string;
    leader: string;
}

export interface IExtractedSetup {
    player1: IPlayerSummary;
    player2: IPlayerSummary;
}

export interface ISetCodePreview {
    set: string;
}

export interface ILobbyPreviewData {
    id: string;
    isPrivate: boolean;
    player1Leader: { id: ISetCodePreview };
    player1Base: { id: ISetCodePreview };
    player2Leader: { id: ISetCodePreview };
    player2Base: { id: ISetCodePreview };
}


// Parse setup data to extract base and leader information for each player
/**
     * @param { any } testData - The raw JSON setup object containing test configurations
     * @returns { IExtractedSetup } A structured object containing the internal names for each player's base and leader.
     */
export function parseBaseAndLeaderFromSetup(testData) {
    if (!testData) {
        return {};
    }

    // testGameTemplate expects player1 and player2 keys
    const playerKeys = ['player1', 'player2'];

    return playerKeys.reduce((setupSummary, playerKey: string) => {
        // Internal helper to extract the leader/base name
        const getCardValue = (value: any) => (typeof value === 'object' ? value?.card : value);
        const playerData = testData[playerKey];

        setupSummary[playerKey] = {
            base: playerData ? getCardValue(playerData.base) : null,
            leader: playerData ? getCardValue(playerData.leader) : null
        };

        return setupSummary;
    }, {});
}

/**
 * Searches the card database for one or more cards using their internal name identifiers.
 * @param { ICardMap } cardMap
 * @param { string[] } internalNames
 * @returns { ICardMapEntry[] }
 */
export function findCardByInternalName(cardMap: ICardMap, internalNames: string[]): ICardMapEntry[] {
    const foundCards: ICardMapEntry[] = [];

    if (!cardMap || !internalNames) {
        return null;
    }

    const namesToFind = Array.isArray(internalNames) ? internalNames : [internalNames];

    for (const card of cardMap.values()) {
        if (card && namesToFind.includes(card.internalName)) {
            foundCards.push(card);
        }
    }

    return foundCards;
}

// Obtain the set key from the set code map based on provided target values, in this case internal names of the card
export function findKeysInMap<K, V>(map: Map<K, V>, targetValues: V[]): K[] {
    const foundKeys: K[] = [];

    if (!map || targetValues === undefined || targetValues === null) {
        return foundKeys;
    }

    const targets = Array.isArray(targetValues) ? targetValues : [targetValues];


    for (const target of targets) {
        for (const [key, value] of map.entries()) {
            if (value === target) {
                foundKeys.push(key);
                // break to prevent duplicate keys
                break;
            }
        }
    }

    return foundKeys;
}


/**
 * Orchestrates the conversion of test setup data into a formatted lobby preview.
 * * This function handles the full pipeline:
 * 1. Parses JSON into internal card names.
 * 2. Looks up the card objects in cardDataGetter map.
 * 3. Maps those cards to their specific Set Codes.
 * 4. Assigns the codes to the structured lobby preview object.
 * @param { any } setupData - The raw JSON test data containing player configurations.
 * @param { any } cardDataGetter - The service or object containing `cardMap` and `setCodeMap`.
 * @returns { ILobbyPreviewData } Cards populated in preview object for the lobby UI,
 * or a default fallback preview if an error occurs.
 */

export function prepareTestLobbyPreview(setupData: any, cardDataGetter: any): ILobbyPreviewData {
    // Standard lobby preview structure, id and isPrivate will be set in lobby itself
    try {
        const lobbyPreviewData = {
            id: null,
            isPrivate: true,
            player1Leader: null,
            player1Base: null,
            player2Leader: null,
            player2Base: null,
        };

        const cleanData = parseBaseAndLeaderFromSetup(setupData);

        // Assign internal names to an array for lookup and store the found cards
        const setupArray = [
            cleanData['player1']['leader'],
            cleanData['player1']['base'],
            cleanData['player2']['leader'],
            cleanData['player2']['base']
        ];

        const cards = findCardByInternalName(cardDataGetter.cardMap, setupArray);

        // Assign card id's and extract the set codes from the set code map
        const setupArrayId = [
            cards[0]['id'],
            cards[1]['id'],
            cards[2]['id'],
            cards[3]['id']
        ];

        const cardKeys = findKeysInMap(cardDataGetter.setCodeMap, setupArrayId);

        // assign to lobby preview data structure
        lobbyPreviewData.player1Leader = { id: cardKeys[0] };
        lobbyPreviewData.player1Base = { id: cardKeys[2] };
        lobbyPreviewData.player2Leader = { id: cardKeys[1] };
        lobbyPreviewData.player2Base = { id: cardKeys[3] };

        return lobbyPreviewData;
    } catch (error) {
        console.error('Error preparing test lobby preview - setting defauly leader and base combo', error);

        /** testGameTemplate is checked for format error's prior to this function being called but
         * in case of unexpected errors a default preview is provided to prevent null leader / base error
        */

        const lobbyPreviewData = {
            id: null,
            isPrivate: true,
            player1Leader: null,
            player1Base: null,
            player2Leader: null,
            player2Base: null,
        };

        lobbyPreviewData.player1Leader = { id: 'SOR_005' };
        lobbyPreviewData.player1Base = { id: 'SOR_024' };
        lobbyPreviewData.player2Leader = { id: 'SOR_014' };
        lobbyPreviewData.player2Base = { id: 'SOR_030' };

        return lobbyPreviewData;
    }
}
