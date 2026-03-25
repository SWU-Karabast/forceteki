const mockCards = [
    // Add mock cards here
    buildMockCard({
        title: 'Yoda',
        subtitle: 'Begun, the Clone War Has',
        cost: 5,
        power: 4,
        hp: 4,
        hasNonKeywordAbility: true,
        aspects: ['Vigilance', 'Command', 'Heroism'],
        types: ['unit'],
        traits: ['force', 'jedi', 'republic'],
        setId: {
            set: 'TS26',
            number: 14
        },
        unique: true,
        arena: 'ground',
        internalName: 'yoda#begun-the-clone-war-has'
    }),
    buildMockCard({
        title: 'C-3P0',
        subtitle: 'Die, Jedi Dogs!',
        cost: 2,
        power: 2,
        hp: 5,
        hasNonKeywordAbility: true,
        aspects: ['Vigilance', 'Command'],
        types: ['unit'],
        traits: ['droid'],
        setId: {
            set: 'TS26',
            number: 15
        },
        unique: true,
        arena: 'ground',
        internalName: 'c3po#die-jedi-dogs'
    }),
    buildMockCard({
        title: 'General Grievous',
        subtitle: 'Crush Them!',
        cost: 5,
        power: 0,
        hp: 0,
        hasNonKeywordAbility: true,
        aspects: ['Command', 'Villainy'],
        types: ['unit'],
        traits: ['separatist', 'official'],
        setId: {
            set: 'TS26',
            number: 50
        },
        unique: true,
        arena: 'ground',
        internalName: 'general-grievous#crush-them'
    }),
    buildMockCard({
        title: 'Prime Minister Almec',
        subtitle: 'Scheming Populist',
        cost: 4,
        power: 2,
        hp: 4,
        hasNonKeywordAbility: true,
        aspects: ['Command', 'Cunning'],
        types: ['unit'],
        traits: ['mandalorian', 'official'],
        keywords: ['saboteur'],
        setId: {
            set: 'TS26',
            number: 28
        },
        unique: true,
        arena: 'ground',
        internalName: 'prime-minister-almec#scheming-populist'
    }),
    buildMockCard({
        title: 'Mother Talzin',
        subtitle: 'Stealing the Spirit',
        cost: 5,
        power: 5,
        hp: 4,
        hasNonKeywordAbility: true,
        aspects: ['Command', 'Cunning', 'Villainy'],
        types: ['unit'],
        traits: ['force', 'night'],
        keywords: ['sentinel'],
        setId: {
            set: 'TS26',
            number: 26
        },
        unique: true,
        arena: 'ground',
        internalName: 'mother-talzin#stealing-the-spirit'
    }),
    buildMockCard({
        title: 'Sundari Gauntlet',
        cost: 5,
        power: 6,
        hp: 5,
        hasNonKeywordAbility: true,
        aspects: ['Command', 'Aggression'],
        types: ['unit'],
        traits: ['mandalorian', 'vehicle', 'transport'],
        keywords: ['sentinel'],
        setId: {
            set: 'TS26',
            number: 24
        },
        unique: false,
        arena: 'space',
        internalName: 'sundari-gauntlet'
    }),
    buildMockCard({
        title: 'Chaotic Diversion',
        cost: 1,
        hasNonKeywordAbility: true,
        aspects: ['Aggression', 'Cunning'],
        types: ['event'],
        traits: ['tactic', 'trick'],
        setId: {
            set: 'TS26',
            number: 31
        },
        unique: false,
        internalName: 'chaotic-diversion',
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
