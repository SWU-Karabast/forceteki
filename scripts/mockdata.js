const mockCards = [
    // Add mock cards here
    buildMockCard({
        title: 'Darth Vader',
        subtitle: 'No One to Stop Us',
        cost: 7,
        power: 5,
        hp: 7,
        hasNonKeywordAbility: true,
        aspects: ['vigilance', 'villainy'],
        traits: ['force', 'imperial', 'sith'],
        types: ['leader'],
        setId: {
            set: 'IC27',
            number: 1
        },
        unique: true,
        arena: 'ground',
        internalName: 'darth-vader#no-one-to-stop-us'
    }),
    buildMockCard({
        title: 'Leia Organa',
        subtitle: 'On a Diplomatic Mission',
        cost: 6,
        power: 4,
        hp: 7,
        hasNonKeywordAbility: true,
        aspects: ['cunning', 'heroism'],
        traits: ['rebel', 'official'],
        types: ['leader'],
        setId: {
            set: 'IC27',
            number: 8
        },
        unique: true,
        arena: 'ground',
        internalName: 'leia-organa#on-a-diplomatic-mission'
    }),
    buildMockCard({
        title: 'Moff Gideon',
        subtitle: 'Cold Calling',
        cost: 5,
        power: 3,
        hp: 6,
        hasNonKeywordAbility: true,
        aspects: ['vigilance', 'villainy'],
        traits: ['imperial', 'official'],
        types: ['unit'],
        setId: {
            set: 'IC27',
            number: 22
        },
        unique: true,
        arena: 'ground',
        internalName: 'moff-gideon#cold-calling'
    }),
    buildMockCard({
        title: 'Darth Sidious',
        subtitle: 'Move Against the Jedi',
        cost: 7,
        power: 5,
        hp: 8,
        hasNonKeywordAbility: true,
        aspects: ['vigilance', 'villainy'],
        traits: ['force', 'separatist', 'sith'],
        keywords: ['restore 3'],
        types: ['unit'],
        setId: {
            set: 'IC27',
            number: 26
        },
        unique: true,
        arena: 'ground',
        internalName: 'darth-sidious#move-against-the-jedi'
    }),
    buildMockCard({
        title: 'Darth Vader',
        subtitle: 'Useless to Resist',
        cost: 8,
        power: 8,
        hp: 8,
        hasNonKeywordAbility: true,
        aspects: ['command', 'villainy'],
        traits: ['force', 'imperial', 'sith'],
        keywords: ['ambush'],
        types: ['unit'],
        setId: {
            set: 'IC27',
            number: 67
        },
        unique: true,
        arena: 'ground',
        internalName: 'darth-vader#useless-to-resist'
    }),
    buildMockCard({
        title: 'Avar Kriss',
        subtitle: 'For Light and Life',
        cost: 2,
        power: 0,
        hp: 5,
        hasNonKeywordAbility: true,
        aspects: ['command', 'heroism'],
        traits: ['force', 'jedi', 'republic'],
        keywords: ['raid 1'],
        types: ['unit'],
        setId: {
            set: 'IC27',
            number: 71
        },
        unique: true,
        arena: 'ground',
        internalName: 'avar-kriss#for-light-and-life'
    }),
    buildMockCard({
        title: 'Anakin Skywalker',
        subtitle: 'Destined For Darkness',
        cost: 5,
        power: 7,
        hp: 4,
        hasNonKeywordAbility: true,
        aspects: ['command', 'heroism'],
        traits: ['force', 'jedi', 'republic'],
        types: ['unit'],
        setId: {
            set: 'IC27',
            number: 78
        },
        unique: true,
        arena: 'ground',
        internalName: 'anakin-skywalker#destined-for-darkness'
    }),
    buildMockCard({
        title: 'The Inquisitor\'s TIE',
        subtitle: 'Would Rather Win',
        cost: 4,
        power: 4,
        hp: 5,
        hasNonKeywordAbility: true,
        aspects: ['aggression', 'villainy'],
        traits: ['imperial', 'vehicle', 'fighter', 'inquisitor'],
        types: ['unit'],
        setId: {
            set: 'IC27',
            number: 104
        },
        unique: true,
        arena: 'space',
        internalName: 'the-inquisitors-tie#would-rather-win'
    }),
    buildMockCard({
        title: 'Boba Fett',
        subtitle: 'Compensated If He Dies',
        cost: 5,
        power: 4,
        hp: 7,
        hasNonKeywordAbility: true,
        aspects: ['cunning', 'villainy'],
        traits: ['underworld', 'bounty hunter'],
        types: ['unit'],
        setId: {
            set: 'IC27',
            number: 146
        },
        unique: true,
        arena: 'ground',
        internalName: 'boba-fett#compensated-if-he-dies'
    }),
    buildMockCard({
        title: 'Millenium Falcon',
        subtitle: 'YA-HOO!',
        cost: 4,
        power: 4,
        hp: 4,
        hasNonKeywordAbility: true,
        aspects: ['cunning', 'heroism'],
        traits: ['rebel', 'vehicle', 'transport'],
        types: ['unit'],
        setId: {
            set: 'IC27',
            number: 158
        },
        unique: true,
        arena: 'space',
        internalName: 'millenium-falcon#ya-hoo'
    }),
    buildMockCard({
        title: 'Lando Calrissian',
        subtitle: 'Check This Out',
        cost: 3,
        power: 4,
        hp: 4,
        hasNonKeywordAbility: true,
        aspects: ['cunning', 'cunning'],
        traits: ['official'],
        types: ['unit'],
        setId: {
            set: 'IC27',
            number: 167
        },
        unique: true,
        arena: 'ground',
        internalName: 'lando-calrissian#check-this-out'
    }),
    buildMockCard({
        title: 'Cunning Ploy',
        cost: 4,
        hasNonKeywordAbility: true,
        aspects: ['cunning', 'cunning'],
        traits: ['trick'],
        types: ['event'],
        setId: {
            set: 'IC27',
            number: 168
        },
        unique: false,
        internalName: 'cunning-ploy'
    }),
    buildMockCard({
        title: 'Jar Jar Binks',
        subtitle: 'Bumbling Representative',
        cost: 2,
        power: 1,
        hp: 5,
        hasNonKeywordAbility: true,
        aspects: ['heroism'],
        traits: ['republic', 'gungan', 'official'],
        types: ['unit'],
        setId: {
            set: 'IC27',
            number: 187
        },
        unique: true,
        arena: 'ground',
        internalName: 'jar-jar-binks#bumbling-representative'
    }),
    // -------- End Mock Cards --------
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
