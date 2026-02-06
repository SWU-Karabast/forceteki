const mockCards = [
    buildMockCard({
        title: 'Doctor Aphra',
        subtitle: 'Digging For Answers',
        power: 4,
        hp: 5,
        cost: 4,
        hasNonKeywordAbility: true,
        aspects: ['Aggression'],
        types: ['unit'],
        traits: ['underworld'],
        setId: {
            set: 'LAW',
            number: 194,
        },
        unique: true,
        arena: 'ground',
        internalName: 'doctor-aphra#digging-for-answers',
    }),
    buildMockCard({
        title: 'Asajj Ventress',
        subtitle: 'Reluctant Hunter',
        power: 3,
        hp: 3,
        cost: 5,
        hasNonKeywordAbility: true,
        aspects: ['Command', 'Aggression'],
        types: ['unit'],
        traits: ['force', 'underworld', 'bounty hunter'],
        setId: {
            set: 'LAW',
            number: 61,
        },
        unique: true,
        arena: 'ground',
        internalName: 'asajj-ventress#reluctant-hunter',
    }),
    buildMockCard({
        title: 'Honor-Bound Partisan',
        power: 2,
        hp: 2,
        cost: 2,
        hasNonKeywordAbility: true,
        aspects: ['Command', 'Aggression'],
        types: ['unit'],
        traits: ['rebel', 'twi\'lek'],
        setId: {
            set: 'LAW',
            number: 58,
        },
        unique: false,
        arena: 'ground',
        internalName: 'honorbound-partisan',
    }),
    buildMockCard({
        title: 'Highsinger',
        subtitle: 'Deadly Droid',
        power: 4,
        hp: 2,
        cost: 3,
        hasNonKeywordAbility: true,
        aspects: ['Command', 'Aggression'],
        types: ['unit'],
        traits: ['underworld', 'droid', 'bounty hunter'],
        setId: {
            set: 'LAW',
            number: 59,
        },
        unique: true,
        arena: 'ground',
        internalName: 'highsinger#deadly-droid',
    }),
    buildMockCard({
        title: 'Defiant Hammerhead',
        power: 6,
        hp: 6,
        cost: 6,
        hasNonKeywordAbility: true,
        aspects: ['Command', 'Aggression'],
        types: ['unit'],
        traits: ['rebel', 'vehicle', 'capital ship'],
        setId: {
            set: 'LAW',
            number: 62,
        },
        unique: false,
        arena: 'space',
        internalName: 'defiant-hammerhead',
    }),
];

/** @param {{ title: string, subtitle: string?, hasNonKeywordAbility: boolean, cost: number?, hp: number?, arena?: string, unique: boolean, upgradeHp: number?, upgradePower: number?, aspects: string[]?, traits: string[]?, keywords: string[]?, types: string[], setId: { set: string, number: number }, internalName: string }} cardData */
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

    return {
        title: cardData.title,
        subtitle: cardData.subtitle || '',
        cost: cardData.cost ?? null,
        hp: cardData.hp ?? null,
        power: cardData.power ?? null,
        text,
        deployBox,
        epicAction: '',
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
        setCodes: [cardData.setId],
        internalName: cardData.internalName,
        arena: cardData.arena || null,
    };
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

    return { mockCardNames, cards: allCards };
}

module.exports = { addMockCards };
