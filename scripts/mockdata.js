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
    buildMockCard({
        title: 'Moralo Eval',
        subtitle: 'Infamous Murderer',
        cost: 3,
        power: 3,
        hp: 2,
        hasNonKeywordAbility: true,
        aspects: ['Cunning', 'Villainy'],
        types: ['unit'],
        traits: ['underworld'],
        keywords: ['shielded'],
        setId: {
            set: 'TS26',
            number: 73
        },
        unique: true,
        arena: 'ground',
        internalName: 'moralo-eval#infamous-murderer',
    }),
    buildMockCard({
        title: 'Fortune and Glory',
        subtitle: 'Hondo\'s Luxury Yacht',
        cost: 4,
        power: 3,
        hp: 5,
        hasNonKeywordAbility: true,
        aspects: ['Command', 'Cunning'],
        types: ['unit'],
        traits: ['underworld', 'vehicle', 'transport'],
        keywords: ['bounty'],
        setId: {
            set: 'TS26',
            number: 27
        },
        unique: true,
        arena: 'space',
        internalName: 'fortune-and-glory#hondos-luxury-yacht',
    }),
    buildMockCard({
        title: 'King Katuunko',
        subtitle: 'Great King of Toydaria',
        cost: 2,
        power: 2,
        hp: 4,
        hasNonKeywordAbility: true,
        aspects: ['Vigilance', 'Command'],
        types: ['unit'],
        traits: ['official'],
        setId: {
            set: 'TS26',
            number: 16
        },
        unique: true,
        arena: 'ground',
        internalName: 'king-katuunko#great-king-of-toydaria',
    }),
    buildMockCard({
        title: 'Coleman Trebor',
        subtitle: 'Jedi Rescuer',
        cost: 1,
        power: 2,
        hp: 2,
        hasNonKeywordAbility: true,
        aspects: ['Vigilance', 'Aggression', 'Heroism'],
        types: ['unit'],
        traits: ['force', 'jedi', 'republic'],
        keywords: ['hidden'],
        setId: {
            set: 'TS26',
            number: 19
        },
        unique: true,
        arena: 'ground',
        internalName: 'coleman-trebor#jedi-rescuer',
    }),
    buildMockCard({
        title: '501st Veteran',
        cost: 2,
        power: 0,
        hp: 4,
        hasNonKeywordAbility: true,
        aspects: ['Vigilance', 'Aggression'],
        types: ['unit'],
        traits: ['republic', 'clone', 'trooper'],
        keywords: ['grit', 'raid 1'],
        setId: {
            set: 'TS26',
            number: 20
        },
        unique: false,
        arena: 'ground',
        internalName: '501st-veteran',
    }),
    buildMockCard({
        title: 'Take Cover',
        cost: 3,
        hasNonKeywordAbility: true,
        aspects: ['Vigilance'],
        types: ['event'],
        traits: ['tactic'],
        setId: {
            set: 'TS26',
            number: 47
        },
        unique: false,
        internalName: 'take-cover',
    }),
    buildMockCard({
        title: 'Take Charge',
        cost: 3,
        hasNonKeywordAbility: true,
        aspects: ['Command'],
        types: ['event'],
        traits: ['tactic'],
        setId: {
            set: 'TS26',
            number: 60
        },
        unique: false,
        internalName: 'take-charge',
    }),
    buildMockCard({
        title: 'Take Action',
        cost: 3,
        hasNonKeywordAbility: true,
        aspects: ['Aggression'],
        types: ['event'],
        traits: ['tactic'],
        setId: {
            set: 'TS26',
            number: 71
        },
        unique: false,
        internalName: 'take-action',
    }),
    buildMockCard({
        title: 'Take Aim',
        cost: 3,
        hasNonKeywordAbility: true,
        aspects: ['Cunning'],
        types: ['event'],
        traits: ['tactic'],
        setId: {
            set: 'TS26',
            number: 83
        },
        unique: false,
        internalName: 'take-aim',
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
