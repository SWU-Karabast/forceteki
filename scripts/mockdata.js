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
    }),
    buildMockCard({
        title: 'Satine Kryze',
        subtitle: 'Standing On Principles',
        power: 0,
        hp: 8,
        cost: 5,
        hasNonKeywordAbility: true,
        keywords: ['restore 4'],
        aspects: ['vigilance', 'heroism'],
        types: ['leader'],
        traits: ['mandalorian', 'official'],
        setId: {
            set: 'SEC',
            number: 5
        },
        unique: true,
        arena: 'ground',
        internalName: 'satine-kryze#standing-on-principles',
    }),
    buildMockCard({
        title: 'Chandrilan Sponsor',
        power: 2,
        hp: 3,
        hasNonKeywordAbility: false,
        aspects: ['vigilance', 'heroism'],
        types: ['unit'],
        keywords: ['restore 2'],
        traits: ['official'],
        setId: {
            set: 'SEC',
            number: 43
        },
        cost: 2,
        unique: false,
        arena: 'ground',
        internalName: 'chandrilan-sponsor',
    }),
    buildMockCard({
        title: 'Coronet',
        subtitle: 'Stately Vessel',
        power: 4,
        hp: 6,
        hasNonKeywordAbility: true,
        aspects: ['vigilance', 'heroism'],
        types: ['unit'],
        keywords: ['restore 1'],
        traits: ['mandalorian', 'vehicle', 'transport'],
        setId: {
            set: 'SEC',
            number: 47
        },
        cost: 5,
        unique: true,
        arena: 'space',
        internalName: 'coronet#stately-vessel',
    }),
    buildMockCard({
        title: 'Arihnda Pryce',
        subtitle: 'On The Road To Power',
        power: 4,
        hp: 4,
        hasNonKeywordAbility: true,
        aspects: ['aggression', 'villainy'],
        types: ['unit'],
        traits: ['imperial'],
        setId: {
            set: 'SEC',
            number: 136
        },
        cost: 4,
        unique: true,
        arena: 'ground',
        internalName: 'arihnda-pryce#on-the-road-to-power',
    }),
    buildMockCard({
        title: 'Grassroots Resistance',
        hasNonKeywordAbility: true,
        aspects: ['heroism'],
        types: ['event'],
        traits: ['tactic'],
        setId: {
            set: 'SEC',
            number: 258
        },
        cost: 4,
        unique: false,
        internalName: 'grassroots-resistance',
    }),
    buildMockCard({
        title: 'Trade Federation Delegates',
        power: 3,
        hp: 4,
        hasNonKeywordAbility: true,
        aspects: ['cunning', 'villainy'],
        types: ['unit'],
        traits: ['republic', 'official'],
        setId: {
            set: 'SEC',
            number: 191
        },
        cost: 5,
        unique: false,
        arena: 'ground',
        internalName: 'trade-federation-delegates',
    }),
    buildMockCard({
        title: 'No One Ever Knew',
        hasNonKeywordAbility: true,
        aspects: ['cunning', 'villainy'],
        types: ['event'],
        traits: ['trick'],
        setId: {
            set: 'SEC',
            number: 196
        },
        cost: 2,
        unique: false,
        internalName: 'no-one-ever-knew',
    }),
    buildMockCard({
        title: 'Synara San',
        subtitle: 'Harboring a Secret',
        power: 7,
        hp: 7,
        hasNonKeywordAbility: true,
        aspects: ['cunning'],
        types: ['unit'],
        traits: ['underworld'],
        setId: {
            set: 'SEC',
            number: 225
        },
        cost: 7,
        unique: true,
        arena: 'ground',
        internalName: 'synara-san#harboring-a-secret',
    }),
    buildMockCard({
        title: 'Sly Moore',
        subtitle: 'Cipher In The Dark',
        power: 3,
        hp: 6,
        cost: 5,
        hasNonKeywordAbility: true,
        aspects: ['cunning', 'villainy'],
        types: ['leader'],
        traits: ['force', 'imperial', 'official'],
        setId: {
            set: 'SEC',
            number: 14
        },
        unique: true,
        arena: 'ground',
        internalName: 'sly-moore#cipher-in-the-dark',
    }),
    buildMockCard({
        title: 'Elia Kane',
        subtitle: 'False Convert',
        power: 3,
        hp: 6,
        hasNonKeywordAbility: true,
        keywords: ['raid 1'],
        aspects: ['villainy'],
        types: ['unit'],
        traits: ['imperial', 'new republic'],
        setId: {
            set: 'SEC',
            number: 242
        },
        cost: 4,
        unique: true,
        arena: 'ground',
        internalName: 'elia-kane#false-convert',
    }),
    buildMockCard({
        title: 'Kylo Ren\'s Command Shuttle',
        subtitle: 'Icon of Authority',
        power: 3,
        hp: 5,
        hasNonKeywordAbility: true,
        aspects: ['vigilance', 'villainy'],
        types: ['unit'],
        traits: ['first order', 'vehicle', 'transport'],
        setId: {
            set: 'SEC',
            number: 32
        },
        cost: 4,
        unique: true,
        arena: 'space',
        internalName: 'kylo-rens-command-shuttle#icon-of-authority',
    }),
    buildMockCard({
        title: 'Charged with Espionage',
        hasNonKeywordAbility: true,
        aspects: ['cunning'],
        types: ['event'],
        traits: ['law'],
        setId: {
            set: 'SEC',
            number: 230
        },
        cost: 2,
        unique: false,
        internalName: 'charged-with-espionage',
    }),
    buildMockCard({
        title: 'Charged with Treason',
        hasNonKeywordAbility: true,
        aspects: ['aggression'],
        types: ['event'],
        traits: ['law'],
        setId: {
            set: 'SEC',
            number: 182
        },
        cost: 4,
        unique: false,
        internalName: 'charged-with-treason',
    }),
    buildMockCard({
        title: 'Luthen\'s Haulcraft',
        subtitle: 'Countermeasures Armed',
        power: 5,
        hp: 3,
        hasNonKeywordAbility: true,
        aspects: ['aggression', 'heroism'],
        types: ['unit'],
        traits: ['rebel', 'vehicle', 'transport'],
        setId: {
            set: 'SEC',
            number: 153
        },
        cost: 5,
        unique: true,
        arena: 'space',
        internalName: 'luthens-haulcraft#countermeasures-armed',
    }),
    buildMockCard({
        title: 'Vel Sartha',
        subtitle: 'One Path, One Choice',
        power: 4,
        hp: 6,
        hasNonKeywordAbility: true,
        aspects: ['cunning'],
        keywords: ['raid 2'],
        types: ['unit'],
        traits: ['rebel'],
        setId: {
            set: 'SEC',
            number: 224
        },
        cost: 5,
        unique: true,
        arena: 'ground',
        internalName: 'vel-sartha#one-path-one-choice',
    }),
    buildMockCard({
        title: 'High Command Councilor',
        power: 1,
        hp: 4,
        hasNonKeywordAbility: true,
        aspects: ['heroism'],
        types: ['unit'],
        traits: ['rebel', 'official'],
        setId: {
            set: 'SEC',
            number: 249
        },
        cost: 2,
        unique: false,
        arena: 'ground',
        internalName: 'high-command-councilor',
    }),
    buildMockCard({
        title: 'High Command Councilor',
        power: 4,
        hp: 3,
        hasNonKeywordAbility: false,
        keywords: ['sentinel'],
        types: ['unit'],
        traits: ['separatist', 'official'],
        setId: {
            set: 'SEC',
            number: 262
        },
        cost: 4,
        unique: false,
        arena: 'ground',
        internalName: 'ando-commission',
    }),
    buildMockCard({
        title: 'Punishing One',
        subtitle: 'Takes No Prisoners',
        power: 3,
        hp: 5,
        hasNonKeywordAbility: true,
        aspects: ['aggression'],
        types: ['unit'],
        traits: ['underworld', 'vehicle', 'transport'],
        setId: {
            set: 'SEC',
            number: 171,
            internalName: 'punishing-one#takes-no-prisoners',
        },
        cost: 5,
        unique: true,
        arena: 'space',
        internalName: 'punishing-one#takes-no-prisoners',
    }),
    buildMockCard({
        title: 'Lobot',
        subtitle: 'Cloud City Coordinator',
        power: 0,
        hp: 4,
        hasNonKeywordAbility: false,
        aspects: ['vigilance'],
        types: ['unit'],
        keywords: ['sentinel', 'grit'],
        traits: ['fringe'],
        setId: {
            set: 'SEC',
            number: 57
        },
        cost: 2,
        unique: true,
        arena: 'ground',
        internalName: 'lobot#cloud-city-coordinator',
    }),
    buildMockCard({
        title: 'Rebel Functionary',
        power: 2,
        hp: 2,
        hasNonKeywordAbility: false,
        aspects: ['aggression', 'heroism'],
        types: ['unit'],
        keywords: ['hidden'],
        traits: ['rebel', 'official'],
        setId: {
            set: 'SEC',
            number: 146
        },
        cost: 1,
        unique: false,
        arena: 'ground',
        internalName: 'rebel-functionary',
    }),
    buildMockCard({
        title: 'Rebel Propagandist',
        power: 2,
        hp: 4,
        hasNonKeywordAbility: true,
        aspects: ['cunning', 'heroism'],
        types: ['unit'],
        traits: ['rebel', 'official'],
        setId: {
            set: 'SEC',
            number: 202
        },
        cost: 3,
        unique: false,
        arena: 'ground',
        internalName: 'rebel-propagandist',
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