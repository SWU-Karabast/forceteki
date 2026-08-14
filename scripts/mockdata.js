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
        title: 'Princess Leia',
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
        internalName: 'princess-leia#on-a-diplomatic-mission'
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
        title: 'Beast',
        cost: 0,
        power: 3,
        hp: 3,
        hasNonKeywordAbility: false,
        traits: ['creature'],
        types: ['token', 'unit'],
        setId: {
            set: 'HMW',
        },
        unique: false,
        arena: 'ground',
        internalName: 'beast'
    }),
    buildMockCard({
        title: 'Weakness',
        cost: 0,
        power: -1,
        upgradePower: -1,
        hp: -1,
        upgradeHp: -1,
        hasNonKeywordAbility: false,
        traits: ['condition'],
        types: ['token', 'upgrade'],
        setId: {
            set: 'HMW',
        },
        unique: false,
        internalName: 'weakness'
    }),
    buildMockCard({
        title: 'Chewbacca',
        subtitle: 'Relentless Rebel',
        cost: 5,
        power: 3,
        hp: 6,
        hasNonKeywordAbility: true,
        aspects: ['command', 'heroism'],
        traits: ['rebel', 'wookiee'],
        types: ['leader'],
        setId: {
            set: 'HMW',
            number: 9
        },
        unique: true,
        arena: 'ground',
        internalName: 'chewbacca#relentless-rebel'
    }),
    buildMockCard({
        title: 'Dune Sea',
        hp: 30,
        hasNonKeywordAbility: false,
        aspects: ['vigilance'],
        traits: ['tatooine'],
        types: ['base'],
        setId: {
            set: 'HMW',
            number: 19
        },
        unique: false,
        internalName: 'dune-sea'
    }),
    buildMockCard({
        title: 'Clone X Assassin',
        cost: 2,
        power: 1,
        hp: 3,
        hasNonKeywordAbility: true,
        aspects: ['vigilance', 'villainy'],
        traits: ['imperial', 'clone', 'trooper'],
        types: ['unit'],
        setId: {
            set: 'HMW',
            number: 59
        },
        unique: false,
        arena: 'ground',
        internalName: 'clone-x-assassin'
    }),
    buildMockCard({
        title: 'Hijacked AT-ST',
        cost: 5,
        power: 7,
        hp: 7,
        hasNonKeywordAbility: true,
        aspects: ['command', 'heroism'],
        keywords: ['overwhelm'],
        traits: ['rebel', 'vehicle', 'walker'],
        types: ['unit'],
        setId: {
            set: 'HMW',
            number: 121
        },
        unique: false,
        arena: 'ground',
        internalName: 'hijacked-atst'
    }),
    buildMockCard({
        title: 'Chewbacca\'s Bowcaster',
        subtitle: 'Handcrafted Tradition',
        cost: 3,
        power: 3,
        upgradePower: 3,
        hp: 1,
        upgradeHp: 1,
        hasNonKeywordAbility: true,
        aspects: ['command', 'heroism'],
        traits: ['item', 'weapon'],
        types: ['upgrade'],
        setId: {
            set: 'HMW',
            number: 127
        },
        unique: true,
        internalName: 'chewbaccas-bowcaster#handcrafted-tradition'
    }),
    buildMockCard({
        title: 'Ezra Bridger',
        subtitle: 'What Are You Afraid Of?',
        cost: 4,
        power: 5,
        hp: 4,
        hasNonKeywordAbility: true,
        aspects: ['aggression', 'heroism'],
        traits: ['force', 'rebel', 'spectre'],
        types: ['unit'],
        setId: {
            set: 'HMW',
            number: 158
        },
        unique: true,
        arena: 'ground',
        internalName: 'ezra-bridger#what-are-you-afraid-of'
    }),
    buildMockCard({
        title: 'Wookiee Rangers',
        cost: 5,
        power: 5,
        hp: 6,
        hasNonKeywordAbility: true,
        aspects: ['command'],
        traits: ['wookiee'],
        types: ['unit'],
        setId: {
            set: 'HMW',
            number: 142
        },
        unique: false,
        arena: 'ground',
        internalName: 'wookiee-rangers'
    }),
    buildMockCard({
        title: 'Adamant Ewoks',
        cost: 2,
        power: 3,
        hp: 2,
        hasNonKeywordAbility: true,
        aspects: ['aggression'],
        traits: ['ewok'],
        types: ['unit'],
        setId: {
            set: 'HMW',
            number: 177
        },
        unique: false,
        arena: 'ground',
        internalName: 'adamant-ewoks'
    }),
    buildMockCard({
        title: 'Origin Tree',
        hp: 30,
        hasNonKeywordAbility: false,
        aspects: ['command'],
        traits: ['kashyyyk'],
        types: ['base'],
        setId: {
            set: 'HMW',
            number: 24
        },
        unique: false,
        internalName: 'origin-tree'
    }),
    buildMockCard({
        title: 'Great Grass Plains',
        hp: 30,
        hasNonKeywordAbility: false,
        aspects: ['vigilance'],
        traits: ['naboo'],
        types: ['base'],
        setId: {
            set: 'HMW',
            number: 20
        },
        unique: false,
        internalName: 'great-grass-plains'
    }),
    buildMockCard({
        title: 'Dendroid Wilds',
        hp: 30,
        hasNonKeywordAbility: false,
        aspects: ['aggression'],
        traits: ['endor'],
        types: ['base'],
        setId: {
            set: 'HMW',
            number: 27
        },
        unique: false,
        internalName: 'dendroid-wilds'
    }),
    buildMockCard({
        title: 'Kyyyalstaad Swamp',
        hp: 30,
        hasNonKeywordAbility: false,
        aspects: ['cunning'],
        traits: ['kashyyyk'],
        types: ['base'],
        setId: {
            set: 'HMW',
            number: 31
        },
        unique: false,
        internalName: 'kyyyalstaad-swamp'
    }),
    buildMockCard({
        title: 'Otoh Gunga',
        hp: 33,
        hasNonKeywordAbility: false,
        aspects: ['cunning'],
        traits: ['naboo'],
        types: ['base'],
        setId: {
            set: 'HMW',
            number: 31
        },
        unique: false,
        internalName: 'otoh-gunga'
    }),
    buildMockCard({
        title: 'Research Station 9',
        hp: 34,
        hasNonKeywordAbility: false,
        aspects: ['cunning'],
        traits: ['endor'],
        types: ['base'],
        setId: {
            set: 'HMW',
            number: 31
        },
        unique: false,
        internalName: 'research-station-9'
    }),
    buildMockCard({
        title: 'Ritual Dragon',
        cost: 8,
        power: 6,
        hp: 9,
        hasNonKeywordAbility: true,
        aspects: ['cunning'],
        traits: ['creature'],
        keywords: ['saboteur'],
        types: ['unit'],
        setId: {
            set: 'HMW',
            number: 234
        },
        unique: false,
        arena: 'ground',
        internalName: 'ritual-dragon'
    }),
    buildMockCard({
        title: 'Gunga City Guards',
        cost: 2,
        power: 2,
        hp: 1,
        hasNonKeywordAbility: true,
        aspects: ['vigilance'],
        traits: ['gungan'],
        keywords: ['restore 1'],
        types: ['unit'],
        setId: {
            set: 'HMW',
            number: 84
        },
        unique: false,
        arena: 'ground',
        internalName: 'gunga-city-guards'
    }),
    buildMockCard({
        title: 'C-3PO',
        subtitle: 'Captivating Storyteller',
        cost: 2,
        power: 2,
        hp: 3,
        hasNonKeywordAbility: true,
        aspects: ['heroism'],
        traits: ['rebel', 'droid'],
        types: ['unit'],
        setId: {
            set: 'HMW',
            number: 255
        },
        unique: true,
        arena: 'ground',
        internalName: 'c3po#captivating-storyteller'
    }),
    buildMockCard({
        title: 'Doctor Hemlock',
        subtitle: 'Emotion Has No Place Here',
        cost: 6,
        power: 3,
        hp: 6,
        hasNonKeywordAbility: true,
        aspects: ['vigilance', 'villainy'],
        traits: ['imperial', 'official'],
        types: ['leader'],
        setId: {
            set: 'HMW',
            number: 3
        },
        unique: true,
        arena: 'ground',
        internalName: 'doctor-hemlock#emotion-has-no-place-here'
    }),
    buildMockCard({
        title: 'Remote Scout',
        cost: 2,
        power: 1,
        hp: 3,
        hasNonKeywordAbility: true,
        aspects: ['vigilance'],
        traits: ['imperial', 'trooper'],
        types: ['unit'],
        setId: {
            set: 'HMW',
            number: 85
        },
        unique: false,
        arena: 'ground',
        internalName: 'remote-scout'
    }),
    buildMockCard({
        title: 'Wicket',
        subtitle: 'Few Greater Battles to Fight',
        cost: 4,
        power: 2,
        hp: 5,
        hasNonKeywordAbility: true,
        aspects: ['aggression', 'heroism'],
        traits: ['ewok'],
        types: ['leader'],
        setId: {
            set: 'HMW',
            number: 14
        },
        unique: true,
        arena: 'ground',
        internalName: 'wicket#few-greater-battles-to-fight'
    }),
    buildMockCard({
        title: 'Darth Vader',
        subtitle: 'Any Methods Necessary',
        cost: 9,
        power: 9,
        hp: 8,
        hasNonKeywordAbility: true,
        aspects: ['aggression', 'command', 'villainy'],
        traits: ['force', 'imperial', 'sith'],
        types: ['unit'],
        keywords: ['saboteur'],
        setId: {
            set: 'HMW',
            number: 43
        },
        unique: true,
        arena: 'ground',
        internalName: 'darth-vader#any-methods-necessary'
    }),
    buildMockCard({
        title: 'Logray',
        subtitle: 'Bright Tree Shaman',
        cost: 2,
        power: 1,
        hp: 5,
        hasNonKeywordAbility: true,
        aspects: ['command', 'aggression'],
        traits: ['ewok'],
        types: ['unit'],
        setId: {
            set: 'HMW',
            number: 45
        },
        unique: true,
        arena: 'ground',
        internalName: 'logray#bright-tree-shaman'
    }),
    buildMockCard({
        title: 'Vernestra Rwoh',
        subtitle: 'We Should Handle This Ourselves',
        cost: 6,
        power: 5,
        hp: 5,
        hasNonKeywordAbility: true,
        aspects: ['command', 'cunning'],
        traits: ['force', 'jedi'],
        types: ['unit'],
        keywords: ['sentinel'],
        setId: {
            set: 'HMW',
            number: 48
        },
        unique: true,
        arena: 'ground',
        internalName: 'vernestra-rwoh#we-should-handle-this-ourselves'
    }),
    buildMockCard({
        title: 'Vice Admiral Rampart',
        subtitle: 'A New Era of Safety',
        cost: 2,
        power: 1,
        hp: 5,
        hasNonKeywordAbility: true,
        aspects: ['vigilance', 'villainy'],
        traits: ['imperial', 'official'],
        types: ['unit'],
        setId: {
            set: 'HMW',
            number: 60
        },
        unique: true,
        arena: 'ground',
        internalName: 'vice-admiral-rampart#a-new-era-of-safety'
    }),
    buildMockCard({
        title: 'Director Krennic',
        subtitle: 'The Work Has Stalled',
        cost: 3,
        power: 3,
        hp: 4,
        hasNonKeywordAbility: true,
        aspects: ['vigilance', 'villainy'],
        traits: ['imperial', 'official'],
        types: ['unit'],
        setId: {
            set: 'HMW',
            number: 61
        },
        unique: true,
        arena: 'ground',
        internalName: 'director-krennic#the-work-has-stalled'
    }),
    buildMockCard({
        title: 'Nuvo Vindi',
        subtitle: 'Blue Shadow Perfected',
        cost: 3,
        power: 1,
        hp: 4,
        hasNonKeywordAbility: true,
        aspects: ['vigilance', 'villainy'],
        traits: ['separatist'],
        types: ['unit'],
        setId: {
            set: 'HMW',
            number: 62
        },
        unique: true,
        arena: 'ground',
        internalName: 'nuvo-vindi#blue-shadow-perfected'
    }),
    buildMockCard({
        title: 'Boss Nass',
        subtitle: 'Otoh Gunga Boss',
        cost: 4,
        power: 4,
        hp: 6,
        hasNonKeywordAbility: true,
        aspects: ['vigilance', 'heroism'],
        traits: ['gungan', 'official'],
        types: ['unit'],
        setId: {
            set: 'HMW',
            number: 77
        },
        unique: true,
        arena: 'ground',
        internalName: 'boss-nass#otoh-gunga-boss'
    }),
    buildMockCard({
        title: 'Luminara Unduli',
        subtitle: 'Besieged General',
        cost: 7,
        power: 7,
        hp: 7,
        hasNonKeywordAbility: true,
        aspects: ['command', 'heroism'],
        traits: ['force', 'jedi', 'republic'],
        types: ['unit'],
        setId: {
            set: 'HMW',
            number: 124
        },
        unique: true,
        arena: 'ground',
        internalName: 'luminara-unduli#besieged-general'
    }),
    buildMockCard({
        title: 'Lifetree Caravan',
        cost: 3,
        power: 2,
        hp: 1,
        hasNonKeywordAbility: true,
        aspects: ['command'],
        traits: ['ewok'],
        types: ['unit'],
        setId: {
            set: 'HMW',
            number: 136
        },
        unique: false,
        arena: 'ground',
        internalName: 'lifetree-caravan'
    }),
    buildMockCard({
        title: 'Inferno Squad',
        subtitle: 'We Can Grieve Later',
        cost: 5,
        power: 3,
        hp: 6,
        hasNonKeywordAbility: true,
        aspects: ['cunning', 'villainy'],
        traits: ['imperial', 'trooper'],
        types: ['unit'],
        setId: {
            set: 'HMW',
            number: 202
        },
        unique: true,
        arena: 'ground',
        internalName: 'inferno-squad#we-can-grieve-later'
    }),
    buildMockCard({
        title: 'Rish Loo',
        subtitle: 'Traitorous Minister',
        cost: 4,
        power: 3,
        hp: 2,
        hasNonKeywordAbility: true,
        aspects: ['cunning', 'villainy'],
        traits: ['separatist', 'gungan', 'official'],
        keywords: ['hidden'],
        types: ['unit'],
        setId: {
            set: 'HMW',
            number: 200
        },
        unique: true,
        arena: 'ground',
        internalName: 'rish-loo#traitorous-minister'
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
