import type { ICardMap, ICardMapEntry } from './cardData/CardDataInterfaces';

export interface IPlayerSummary {
    base: string;
    leader: string;
}

export interface ILobbyPreviewData {
    id: string | null;
    isPrivate: boolean;
    player1Leader: { id: string };
    player1Base: { id: string };
    player2Leader: { id: string };
    player2Base: { id: string };
}

// Parse setup data to extract base and leader information for each player
export function parseBaseAndLeaderFromSetup(testData: any) {
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
 * @param { ICardMap } cardMap - The complete map of card data.
 * @param { string[] } internalNames - An array of internal card names.
 * @returns { ICardMapEntry[] }
 */
export function findCardByInternalName(cardMap: ICardMap, internalNames: string[]): ICardMapEntry[] {
    if (!cardMap || !internalNames) {
        return null;
    }

    const namesToFind = Array.isArray(internalNames) ? internalNames : [internalNames];

    const foundCards = namesToFind.map((targetName) => {
        for (const card of cardMap.values()) {
            if (card && card.internalName === targetName) {
                return card;
            }
        }
        return null;
    }).filter((card) => card !== null) as ICardMapEntry[];

    return foundCards;
}

// Obtain the set key from the set code map based on provided target values, in this case internal names of the card
export function findKeysInMap<K, V>(map: Map<K, V>, targetValues: V[]): K[] {
    if (!map || !targetValues) {
        return [];
    }

    const targets = Array.isArray(targetValues) ? targetValues : [targetValues];

    return targets.map((targetValue) => {
        for (const [mapKey, mapValue] of map.entries()) {
            if (mapValue === targetValue) {
                return mapKey;
            }
        }
        return null;
    }).filter((key) => key !== null) as K[];
}


/**
 * Orchestrates the conversion of test setup data into a formatted lobby preview.
 * @param { any } setupData - The raw JSON test data containing player configurations.
 * @returns { ILobbyPreviewData } Cards populated in preview object for the lobby UI,
 * or a default fallback preview if an error occurs.
 */

export function prepareTestLobbyPreview(setupData: any, cardDataGetter: any): ILobbyPreviewData {
    try {
        const cleanData = parseBaseAndLeaderFromSetup(setupData);

        const internalNames = [
            cleanData['player1']['leader'],
            cleanData['player1']['base'],
            cleanData['player2']['leader'],
            cleanData['player2']['base']
        ];

        const cards = findCardByInternalName(cardDataGetter.cardMap, internalNames);
        if (!cards || cards.length < 4) {
            throw new Error('Could not find all required cards');
        }

        // Extract the id's from cards
        const cardIds = cards.map((card) => card.id);

        // Setcode lookup, get the set keys for each card id value
        const cardKeys = findKeysInMap<string, string>(cardDataGetter.setCodeMap, cardIds);

        // Standard lobby preview structure, id and isPrivate will be set in lobby itself
        const lobbyPreviewData = {
            id: null,
            isPrivate: true,
            player1Leader: { id: cardKeys[0] },
            player1Base: { id: cardKeys[1] },
            player2Leader: { id: cardKeys[2] },
            player2Base: { id: cardKeys[3] },
        };

        return lobbyPreviewData;
    } catch (error) {
        console.error('Error preparing test lobby preview - setting defauly leader and base combo', error);

        /** testGameTemplate is checked for format error's prior to this function being called but
         * in case of unexpected errors a default preview is provided to prevent null leader / base error
        */

        const lobbyPreviewData = {
            id: null,
            isPrivate: true,
            player1Leader: { id: 'SOR_005' },
            player1Base: { id: 'SOR_024' },
            player2Leader: { id: 'SOR_014' },
            player2Base: { id: 'SOR_030' },
        };

        return lobbyPreviewData;
    }
}
