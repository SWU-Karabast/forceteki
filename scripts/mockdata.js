const mockCards = [
    buildMockCard({
        title: 'Boba Fett',
        subtitle: 'For a Price',
        power: 6,
        hp: 5,
        cost: 5,
        hasNonKeywordAbility: true,
        aspects: ['cunning', 'villainy'],
        types: ['unit'],
        traits: ['underworld', 'bounty hunter'],
        setId: {
            set: 'LAW',
            number: 214,
        },
        unique: true,
        arena: 'ground',
        internalName: 'boba-fett#for-a-price',
    }),
    buildMockCard({
        title: 'Lando Calrissian',
        subtitle: 'Eyes Open',
        power: 4,
        hp: 5,
        cost: 5,
        hasNonKeywordAbility: true,
        keywords: ['sentinel'],
        aspects: ['vigilance', 'heroism'],
        types: ['unit'],
        traits: ['rebel', 'underworld'],
        setId: {
            set: 'LAW',
            number: 108,
        },
        unique: true,
        arena: 'ground',
        internalName: 'lando-calrissian#eyes-open',
    }),
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
        title: 'Qui-Gon Jinn',
        subtitle: 'Influencing Chance',
        power: 3,
        hp: 5,
        cost: 4,
        hasNonKeywordAbility: true,
        keywords: ['sentinel'],
        aspects: ['cunning'],
        types: ['unit'],
        traits: ['force', 'jedi', 'republic'],
        setId: {
            set: 'LAW',
            number: 237,
        },
        unique: true,
        arena: 'ground',
        internalName: 'quigon-jinn#influencing-chance',
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
        reprints: {
            data: []
        },
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
