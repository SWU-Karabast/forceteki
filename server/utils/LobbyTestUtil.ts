
// Parse setup data to extract base and leader information for each player
export function parseBaseAndLeaderFromSetup(testData: any) {
    if (!testData) {
        return {};
    }

    const playerKeys = ['player1', 'player2'];

    return playerKeys.reduce((setupSummary, playerKey: string) => {
        // Internal helper to extract the card name/ID
        const getCardValue = (value: any) => (typeof value === 'object' ? value?.card : value);
        const playerData = testData[playerKey];

        setupSummary[playerKey] = {
            base: playerData ? getCardValue(playerData.base) : null,
            leader: playerData ? getCardValue(playerData.leader) : null
        };

        return setupSummary;
    }, {});
}

// Searches the card map for cards matching the given internal names
export function findCardByInternalName(cardMap: Map<any, any>, internalNames: string | string[]): any | undefined {
    const foundCards: any[] = [];

    if (!cardMap || !internalNames) {
        return undefined;
    }

    const namesToFind = Array.isArray(internalNames) ? internalNames : [internalNames];

    for (const card of cardMap.values()) {
        if (card && namesToFind.includes(card.internalName)) {
            foundCards.push(card);
        }
    }

    return foundCards;
}

// Obtain the set value when given internal names
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

// Main function to set up a test lobby preview based on provided setup data and card data
export function setupTestLobby(setupData: any, cardDataGetter: any): any {
    // Standard lobby preview structure, id and isPrivate will be set in lobby itself
    const lobbyPreviewData = {
        id: undefined,
        isPrivate: undefined,
        player1Leader: undefined,
        player1Base: undefined,
        player2Leader: undefined,
        player2Base: undefined,
    };

    const cleanData = parseBaseAndLeaderFromSetup(setupData);

    const setupArray = [cleanData['player1']['leader'], cleanData['player1']['base'], cleanData['player2']['leader'], cleanData['player2']['base']];

    // Base Setup
    const cards = findCardByInternalName(cardDataGetter.cardMap, setupArray);
    const setupArrayId = [cards[0]['id'], cards[1]['id'], cards[2]['id'], cards[3]['id']];
    const cardKeys = findKeysInMap(cardDataGetter.setCodeMap, setupArrayId);

    lobbyPreviewData.player1Leader = { id: cardKeys[0] };
    lobbyPreviewData.player1Base = { id: cardKeys[2] };
    lobbyPreviewData.player2Leader = { id: cardKeys[1] };
    lobbyPreviewData.player2Base = { id: cardKeys[3] };

    return lobbyPreviewData;
}
