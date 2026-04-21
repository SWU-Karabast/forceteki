const mockCards = [
    // Add mock cards here
    // Mandalorian
    buildMockCard({
        title: 'Mandalorian',
        cost: 0,
        hp: 2,
        power: 2,
        hasNonKeywordAbility: false,
        aspects: ['Vigilance'],
        types: ['token', 'unit'],
        traits: ['mandalorian'],
        keywords: ['shielded'],
        setId: {
            set: 'ASH'
        },
        unique: false,
        arena: 'ground',
        internalName: 'mandalorian',
    }),
    // Advantage
    buildMockCard({
        title: 'Advantage',
        cost: 0,
        hp: 0,
        power: 0,
        upgradePower: 1,
        upgradeHp: 0,
        hasNonKeywordAbility: true,
        types: ['token', 'upgrade'],
        traits: ['innate'],
        setId: {
            set: 'ASH'
        },
        unique: false,
        internalName: 'advantage'
    }),
    // Luke Skywalker, I Can Save Him
    buildMockCard({
        title: 'Luke Skywalker',
        subtitle: 'I Can Save Him',
        power: 6,
        hp: 7,
        cost: 7,
        hasNonKeywordAbility: true,
        aspects: ['vigilance', 'heroism'],
        types: ['leader'],
        traits: ['force', 'jedi', 'rebel'],
        setId: {
            set: 'ASH',
            number: 5
        },
        unique: true,
        arena: 'ground',
        internalName: 'luke-skywalker#i-can-save-him',
    }),
    // Emperor Palpatine, According to My Design
    buildMockCard({
        title: 'Emperor Palpatine',
        subtitle: 'According to My Design',
        power: 4,
        hp: 8,
        cost: 7,
        hasNonKeywordAbility: true,
        aspects: ['cunning', 'villainy'],
        types: ['leader'],
        traits: ['force', 'imperial', 'sith', 'official'],
        setId: {
            set: 'ASH',
            number: 15
        },
        unique: true,
        arena: 'ground',
        internalName: 'emperor-palpatine#according-to-my-design',
    }),
    // Shin Hati, Going Somewhere
    buildMockCard({
        title: 'Shin Hati',
        subtitle: 'Going Somewhere?',
        power: 6,
        hp: 6,
        cost: 5,
        hasNonKeywordAbility: true,
        aspects: ['vigilance', 'villainy'],
        types: ['unit'],
        traits: ['force'],
        setId: {
            set: 'ASH',
            number: 49
        },
        unique: true,
        arena: 'ground',
        internalName: 'shin-hati#going-somewhere',
    }),
    // Blade of Talzin, A Gift of Shadows
    buildMockCard({
        title: 'Blade of Talzin',
        subtitle: 'A Gift of Shadows',
        power: 0,
        hp: 0,
        upgradePower: 2,
        upgradeHp: 1,
        cost: 2,
        hasNonKeywordAbility: true,
        aspects: ['vigilance', 'villainy'],
        types: ['upgrade'],
        traits: ['night', 'item', 'weapon'],
        setId: {
            set: 'ASH',
            number: 55
        },
        unique: true,
        internalName: 'blade-of-talzin#a-gift-of-shadows',
    }),
    // Leia Organa, Vigilant for Danger
    buildMockCard({
        title: 'Leia Organa',
        subtitle: 'Vigilant for Danger',
        power: 3,
        hp: 4,
        cost: 3,
        hasNonKeywordAbility: true,
        aspects: ['vigilance', 'heroism'],
        types: ['unit'],
        traits: ['rebel', 'official'],
        // TODO: Add this back when support exists keywords: ['support'],
        setId: {
            set: 'ASH',
            number: 59
        },
        unique: true,
        arena: 'ground',
        internalName: 'leia-organa#vigilant-for-danger',
    }),
    // The Armorer, Secrecy is Our Survival
    buildMockCard({
        title: 'The Armorer',
        subtitle: 'Secrecy is Our Survival',
        power: 5,
        hp: 5,
        cost: 6,
        hasNonKeywordAbility: true,
        aspects: ['vigilance', 'heroism'],
        types: ['unit'],
        traits: ['mandalorian'],
        keywords: ['shielded'],
        setId: {
            set: 'ASH',
            number: 64
        },
        unique: true,
        arena: 'ground',
        internalName: 'the-armorer#secrecy-is-our-survival',
    }),
    // Luke's Jedi Lightsaber, Constructed by Hand
    buildMockCard({
        title: 'Luke\'s Jedi Lightsaber',
        subtitle: 'Constructed by Hand',
        power: 0,
        hp: 0,
        upgradePower: 3,
        upgradeHp: 3,
        cost: 3,
        hasNonKeywordAbility: true,
        aspects: ['vigilance', 'heroism'],
        types: ['upgrade'],
        traits: ['item', 'weapon', 'lightsaber'],
        setId: {
            set: 'ASH',
            number: 66
        },
        unique: true,
        internalName: 'lukes-jedi-lightsaber#constructed-by-hand',
    }),
    // Moff Jerjerrod, We Shall Redouble Our Efforts
    buildMockCard({
        title: 'Moff Jerjerrod',
        subtitle: 'We Shall Redouble Our Efforts',
        power: 1,
        hp: 3,
        cost: 2,
        hasNonKeywordAbility: true,
        aspects: ['command', 'villainy'],
        types: ['unit'],
        traits: ['imperial', 'official'],
        setId: {
            set: 'ASH',
            number: 94
        },
        unique: true,
        arena: 'ground',
        internalName: 'moff-jerjerrod#we-shall-redouble-our-efforts',
    }),
    // Forest Patroller
    buildMockCard({
        title: 'Forest Patroller',
        power: 3,
        hp: 4,
        cost: 3,
        hasNonKeywordAbility: false,
        aspects: ['command', 'villainy'],
        types: ['unit'],
        traits: ['imperial', 'trooper'],
        keywords: ['overwhelm', 'restore 1'],
        setId: {
            set: 'ASH',
            number: 96
        },
        unique: false,
        arena: 'ground',
        internalName: 'forest-patroller',
    }),
    // Moff Gideon, Remnant Commander
    buildMockCard({
        title: 'Moff Gideon',
        subtitle: 'Remnant Commander',
        power: 2,
        hp: 5,
        cost: 3,
        hasNonKeywordAbility: true,
        aspects: ['command', 'villainy'],
        types: ['unit'],
        traits: ['imperial', 'official'],
        keywords: ['sentinel'],
        setId: {
            set: 'ASH',
            number: 97
        },
        unique: true,
        arena: 'ground',
        internalName: 'moff-gideon#remnant-commander',
    }),
    // R5-D4, Built For Adventure
    buildMockCard({
        title: 'R5-D4',
        subtitle: 'Built For Adventure',
        power: 3,
        hp: 4,
        cost: 3,
        hasNonKeywordAbility: true,
        aspects: ['aggression', 'heroism'],
        types: ['unit'],
        traits: ['droid'],
        // TODO: Add this back when support exists keywords: ['support'],
        setId: {
            set: 'ASH',
            number: 156
        },
        unique: true,
        arena: 'ground',
        internalName: 'r5d4#built-for-adventure',
    }),
    // Han Solo, It'll Work
    buildMockCard({
        title: 'Han Solo',
        subtitle: 'It\'ll Work',
        power: 3,
        hp: 7,
        cost: 4,
        hasNonKeywordAbility: true,
        aspects: ['aggression', 'heroism'],
        types: ['unit'],
        traits: ['rebel', 'official'],
        keywords: ['saboteur'],
        setId: {
            set: 'ASH',
            number: 158
        },
        unique: true,
        arena: 'ground',
        internalName: 'han-solo#itll-work',
    }),
    // Executor, Final Destruction of the Alliance
    buildMockCard({
        title: 'Executor',
        subtitle: 'Final Destruction of the Alliance',
        power: 5,
        hp: 12,
        cost: 8,
        hasNonKeywordAbility: true,
        aspects: ['cunning', 'villainy'],
        types: ['unit'],
        traits: ['imperial', 'vehicle', 'capital ship'],
        setId: {
            set: 'ASH',
            number: 197
        },
        unique: true,
        arena: 'space',
        internalName: 'executor#final-destruction-of-the-alliance',
    }),
    // There Is No Conflict
    buildMockCard({
        title: 'There Is No Conflict',
        power: 0,
        hp: 0,
        upgradePower: 2,
        upgradeHp: 2,
        cost: 2,
        hasNonKeywordAbility: true,
        aspects: ['cunning', 'villainy'],
        types: ['upgrade'],
        traits: ['innate'],
        setId: {
            set: 'ASH',
            number: 199
        },
        unique: false,
        internalName: 'there-is-no-conflict',
    }),
    // Ezra Bridger, The Force Is All I Need
    buildMockCard({
        title: 'Ezra Bridger',
        subtitle: 'The Force Is All I Need',
        power: 6,
        hp: 6,
        cost: 6,
        hasNonKeywordAbility: true,
        aspects: ['cunning', 'heroism'],
        types: ['unit'],
        traits: ['force', 'jedi', 'spectre'],
        // TODO: Add this back when support exists keywords: ['support'],
        setId: {
            set: 'ASH',
            number: 209
        },
        unique: true,
        arena: 'ground',
        internalName: 'ezra-bridger#the-force-is-all-i-need',
    }),
    // Helix Starfighter
    buildMockCard({
        title: 'Helix Starfighter',
        power: 3,
        hp: 3,
        cost: 4,
        hasNonKeywordAbility: true,
        aspects: ['cunning'],
        types: ['unit'],
        traits: ['underworld', 'vehicle', 'fighter'],
        setId: {
            set: 'ASH',
            number: 221
        },
        unique: true,
        arena: 'space',
        internalName: 'helix-starfighter',
    }),
    // Darth Vader, Meet Your Destiny
    buildMockCard({
        title: 'Darth Vader',
        subtitle: 'Meet Your Destiny',
        power: 4,
        hp: 6,
        cost: 5,
        hasNonKeywordAbility: true,
        aspects: ['villainy'],
        types: ['unit'],
        traits: ['force', 'imperial', 'sith'],
        keywords: ['shielded'],
        setId: {
            set: 'ASH',
            number: 243
        },
        unique: true,
        arena: 'ground',
        internalName: 'darth-vader#meet-your-destiny',
    }),
    // Anakin Skywalker, You Were Right About Me
    buildMockCard({
        title: 'Anakin Skywalker',
        subtitle: 'You Were Right About Me',
        power: 6,
        hp: 4,
        cost: 5,
        hasNonKeywordAbility: true,
        aspects: ['heroism'],
        types: ['unit'],
        traits: ['force', 'jedi'],
        keywords: ['hidden', 'saboteur'],
        setId: {
            set: 'ASH',
            number: 255
        },
        unique: true,
        arena: 'ground',
        internalName: 'anakin-skywalker#you-were-right-about-me',
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

    const data = {
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
        internalName: cardData.internalName,
        arena: cardData.arena || null,
    };

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

    return { mockCardNames, cards: allCards };
}

module.exports = { addMockCards };
