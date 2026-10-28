const mockCards = [
    // -------- Begin Mock Cards --------
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
        title: 'Admiral Holdo',
        subtitle: 'We Are The Spark',
        cost: 5,
        power: 3,
        hp: 7,
        hasNonKeywordAbility: true,
        aspects: ['vigilance', 'heroism'],
        traits: ['resistance', 'official'],
        types: ['unit'],
        setId: {
            set: 'IC27',
            number: 38
        },
        unique: true,
        arena: 'ground',
        internalName: 'admiral-holdo#we-are-the-spark'
    }),
    buildMockCard({
        title: 'Grand Inquisitor',
        subtitle: 'How The Mighty Will Fall',
        cost: 4,
        power: 3,
        hp: 6,
        hasNonKeywordAbility: true,
        aspects: ['aggression', 'villainy'],
        traits: ['force', 'imperial', 'inquisitor'],
        types: ['unit'],
        setId: {
            set: 'IC27',
            number: 103
        },
        unique: true,
        arena: 'ground',
        internalName: 'grand-inquisitor#how-the-mighty-will-fall'
    }),
    buildMockCard({
        title: 'Captain Rex',
        subtitle: 'Staunch Advocate',
        cost: 7,
        power: 7,
        hp: 5,
        hasNonKeywordAbility: false,
        aspects: ['vigilance', 'heroism'],
        traits: ['republic', 'clone', 'trooper'],
        keywords: ['sentinel', 'shielded', 'restore 3'],
        types: ['unit'],
        setId: {
            set: 'IC27',
            number: 41
        },
        unique: true,
        arena: 'ground',
        internalName: 'captain-rex#staunch-advocate'
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
        title: 'Millennium Falcon',
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
        internalName: 'millennium-falcon#yahoo'
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
        title: 'Grand Admiral Thrawn',
        subtitle: 'Listen to Me Carefully',
        cost: 6,
        power: 4,
        hp: 4,
        hasNonKeywordAbility: true,
        aspects: ['vigilance', 'villainy'],
        traits: ['imperial', 'official'],
        types: ['unit'],
        setId: {
            set: 'IC27',
            number: 24
        },
        unique: true,
        arena: 'ground',
        internalName: 'grand-admiral-thrawn#listen-to-me-carefully'
    }),
    buildMockCard({
        title: 'Qui-Gon Jinn',
        subtitle: 'Unwavering Belief',
        cost: 5,
        power: 5,
        hp: 5,
        hasNonKeywordAbility: true,
        aspects: ['command', 'heroism'],
        keywords: ['sentinel'],
        traits: ['republic', 'force', 'jedi'],
        types: ['unit'],
        setId: {
            set: 'IC27',
            number: 79
        },
        unique: true,
        arena: 'ground',
        internalName: 'quigon-jinn#unwavering-belief'
    }),
    buildMockCard({
        title: 'Kanan Jarrus',
        subtitle: 'Sometimes I Hate Being Right',
        cost: 6,
        power: 8,
        hp: 7,
        hasNonKeywordAbility: false,
        aspects: ['aggression', 'heroism'],
        traits: ['force', 'jedi', 'rebel', 'spectre'],
        types: ['unit'],
        setId: {
            set: 'IC27',
            number: 121
        },
        unique: true,
        arena: 'ground',
        internalName: 'kanan-jarrus#sometimes-i-hate-being-right'
    }),
    buildMockCard({
        title: 'Obi-Wan\'s Interceptor',
        subtitle: 'Nothing Too Fancy',
        cost: 2,
        power: 2,
        hp: 3,
        hasNonKeywordAbility: true,
        aspects: ['vigilance', 'heroism'],
        traits: ['jedi', 'republic', 'vehicle', 'fighter'],
        types: ['unit'],
        setId: {
            set: 'IC27',
            number: 34
        },
        unique: true,
        arena: 'space',
        internalName: 'obiwans-interceptor#nothing-too-fancy'
    }),
    buildMockCard({
        title: 'Poggle the Lesser',
        subtitle: 'Secret Designs',
        cost: 4,
        power: 3,
        hp: 5,
        hasNonKeywordAbility: true,
        aspects: ['cunning', 'villainy'],
        traits: ['separatist', 'official'],
        types: ['unit'],
        setId: {
            set: 'IC27',
            number: 145
        },
        unique: true,
        arena: 'ground',
        internalName: 'poggle-the-lesser#secret-designs'
    }),
    buildMockCard({
        title: 'C-3PO',
        subtitle: 'Impulse Buy',
        cost: 1,
        power: 1,
        hp: 3,
        hasNonKeywordAbility: true,
        aspects: ['command', 'heroism'],
        traits: ['rebel', 'droid'],
        types: ['unit'],
        setId: {
            set: 'IC27',
            number: 70
        },
        unique: true,
        arena: 'ground',
        internalName: 'c3po#impulse-buy'
    }),
    buildMockCard({
        title: 'Darth Maul',
        subtitle: 'Mindful Apprentice',
        cost: 6,
        power: 4,
        hp: 7,
        hasNonKeywordAbility: false,
        aspects: ['command', 'villainy'],
        keywords: ['sentinel', 'overwhelm', 'raid 3'],
        traits: ['force', 'sith'],
        types: ['unit'],
        setId: {
            set: 'IC27',
            number: 65
        },
        unique: true,
        arena: 'ground',
        internalName: 'darth-maul#mindful-apprentice'
    }),
    buildMockCard({
        title: 'Greef Karga',
        subtitle: 'I Celebrate Your Success',
        cost: 2,
        power: 0,
        hp: 5,
        hasNonKeywordAbility: false,
        aspects: ['cunning', 'heroism'],
        keywords: ['raid 3'],
        traits: ['official'],
        types: ['unit'],
        setId: {
            set: 'IC27',
            number: 153
        },
        unique: true,
        arena: 'ground',
        internalName: 'greef-karga#i-celebrate-your-success'
    }),
    buildMockCard({
        title: 'Wat Tambor',
        subtitle: 'Warped Warbling',
        cost: 3,
        power: 4,
        hp: 2,
        hasNonKeywordAbility: true,
        aspects: ['cunning', 'villainy'],
        keywords: ['sentinel'],
        traits: ['separatist', 'official'],
        types: ['unit'],
        setId: {
            set: 'IC27',
            number: 143
        },
        unique: true,
        arena: 'ground',
        internalName: 'wat-tambor#warped-warbling'
    }),
    buildMockCard({
        title: 'Rey',
        subtitle: 'In Balance',
        cost: 5,
        power: 3,
        hp: 6,
        hasNonKeywordAbility: true,
        aspects: ['vigilance', 'heroism'],
        traits: ['force', 'resistance'],
        types: ['leader'],
        setId: {
            set: 'IC27',
            number: 2
        },
        unique: true,
        arena: 'ground',
        internalName: 'rey#in-balance'
    }),
    buildMockCard({
        title: 'BB-8',
        subtitle: 'Frazzled Friend',
        cost: 1,
        power: 0,
        hp: 4,
        hasNonKeywordAbility: true,
        aspects: ['vigilance', 'heroism'],
        traits: ['resistance', 'droid'],
        types: ['unit'],
        setId: {
            set: 'IC27',
            number: 31
        },
        unique: true,
        arena: 'ground',
        internalName: 'bb8#frazzled-friend'
    }),
    buildMockCard({
        title: 'Kaydel Connix',
        subtitle: 'Keep Going!',
        cost: 2,
        power: 1,
        hp: 5,
        hasNonKeywordAbility: false,
        aspects: ['vigilance', 'heroism'],
        keywords: ['sentinel'],
        traits: ['resistance'],
        types: ['unit'],
        setId: {
            set: 'IC27',
            number: 32
        },
        unique: true,
        arena: 'ground',
        internalName: 'kaydel-connix#keep-going'
    }),
    buildMockCard({
        title: 'Finn',
        subtitle: 'Stand and Fight',
        cost: 4,
        power: 4,
        hp: 5,
        hasNonKeywordAbility: true,
        aspects: ['vigilance', 'heroism'],
        keywords: ['sentinel'],
        traits: ['resistance'],
        types: ['unit'],
        setId: {
            set: 'IC27',
            number: 37
        },
        unique: true,
        arena: 'ground',
        internalName: 'finn#stand-and-fight'
    }),
    buildMockCard({
        title: 'Rose Tico',
        subtitle: 'In The Fight',
        cost: 6,
        power: 6,
        hp: 6,
        hasNonKeywordAbility: true,
        aspects: ['vigilance', 'heroism'],
        keywords: ['shielded'],
        traits: ['resistance'],
        types: ['unit'],
        setId: {
            set: 'IC27',
            number: 40
        },
        unique: true,
        arena: 'ground',
        internalName: 'rose-tico#in-the-fight'
    }),
    buildMockCard({
        title: 'General Veers',
        subtitle: 'Prepared',
        cost: 2,
        power: 3,
        hp: 3,
        hasNonKeywordAbility: false,
        aspects: ['command', 'villainy'],
        keywords: ['overwhelm'],
        traits: ['imperial', 'official'],
        types: ['unit'],
        setId: {
            set: 'IC27',
            number: 58
        },
        unique: true,
        arena: 'ground',
        internalName: 'general-veers#prepared'
    }),
    buildMockCard({
        title: 'Admiral Motti',
        subtitle: 'Conan in Command',
        cost: 4,
        power: 2,
        hp: 6,
        hasNonKeywordAbility: true,
        aspects: ['command', 'villainy'],
        keywords: ['hidden'],
        traits: ['imperial', 'official'],
        types: ['unit'],
        setId: {
            set: 'IC27',
            number: 62
        },
        unique: true,
        arena: 'ground',
        internalName: 'admiral-motti#conan-in-command'
    }),
    buildMockCard({
        title: 'Dryden Vos',
        subtitle: 'Thumb-Spiking the Scale',
        cost: 2,
        power: 1,
        hp: 4,
        hasNonKeywordAbility: true,
        aspects: ['vigilance', 'villainy'],
        traits: ['underworld'],
        types: ['unit'],
        setId: {
            set: 'IC27',
            number: 14
        },
        unique: true,
        arena: 'ground',
        internalName: 'dryden-vos#thumbspiking-the-scale'
    }),
    buildMockCard({
        title: 'General Grievous',
        subtitle: 'Four-Armed Menace',
        cost: 4,
        power: 4,
        hp: 5,
        hasNonKeywordAbility: true,
        aspects: ['vigilance', 'villainy'],
        traits: ['separatist', 'official'],
        types: ['unit'],
        setId: {
            set: 'IC27',
            number: 21
        },
        unique: true,
        arena: 'ground',
        internalName: 'general-grievous#fourarmed-menace'
    }),
    buildMockCard({
        title: 'Qi\'ra',
        subtitle: 'Survivor',
        cost: 3,
        power: 1,
        hp: 1,
        hasNonKeywordAbility: true,
        aspects: ['vigilance', 'vigilance'],
        traits: ['underworld'],
        types: ['unit'],
        setId: {
            set: 'IC27',
            number: 45
        },
        unique: true,
        arena: 'ground',
        internalName: 'qira#survivor'
    }),
    buildMockCard({
        title: 'Dexter Jettster',
        subtitle: 'Obi-Wannnn!!!',
        cost: 3,
        power: 2,
        hp: 6,
        hasNonKeywordAbility: true,
        aspects: ['vigilance'],
        traits: ['fringe'],
        types: ['unit'],
        setId: {
            set: 'IC27',
            number: 49
        },
        unique: true,
        arena: 'ground',
        internalName: 'dexter-jettster#obiwannnn'
    }),
    buildMockCard({
        title: 'Vigilant Defense',
        cost: 4,
        hasNonKeywordAbility: true,
        aspects: ['vigilance', 'vigilance'],
        traits: ['tactic'],
        types: ['event'],
        setId: {
            set: 'IC27',
            number: 46
        },
        unique: false,
        internalName: 'vigilant-defense'
    }),
    buildMockCard({
        title: 'The Mandalorian',
        subtitle: 'From the Shadows',
        cost: 4,
        power: 5,
        hp: 3,
        hasNonKeywordAbility: true,
        aspects: ['cunning', 'heroism'],
        keywords: ['shielded'],
        traits: ['mandalorian', 'bounty hunter'],
        types: ['unit'],
        setId: {
            set: 'IC27',
            number: 157
        },
        unique: true,
        arena: 'ground',
        internalName: 'the-mandalorian#from-the-shadows'
    }),
    buildMockCard({
        title: 'Bo-Katan Kryze',
        subtitle: 'Right Place, Right Time',
        cost: 7,
        power: 7,
        hp: 6,
        hasNonKeywordAbility: true,
        aspects: ['cunning', 'heroism'],
        keywords: ['shielded'],
        traits: ['mandalorian'],
        types: ['unit'],
        setId: {
            set: 'IC27',
            number: 163
        },
        unique: true,
        arena: 'ground',
        internalName: 'bokatan-kryze#right-place-right-time'
    }),
    // -------- End Mock Cards --------
];

// -------- Begin Mock Reprints --------
// For cards already in the official data that are reprinted in an upcoming (mocked) set.
// Instead of a buildMockCard entry - which would shadow the official card data and drop
// the real card's other printings - the new set code is grafted onto the official card's
// setCodes, so the real stats and the existing card implementation are reused as-is.
// Note: `set` must exist in the `setNumber` map in fetchdata.js to be picked up.
const mockReprints = [
    { internalName: 'concord-dawn-interceptors', setId: { set: 'IC27', number: 36 } },
    { internalName: 'disciples-devotion', setId: { set: 'IC27', number: 53 } },
    { internalName: 'apology-accepted', setId: { set: 'IC27', number: 69 } },
    { internalName: 'dogfight', setId: { set: 'IC27', number: 94 } },
    { internalName: 'homestead-militia', setId: { set: 'IC27', number: 94 } },
    { internalName: 'cham-syndulla#rallying-ryloth', setId: { set: 'IC27', number: 131 } },
];
// -------- End Mock Reprints --------

/** @param {{ title: string, subtitle: string?, hasNonKeywordAbility: boolean, cost: number?, hp: number?, arena?: string, unique: boolean, upgradeHp: number?, upgradePower: number?, aspects: string[]?, traits: string[]?, keywords: string[]?, types: string[], setId: { set: string, number: number }, internalName: string, text: string?, deployBox: string?, epicAction: string?, backSideTitle: string?, backSideSubtitle: string?, backSideTraits: string[]?, backSideAspects: string[]? }} cardData */
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

    if (cardData.text != null) {
        text = cardData.text;
    }

    if (cardData.deployBox != null) {
        deployBox = cardData.deployBox;
    }

    const data = {
        title: cardData.title,
        subtitle: cardData.subtitle || '',
        cost: cardData.cost ?? null,
        hp: cardData.hp ?? null,
        power: cardData.power ?? null,
        text,
        deployBox,
        epicAction: cardData.epicAction ?? '',
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

    // Optional back-side attributes for leaders whose deployed side differs from the leader side.
    if (cardData.backSideTitle != null) {
        data.backSideTitle = cardData.backSideTitle;
    }
    if (cardData.backSideSubtitle != null) {
        data.backSideSubtitle = cardData.backSideSubtitle;
    }
    if (cardData.backSideTraits != null) {
        data.backSideTraits = cardData.backSideTraits;
    }
    if (cardData.backSideAspects != null) {
        data.backSideAspects = cardData.backSideAspects;
    }

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

    applyMockReprints(allCards);

    return { mockCardNames, cards: allCards };
}

/** @param {Array<{ internalName: string, setCodes?: { set: string, number: number }[], setId: { set: string, number: number } }>} allCards */
function applyMockReprints(allCards) {
    for (const reprint of mockReprints) {
        const matches = allCards.filter((card) => card.internalName === reprint.internalName);

        if (matches.length === 0) {
            console.log(`\nWARNING: mock reprint target '${reprint.internalName}' not found in card data. Check the internalName.`);
            continue;
        }

        let patchedCount = 0;
        for (const card of matches) {
            if (!card.setCodes) {
                card.setCodes = [card.setId];
            }

            if (card.setCodes.some((setCode) => setCode.set === reprint.setId.set && setCode.number === reprint.setId.number)) {
                continue;
            }

            card.setCodes.push(reprint.setId);
            patchedCount++;
        }

        if (patchedCount === 0) {
            console.log(`\nMock reprint '${reprint.internalName}' (${buildSetStr(reprint)}) found in official data. The mock reprint can now be safely removed from mockdata.js`);
        }
    }
}

module.exports = { addMockCards };