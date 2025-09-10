const { color } = require('console-log-colors');

const mockCards = [
    buildMockCard({
        title: 'Dedra Meero',
        subtitle: 'Not Wasting Time',
        power: 2,
        hp: 5,
        cost: 4,
        hasNonKeywordAbility: true,
        aspects: ['aggression', 'villainy'],
        types: ['leader'],
        traits: ['imperial', 'official'],
        setId: {
            set: 'SEC',
            number: 10
        },
        unique: true,
        arena: 'ground',
        internalName: 'dedra-meero#not-wasting-time',
    }),
    buildMockCard({
        title: 'Bo-Katan Kryze',
        subtitle: 'Alone',
        power: 8,
        hp: 8,
        hasNonKeywordAbility: true,
        aspects: ['vigilance', 'heroism'],
        types: ['unit'],
        traits: ['mandalorian'],
        setId: {
            set: 'SEC',
            number: 51
        },
        cost: 9,
        unique: true,
        arena: 'ground',
        internalName: 'bokatan-kryze#alone',
    }),
    buildMockCard({
        title: 'PreMor Personnel Carrier',
        power: 6,
        hp: 6,
        hasNonKeywordAbility: true,
        keywords: ['overwhelm'],
        aspects: ['command', 'villainy'],
        types: ['unit'],
        traits: ['vehicle', 'transport'],
        setId: {
            set: 'SEC',
            number: 89
        },
        cost: 8,
        unique: false,
        arena: 'space',
        internalName: 'premor-personnel-carrier',
    }),
    buildMockCard({
        title: 'Fulminatrix',
        subtitle: 'Fleet Killer',
        power: 9,
        hp: 7,
        hasNonKeywordAbility: true,
        aspects: ['aggression', 'villainy'],
        types: ['unit'],
        traits: ['first order', 'vehicle', 'capital ship'],
        setId: {
            set: 'SEC',
            number: 142
        },
        cost: 8,
        unique: true,
        arena: 'space',
        internalName: 'fulminatrix#fleet-killer',
    }),
    buildMockCard({
        title: 'It\'s Not Over Yet',
        hasNonKeywordAbility: true,
        aspects: ['aggression'],
        types: ['event'],
        traits: ['innate'],
        setId: {
            set: 'SEC',
            number: 177
        },
        cost: 2,
        unique: false,
        internalName: 'its-not-over-yet',
    }),
    buildMockCard({
        title: 'Topple the Summit',
        hasNonKeywordAbility: true,
        aspects: ['aggression'],
        keywords: ['plot'],
        types: ['event'],
        traits: ['plan'],
        setId: {
            set: 'SEC',
            number: 183
        },
        cost: 5,
        unique: false,
        internalName: 'topple-the-summit',
    }),
    buildMockCard({
        title: 'Tala Durith',
        subtitle: 'I Can Get You Inside',
        power: 3,
        hp: 3,
        hasNonKeywordAbility: true,
        keywords: ['plot'],
        aspects: ['cunning', 'heroism'],
        types: ['unit'],
        traits: ['imperial', 'rebel'],
        setId: {
            set: 'SEC',
            number: 203
        },
        cost: 3,
        unique: true,
        arena: 'ground',
        internalName: 'tala-durith#i-can-get-you-inside',
    }),
    buildMockCard({
        title: 'The Mandalorian',
        subtitle: 'Cleaning Up Nevarro',
        power: 6,
        hp: 8,
        hasNonKeywordAbility: true,
        keywords: ['ambush'],
        aspects: ['cunning', 'heroism'],
        types: ['unit'],
        traits: ['mandalorian', 'bounty hunter'],
        setId: {
            set: 'SEC',
            number: 209
        },
        cost: 8,
        unique: true,
        arena: 'ground',
        internalName: 'the-mandalorian#cleaning-up-nevarro',
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
    const cardsById = new Map();
    const mockCardNames = [];

    for (const card of cards) {
        cardsById.set(buildSetStr(card), card);
    }

    for (const card of mockCards) {
        const setStr = buildSetStr(card);

        if (cardsById.has(setStr)) {
            // console.log(color(`\nCard '${setStr}' found in official data. The mock can now be safely removed from mockdata.js\n`, 'yellow'));
            cardsById.get(setStr).id = card.id;
        } else {
            cards.push(card);
            mockCardNames.push(card.internalName);
        }
    }

    return mockCardNames;
}

module.exports = { addMockCards };
