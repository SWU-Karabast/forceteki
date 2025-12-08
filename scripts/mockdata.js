const mockCards = [
    buildMockCard({
        title: 'Han Solo',
        subtitle: 'Hibernation Sick',
        power: 1,
        hp: 1,
        cost: 1,
        hasNonKeywordAbility: true,
        keywords: ['shielded'],
        aspects: ['vigilance', 'command'],
        types: ['unit'],
        traits: ['rebel'],
        setId: {
            set: 'LAW',
            number: 37,
        },
        unique: true,
        arena: 'ground',
        internalName: 'han-solo#hibernation-sick',
    }),
    buildMockCard({
        title: 'Zeb Orrelios',
        subtitle: 'Spectre Four',
        power: 4,
        hp: 4,
        cost: 5,
        hasNonKeywordAbility: true,
        keywords: ['sentinel'],
        aspects: ['vigilance', 'aggression', 'heroism'],
        types: ['unit'],
        traits: ['rebel', 'spectre'],
        setId: {
            set: 'LAW',
            number: 45,
        },
        unique: true,
        arena: 'ground',
        internalName: 'zeb-orrelios#spectre-four',
    }),
    buildMockCard({
        title: 'Jaunty Light Freighter',
        power: 1,
        hp: 1,
        cost: 4,
        hasNonKeywordAbility: true,
        aspects: ['command', 'heroism'],
        types: ['unit'],
        traits: ['vehicle', 'transport'],
        setId: {
            set: 'LAW',
            number: 147,
        },
        unique: false,
        arena: 'space',
        internalName: 'jaunty-light-freighter',
    }),
    buildMockCard({
        title: 'Leia\'s Disguise',
        upgradePower: 2,
        power: 2,
        upgradeHp: 2,
        hp: 2,
        cost: 2,
        hasNonKeywordAbility: true,
        aspects: ['vigilance', 'heroism'],
        traits: ['item', 'armor'],
        types: ['upgrade'],
        setId: {
            set: 'LAW',
            number: 111,
        },
        unique: true,
        internalName: 'leias-disguise'
    }),
    buildMockCard({
        title: 'The Sarlacc of Carkoon',
        subtitle: 'Horror of the Dune Sea',
        text: 'On Attack: Put a unit from your discard pile on the bottom of your deck. Deal damage equal to that unit\'s power to an enemy ground unit.',
        power: 8,
        hp: 9,
        cost: 8,
        hasNonKeywordAbility: true,
        aspects: ['command'],
        types: ['unit'],
        traits: ['creature'],
        setId: {
            set: 'LAW',
            number: 163,
        },
        unique: true,
        arena: 'ground',
        internalName: 'the-sarlacc-of-carkoon#horror-of-the-dune-sea',
    }),
    buildMockCard({
        title: 'Great Pit of Carkoon',
        hp: 27,
        text: 'Epic Action [discard a unit from your hand]: Search your deck for a card named The Sarlacc of Carkoon, reveal it and draw it,',
        aspects: ['command'],
        types: ['base'],
        setId: {
            set: 'LAW',
            number: 23
        },
        unique: false,
        internalName: 'great-pit-of-carkoon'
    })
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
