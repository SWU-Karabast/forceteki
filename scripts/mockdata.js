const mockCards = [
    // -------- Begin Mock Cards --------
    // -------- End Mock Cards --------
];

// -------- Begin Mock Reprints --------
// For cards already in the official data that are reprinted in an upcoming (mocked) set.
// Instead of a buildMockCard entry - which would shadow the official card data and drop
// the real card's other printings - the new set code is grafted onto the official card's
// setCodes, so the real stats and the existing card implementation are reused as-is.
// Note: `set` must exist in the `setNumber` map in fetchdata.js to be picked up.
const mockReprints = [
];
// -------- End Mock Reprints --------

/** @param {{ title: string, subtitle: string?, hasNonKeywordAbility: boolean, cost: number?, hp: number?, arena?: string, unique: boolean, upgradeHp: number?, upgradePower: number?, aspects: string[]?, traits: string[]?, keywords: string[]?, types: string[], setId: { set: string, number: number }, internalName: string, text: string?, deployBox: string?, epicAction: string?, backSideTitle: string?, backSideSubtitle: string?, backSideTraits: string[]?, backSideAspects: string[]? }} cardData */
function buildMockCard(cardData) {
    let textElements = [];
    let keywords = [];
    if (cardData.keywords) {
        const capitalizedKeywords = cardData.keywords?.map((keyword) => keyword.charAt(0).toUpperCase() + keyword.slice(1));
        textElements.push(...capitalizedKeywords);

        // grab the first token for cases like "restore 1"
        keywords.push(...cardData.keywords.map((keyword) => keyword.split(' ')[0]));
    }
    if (cardData.hasNonKeywordAbility) {
        textElements.push('mock ability text');
    }

    const abilityText = textElements.join('\n');
    let deployBox = null;
    let text = '';
    if (cardData.types.includes('leader')) {
        deployBox = abilityText;
    } else {
        text = abilityText;
    }

    if (cardData.text != null) {
        text = cardData.text;
    }

    if (cardData.deployBox != null) {
        deployBox = cardData.deployBox;
    }

    const data = {
        title: cardData.title,
        subtitle: cardData.subtitle || '',
        cost: cardData.cost ?? null,
        hp: cardData.hp ?? null,
        power: cardData.power ?? null,
        text,
        deployBox,
        epicAction: cardData.epicAction ?? '',
        unique: cardData.unique,
        rules: null,
        upgradePower: cardData.upgradePower ?? null,
        upgradeHp: cardData.upgradeHp ?? null,
        id: cardData.internalName + '-id',
        aspects: cardData.aspects || [],
        traits: cardData.traits || [],
        keywords,
        types: cardData.types,
        setId: cardData.setId,
        internalName: cardData.internalName,
        arena: cardData.arena || null,
    };

    // Optional back-side attributes for leaders whose deployed side differs from the leader side.
    if (cardData.backSideTitle != null) {
        data.backSideTitle = cardData.backSideTitle;
    }
    if (cardData.backSideSubtitle != null) {
        data.backSideSubtitle = cardData.backSideSubtitle;
    }
    if (cardData.backSideTraits != null) {
        data.backSideTraits = cardData.backSideTraits;
    }
    if (cardData.backSideAspects != null) {
        data.backSideAspects = cardData.backSideAspects;
    }

    if (!data.types.includes('token')) {
        // Don't set this property for tokens
        data.setCodes = [cardData.setId];
    }

    return data;
}

function buildSetStr(card) {
    return `${card.setId.set}_${card.setId.number}`;
}

function addMockCards(cards) {
    const mockCardsById = new Map();
    const mockCardNames = [];

    const allCards = [];

    for (const card of mockCards) {
        mockCardsById.set(buildSetStr(card), card);
        mockCardNames.push(card.internalName);
        allCards.push(card);
    }

    for (const card of cards) {
        const setStr = buildSetStr(card);
        if (mockCardsById.has(setStr)) {
            // uncomment the below to emit a log line for each mock card that is now in the official data
            // console.log(color(`\nCard '${setStr}' found in official data. The mock can now be safely removed from mockdata.js`, 'yellow'));

            continue;
        }

        allCards.push(card);
    }

    applyMockReprints(allCards);

    return { mockCardNames, cards: allCards };
}

/** @param {Array<{ internalName: string, setCodes?: { set: string, number: number }[], setId: { set: string, number: number } }>} allCards */
function applyMockReprints(allCards) {
    for (const reprint of mockReprints) {
        const matches = allCards.filter((card) => card.internalName === reprint.internalName);

        if (matches.length === 0) {
            console.log(`\nWARNING: mock reprint target '${reprint.internalName}' not found in card data. Check the internalName.`);
            continue;
        }

        let patchedCount = 0;
        for (const card of matches) {
            if (!card.setCodes) {
                card.setCodes = [card.setId];
            }

            if (card.setCodes.some((setCode) => setCode.set === reprint.setId.set && setCode.number === reprint.setId.number)) {
                continue;
            }

            card.setCodes.push(reprint.setId);
            patchedCount++;
        }

        if (patchedCount === 0) {
            console.log(`\nMock reprint '${reprint.internalName}' (${buildSetStr(reprint)}) found in official data. The mock reprint can now be safely removed from mockdata.js`);
        }
    }
}

module.exports = { addMockCards };