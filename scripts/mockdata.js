const { color } = require('console-log-colors');

const mockCards = [
    buildMockCard({
        title: 'Spy',
        power: 0,
        hp: 2,
        hasNonKeywordAbility: false,
        keywords: ['raid 2'],
        types: ['token', 'unit'],
        traits: ['official'],
        setId: {
            set: 'SEC',
        },
        cost: 0,
        unique: false,
        arena: 'ground',
        internalName: 'spy',
    }),
    buildMockCard({
        title: 'Chancellor Palpatine',
        subtitle: 'How Liberty Dies',
        power: 6,
        hp: 8,
        cost: 7,
        hasNonKeywordAbility: true,
        aspects: ['vigilance', 'villainy'],
        types: ['leader'],
        traits: ['republic', 'official'],
        setId: {
            set: 'SEC',
            number: 1
        },
        unique: true,
        arena: 'ground',
        internalName: 'chancellor-palpatine#how-liberty-dies',
    }),
    buildMockCard({
        title: 'Padmé Amidala',
        subtitle: 'What Do You Have To Hide?',
        power: 3,
        hp: 8,
        cost: 6,
        hasNonKeywordAbility: true,
        aspects: ['cunning', 'heroism'],
        types: ['leader'],
        traits: ['naboo', 'republic', 'official'],
        setId: {
            set: 'SEC',
            number: 16
        },
        unique: true,
        arena: 'ground',
        internalName: 'padme-amidala#what-do-you-have-to-hide',
    }),
    buildMockCard({
        title: 'Cad Bane',
        subtitle: 'Impressed Now?',
        power: 4,
        hp: 5,
        hasNonKeywordAbility: true,
        keywords: ['plot'],
        aspects: ['vigilance', 'villainy'],
        types: ['unit'],
        traits: ['underworld', 'bounty hunter'],
        setId: {
            set: 'SEC',
            number: 34
        },
        cost: 5,
        unique: true,
        arena: 'ground',
        internalName: 'cad-bane#impressed-now',
    }),
    buildMockCard({
        title: 'Armor of Fortune',
        power: 0,
        upgradePower: 0,
        upgradeHp: 3,
        hp: 3,
        hasNonKeywordAbility: false,
        keywords: ['plot'],
        aspects: ['vigilance'],
        types: ['upgrade'],
        traits: ['item', 'armor'],
        setId: {
            set: 'SEC',
            number: 70
        },
        cost: 2,
        unique: false,
        internalName: 'armor-of-fortune',
    }),
    buildMockCard({
        title: 'Corrupt Politician',
        power: 2,
        hp: 2,
        hasNonKeywordAbility: true,
        aspects: ['command', 'villainy'],
        types: ['unit'],
        traits: ['republic', 'official'],
        setId: {
            set: 'SEC',
            number: 79
        },
        cost: 1,
        unique: false,
        arena: 'ground',
        internalName: 'corrupt-politician',
    }),
    buildMockCard({
        title: 'Major Partagaz',
        subtitle: 'Healthcare Provider',
        power: 0,
        hp: 6,
        hasNonKeywordAbility: true,
        keywords: ['overwhelm'],
        aspects: ['command', 'villainy'],
        types: ['unit'],
        traits: ['imperial', 'official'],
        setId: {
            set: 'SEC',
            number: 81
        },
        cost: 2,
        unique: true,
        arena: 'ground',
        internalName: 'major-partagaz#healthcare-provider',
    }),
    buildMockCard({
        title: 'I Am the Senate',
        hasNonKeywordAbility: true,
        aspects: ['command', 'villainy'],
        types: ['event'],
        traits: ['law'],
        setId: {
            set: 'SEC',
            number: 92
        },
        cost: 6,
        unique: false,
        internalName: 'i-am-the-senate',
    }),
    buildMockCard({
        title: 'C-3PO',
        subtitle: 'Anything I Might Do?',
        power: 1,
        hp: 3,
        hasNonKeywordAbility: true,
        aspects: ['command', 'heroism'],
        types: ['unit'],
        traits: ['republic', 'droid'],
        setId: {
            set: 'SEC',
            number: 93
        },
        cost: 1,
        unique: true,
        arena: 'ground',
        internalName: 'c3po#anything-i-might-do',
    }),
    buildMockCard({
        title: 'Captain Typho',
        subtitle: 'All Necessary Precautions',
        power: 4,
        hp: 5,
        hasNonKeywordAbility: true,
        keywords: ['sentinel'],
        aspects: ['command', 'heroism'],
        types: ['unit'],
        traits: ['naboo', 'republic', 'trooper'],
        setId: {
            set: 'SEC',
            number: 98
        },
        cost: 4,
        unique: true,
        arena: 'ground',
        internalName: 'captain-typho#all-necessary-precautions',
    }),
    buildMockCard({
        title: 'Jar Jar Binks',
        subtitle: 'Mesa Propose...',
        power: 2,
        hp: 1,
        hasNonKeywordAbility: true,
        keywords: ['plot'],
        aspects: ['command'],
        types: ['unit'],
        traits: ['naboo', 'republic', 'gungan', 'official'],
        setId: {
            set: 'SEC',
            number: 111
        },
        cost: 2,
        unique: true,
        arena: 'ground',
        internalName: 'jar-jar-binks#mesa-propose',
    }),
    buildMockCard({
        title: 'Syril Karn',
        subtitle: 'Where Is He?',
        power: 2,
        hp: 3,
        hasNonKeywordAbility: true,
        aspects: ['aggression', 'villainy'],
        types: ['unit'],
        traits: ['official'],
        setId: {
            set: 'SEC',
            number: 133
        },
        cost: 2,
        unique: true,
        arena: 'ground',
        internalName: 'syril-karn#where-is-he',
    }),
    buildMockCard({
        title: 'Furtive Handmaiden',
        power: 2,
        hp: 2,
        hasNonKeywordAbility: true,
        aspects: ['cunning', 'heroism'],
        types: ['unit'],
        traits: ['naboo'],
        setId: {
            set: 'SEC',
            number: 197
        },
        cost: 1,
        unique: false,
        arena: 'ground',
        internalName: 'furtive-handmaiden',
    }),
    buildMockCard({
        title: 'Chopper',
        subtitle: 'War Hero',
        power: 4,
        hp: 1,
        hasNonKeywordAbility: true,
        aspects: ['aggression', 'heroism'],
        types: ['unit'],
        traits: ['rebel', 'droid', 'spectre'],
        setId: {
            set: 'SEC',
            number: 147
        },
        cost: 2,
        unique: false,
        arena: 'ground',
        internalName: 'chopper#war-hero',
    }),
    buildMockCard({
        title: 'Anakin Skywalker',
        subtitle: 'Secret Husband',
        power: 3,
        hp: 4,
        hasNonKeywordAbility: true,
        keywords: ['hidden'],
        aspects: ['cunning', 'heroism'],
        types: ['unit'],
        traits: ['force', 'jedi', 'republic'],
        setId: {
            set: 'SEC',
            number: 201
        },
        cost: 3,
        unique: true,
        arena: 'ground',
        internalName: 'anakin-skywalker#secret-husband',
    }),
    buildMockCard({
        title: 'When Has Become Now',
        hasNonKeywordAbility: true,
        aspects: ['villainy'],
        types: ['event'],
        traits: ['trick'],
        setId: {
            set: 'SEC',
            number: 245
        },
        cost: 1,
        unique: false,
        internalName: 'when-has-become-now',
    }),
    buildMockCard({
        title: 'Maarva Andor',
        subtitle: 'We\'ve Been Sleeping',
        power: 3,
        hp: 4,
        hasNonKeywordAbility: true,
        aspects: ['heroism'],
        types: ['unit'],
        traits: ['rebel'],
        setId: {
            set: 'SEC',
            number: 252
        },
        cost: 3,
        unique: true,
        arena: 'ground',
        internalName: 'maarva-andor#weve-been-sleeping',
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
