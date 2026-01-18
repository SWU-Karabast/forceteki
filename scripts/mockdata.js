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
    buildMockCard({
        title: 'Rio Durant',
        subtitle: 'Beckett\'s Right Hands',
        power: 2,
        hp: 5,
        cost: 4,
        hasNonKeywordAbility: true,
        aspects: ['cunning', 'vigilance'],
        types: ['unit'],
        traits: ['underworld'],
        setId: {
            set: 'LAW',
            number: 93,
        },
        unique: true,
        arena: 'ground',
        internalName: 'rio-durant#becketts-right-hands',
    }),
    buildMockCard({
        title: 'Han\'s Golden Dice',
        cost: 1,
        power: 0,
        hp: 0,
        upgradePower: 0,
        upgradeHp: 0,
        hasNonKeywordAbility: true,
        aspects: ['cunning', 'heroism'],
        types: ['upgrade'],
        traits: ['item'],
        setId: {
            set: 'LAW',
            number: 225,
        },
        unique: true,
        internalName: 'hans-golden-dice',
    }),
    buildMockCard({
        title: 'Ezra Bridger',
        subtitle: 'Spectre Six',
        power: 4,
        hp: 5,
        cost: 4,
        hasNonKeywordAbility: true,
        aspects: ['vigilance', 'command', 'heroism'],
        keywords: ['raid 1'],
        types: ['unit'],
        traits: ['force', 'rebel', 'spectre'],
        setId: {
            set: 'LAW',
            number: 35,
        },
        unique: true,
        arena: 'ground',
        internalName: 'ezra-bridger#spectre-six',
    }),
    buildMockCard({
        title: 'Hera Syndulla',
        subtitle: 'Not Fighting Alone',
        power: 3,
        hp: 6,
        cost: 5,
        hasNonKeywordAbility: true,
        aspects: ['command', 'heroism'],
        keywords: ['restore 1'],
        types: ['leader'],
        traits: ['rebel', 'twi\'lek', 'spectre'],
        setId: {
            set: 'LAW',
            number: 9,
        },
        unique: true,
        arena: 'ground',
        internalName: 'hera-syndulla#not-fighting-alone',
    }),
    buildMockCard({
        title: 'Fulcrum',
        power: 2,
        hp: 2,
        upgradePower: 2,
        upgradeHp: 2,
        cost: 5,
        hasNonKeywordAbility: true,
        aspects: ['command', 'heroism'],
        types: ['upgrade'],
        traits: ['rebel'],
        setId: {
            set: 'LAW',
            number: 150,
        },
        unique: true,
        internalName: 'fulcrum',
    }),
    buildMockCard({
        title: 'Phantom',
        subtitle: 'Spectre Shuttle',
        power: 2,
        hp: 2,
        cost: 2,
        hasNonKeywordAbility: true,
        aspects: ['command', 'heroism'],
        types: ['unit'],
        traits: ['rebel', 'vehicle', 'transport', 'spectre'],
        setId: {
            set: 'LAW',
            number: 144,
        },
        unique: true,
        arena: 'space',
        internalName: 'phantom#spectre-shuttle',
    }),
    buildMockCard({
        title: 'Rey',
        subtitle: 'Skywalker',
        power: 9,
        hp: 9,
        cost: 8,
        hasNonKeywordAbility: true,
        aspects: ['command', 'heroism'],
        types: ['unit'],
        traits: ['force', 'jedi', 'resistance'],
        setId: {
            set: 'LAW',
            number: 149,
        },
        unique: true,
        arena: 'ground',
        internalName: 'rey#skywalker',
    }),
    buildMockCard({
        title: 'Putting a Team Together',
        cost: 1,
        hasNonKeywordAbility: true,
        aspects: ['command'],
        types: ['event'],
        traits: ['plan'],
        setId: {
            set: 'LAW',
            number: 166,
        },
        unique: false,
        internalName: 'putting-a-team-together',
    }),
    buildMockCard({
        title: 'Agent Kallus',
        subtitle: 'Reconsider Your Allegiance',
        power: 3,
        hp: 6,
        cost: 5,
        hasNonKeywordAbility: true,
        aspects: ['vigilance', 'villainy'],
        types: ['leader'],
        traits: ['imperial', 'trooper'],
        setId: {
            set: 'LAW',
            number: 3,
        },
        unique: true,
        arena: 'ground',
        internalName: 'agent-kallus#reconsider-your-allegiance',
    }),
    buildMockCard({
        title: 'Bib Fortuna',
        subtitle: 'Die Wanna Wanga?',
        power: 3,
        hp: 2,
        cost: 2,
        hasNonKeywordAbility: true,
        aspects: ['command', 'villainy'],
        types: ['unit'],
        traits: ['underworld', 'twi\'lek'],
        setId: {
            set: 'LAW',
            number: 134,
        },
        unique: true,
        arena: 'ground',
        internalName: 'bib-fortuna#die-wanna-wanga',
    }),
    buildMockCard({
        title: '4-LOM',
        subtitle: 'Devious',
        power: 4,
        hp: 5,
        cost: 5,
        hasNonKeywordAbility: true,
        aspects: ['command', 'cunning', 'villainy'],
        types: ['unit'],
        traits: ['underworld', 'droid', 'bounty hunter'],
        setId: {
            set: 'LAW',
            number: 65,
        },
        unique: true,
        arena: 'ground',
        internalName: '4lom#devious',
    }),
    buildMockCard({
        title: 'Finn',
        subtitle: 'Looking Closer',
        power: 6,
        hp: 5,
        cost: 6,
        hasNonKeywordAbility: true,
        aspects: ['vigilance', 'cunning'],
        keywords: ['ambush'],
        types: ['unit'],
        traits: ['resistance'],
        setId: {
            set: 'LAW',
            number: 95,
        },
        unique: true,
        arena: 'ground',
        internalName: 'finn#looking-closer',
    }),
    buildMockCard({
        title: 'The Blade Wing',
        subtitle: 'The Secret of Shantipole',
        power: 3,
        hp: 3,
        cost: 6,
        hasNonKeywordAbility: true,
        aspects: ['cunning'],
        types: ['unit'],
        traits: ['rebel', 'vehicle', 'fighter'],
        setId: {
            set: 'LAW',
            number: 241,
        },
        unique: true,
        arena: 'space',
        internalName: 'the-blade-wing#the-secret-of-shantipole',
    }),
    buildMockCard({
        title: 'Backed by the Hutts',
        cost: 3,
        hasNonKeywordAbility: true,
        aspects: ['cunning'],
        types: ['event'],
        traits: ['supply'],
        setId: {
            set: 'LAW',
            number: 247,
        },
        unique: false,
        internalName: 'backed-by-the-hutts',
    }),
    buildMockCard({
        title: 'Nothing Left to Fear',
        cost: 5,
        hasNonKeywordAbility: true,
        aspects: ['vigilance', 'command'],
        types: ['event'],
        traits: ['innate'],
        setId: {
            set: 'LAW',
            number: 41,
        },
        unique: false,
        internalName: 'nothing-left-to-fear',
    }),
    buildMockCard({
        title: 'Lando Calrissian',
        subtitle: 'Full Sabacc',
        power: 4,
        hp: 7,
        cost: 6,
        hasNonKeywordAbility: true,
        aspects: ['cunning', 'heroism'],
        types: ['leader'],
        traits: ['underworld'],
        setId: {
            set: 'LAW',
            number: 18,
        },
        unique: true,
        arena: 'ground',
        internalName: 'lando-calrissian#full-sabacc',
    }),
    buildMockCard({
        title: 'Vermillion',
        subtitle: 'Qi\'ra\'s Auction House',
        power: 5,
        hp: 7,
        cost: 6,
        hasNonKeywordAbility: true,
        aspects: ['cunning', 'villainy'],
        types: ['unit'],
        traits: ['underworld', 'vehicle', 'capital ship'],
        setId: {
            set: 'LAW',
            number: 215,
        },
        unique: true,
        arena: 'space',
        internalName: 'vermillion#qiras-auction-house',
    }),
    buildMockCard({
        title: 'Fett\'s Firespray',
        subtitle: 'In Pursuit',
        power: 6,
        hp: 4,
        cost: 6,
        hasNonKeywordAbility: true,
        aspects: ['villainy'],
        types: ['unit'],
        traits: ['underworld', 'vehicle', 'transport'],
        setId: {
            set: 'LAW',
            number: 252,
        },
        unique: true,
        arena: 'space',
        internalName: 'fetts-firespray#in-pursuit',
    }),
    buildMockCard({
        title: 'Lawbringer',
        subtitle: 'Shadow Over Lothal',
        power: 7,
        hp: 7,
        cost: 8,
        hasNonKeywordAbility: true,
        aspects: ['vigilance', 'villainy'],
        types: ['unit'],
        traits: ['imperial', 'vehicle', 'capital ship'],
        setId: {
            set: 'LAW',
            number: 101,
        },
        unique: true,
        arena: 'space',
        internalName: 'lawbringer#shadow-over-lothal',
    }),
    buildMockCard({
        title: 'Luke Skywalker',
        subtitle: 'Profit or Be Destroyed',
        power: 9,
        hp: 7,
        cost: 7,
        hasNonKeywordAbility: true,
        aspects: ['aggression', 'cunning', 'heroism'],
        types: ['unit'],
        traits: ['force', 'jedi', 'rebel'],
        setId: {
            set: 'LAW',
            number: 80,
        },
        unique: true,
        arena: 'ground',
        internalName: 'luke-skywalker#profit-or-be-destroyed',
    }),
    buildMockCard({
        title: 'Chewbacca',
        subtitle: 'Mighty Rescuer',
        power: 4,
        hp: 4,
        cost: 4,
        hasNonKeywordAbility: true,
        aspects: ['vigilance', 'command', 'heroism'],
        types: ['unit'],
        traits: ['rebel', 'wookiee'],
        setId: {
            set: 'LAW',
            number: 34,
        },
        unique: true,
        arena: 'ground',
        internalName: 'chewbacca#mighty-rescuer',
    }),
    buildMockCard({
        title: 'Lepi Lookout',
        power: 3,
        hp: 1,
        cost: 2,
        hasNonKeywordAbility: false,
        keywords: ['shielded', 'overwhelm'],
        aspects: ['vigilance', 'command'],
        types: ['unit'],
        traits: ['underworld'],
        setId: {
            set: 'LAW',
            number: 38,
        },
        unique: false,
        arena: 'ground',
        internalName: 'lepi-lookout',
    }),
    buildMockCard({
        title: 'Alliance Outpost',
        hp: 26,
        hasNonKeywordAbility: true,
        aspects: ['vigilance'],
        types: ['base'],
        traits: ['lowick'],
        setId: {
            set: 'LAW',
            number: 19,
        },
        unique: false,
        internalName: 'alliance-outpost',
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
