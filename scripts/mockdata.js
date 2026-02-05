const mockCards = [

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
        title: 'Aldhani Garrison',
        hp: 27,
        hasNonKeywordAbility: true,
        aspects: ['command'],
        types: ['base'],
        setId: {
            set: 'LAW',
            number: 22
        },
        unique: false,
        internalName: 'aldhani-garrison'
    }),
    buildMockCard({
        title: 'Stygeon Spire',
        hp: 27,
        hasNonKeywordAbility: true,
        aspects: ['aggression'],
        types: ['base'],
        setId: {
            set: 'LAW',
            number: 27
        },
        unique: false,
        internalName: 'stygeon-spire'
    }),
    buildMockCard({
        title: 'Canto Bight',
        hp: 27,
        hasNonKeywordAbility: true,
        aspects: ['cunning'],
        types: ['base'],
        setId: {
            set: 'LAW',
            number: 28
        },
        unique: false,
        internalName: 'canto-bight'
    }),
    buildMockCard({
        title: 'Intimidator',
        subtitle: 'Citadel Overwatch',
        power: 11,
        hp: 11,
        cost: 11,
        hasNonKeywordAbility: true,
        aspects: ['command', 'villainy'],
        types: ['unit'],
        traits: ['imperial', 'vehicle', 'capital ship'],
        setId: {
            set: 'LAW',
            number: 140,
        },
        unique: true,
        arena: 'space',
        internalName: 'intimidator#citadel-overwatch',
    }),
    buildMockCard({
        title: 'Persecutor',
        subtitle: 'Fire Over Scarif',
        power: 9,
        hp: 7,
        cost: 9,
        hasNonKeywordAbility: true,
        aspects: ['aggression', 'villainy'],
        types: ['unit'],
        traits: ['imperial', 'vehicle', 'capital ship'],
        setId: {
            set: 'LAW',
            number: 178,
        },
        unique: true,
        arena: 'space',
        internalName: 'persecutor#fire-over-scarif',
    }),
    buildMockCard({
        title: 'Urrr\'k',
        subtitle: 'Elite Sharpshooter',
        power: 2,
        hp: 4,
        cost: 4,
        hasNonKeywordAbility: false,
        aspects: ['aggression', 'cunning'],
        types: ['unit'],
        keywords: ['hidden', 'raid 4'],
        traits: ['rebel', 'tusken', 'bounty hunter'],
        setId: {
            set: 'LAW',
            number: 82,
        },
        unique: true,
        arena: 'ground',
        internalName: 'urrrk#elite-sharpshooter',
    }),
    buildMockCard({
        title: 'Expendable Mercenary',
        power: 3,
        hp: 3,
        cost: 4,
        hasNonKeywordAbility: true,
        aspects: ['command'],
        types: ['unit'],
        traits: ['underworld', 'bounty hunter'],
        setId: {
            set: 'LAW',
            number: 159,
        },
        unique: false,
        arena: 'ground',
        internalName: 'expendable-mercenary',
    }),
    buildMockCard({
        title: 'Vult Skerris\'s Defender',
        subtitle: 'Secret Project',
        power: 3,
        hp: 3,
        cost: 3,
        hasNonKeywordAbility: true,
        aspects: ['aggression', 'cunning', 'villainy'],
        types: ['unit'],
        traits: ['imperial', 'vehicle', 'fighter'],
        setId: {
            set: 'LAW',
            number: 76,
        },
        unique: true,
        arena: 'space',
        internalName: 'vult-skerriss-defender#secret-project',
    }),
    buildMockCard({
        title: 'Fear and Dead Men',
        cost: 7,
        hasNonKeywordAbility: true,
        aspects: ['aggression', 'villainy'],
        types: ['event'],
        traits: ['tactic'],
        setId: {
            set: 'LAW',
            number: 179,
        },
        unique: false,
        internalName: 'fear-and-dead-men',
    }),
    buildMockCard({
        title: 'You Hold This',
        cost: 1,
        hasNonKeywordAbility: true,
        aspects: ['aggression', 'cunning'],
        types: ['event'],
        traits: ['trick'],
        setId: {
            set: 'LAW',
            number: 85,
        },
        unique: false,
        internalName: 'you-hold-this',
    }),
    buildMockCard({
        title: 'Director Krennic',
        subtitle: 'Amidst My Achievement',
        power: 4,
        hp: 9,
        cost: 7,
        hasNonKeywordAbility: true,
        aspects: ['command', 'villainy'],
        types: ['leader'],
        traits: ['imperial', 'official'],
        setId: {
            set: 'LAW',
            number: 8,
        },
        unique: true,
        arena: 'ground',
        internalName: 'director-krennic#amidst-my-achievement',
    }),
    buildMockCard({
        title: 'Galen Erso',
        subtitle: 'Destroying His Creation',
        power: 0,
        hp: 5,
        cost: 3,
        hasNonKeywordAbility: true,
        aspects: ['cunning'],
        types: ['unit'],
        traits: ['imperial'],
        setId: {
            set: 'LAW',
            number: 233,
        },
        unique: true,
        arena: 'ground',
        internalName: 'galen-erso#destroying-his-creation',
    }),
    buildMockCard({
        title: 'Admiral Motti',
        subtitle: 'Chain of Command',
        power: 4,
        hp: 5,
        cost: 5,
        hasNonKeywordAbility: true,
        aspects: ['command', 'villainy'],
        types: ['unit'],
        traits: ['imperial', 'official'],
        setId: {
            set: 'LAW',
            number: 139,
        },
        unique: true,
        arena: 'ground',
        internalName: 'admiral-motti#chain-of-command',
    }),
    buildMockCard({
        title: 'Stockpile',
        cost: 6,
        hasNonKeywordAbility: true,
        aspects: ['command'],
        types: ['event'],
        traits: ['supply'],
        setId: {
            set: 'LAW',
            number: 171,
        },
        unique: false,
        internalName: 'stockpile',
    }),
    buildMockCard({
        title: 'Lady Proxima',
        subtitle: 'Where\'s the Money?',
        power: 1,
        hp: 5,
        cost: 3,
        hasNonKeywordAbility: true,
        aspects: ['cunning'],
        types: ['unit'],
        traits: ['underworld'],
        setId: {
            set: 'LAW',
            number: 235,
        },
        unique: true,
        arena: 'ground',
        internalName: 'lady-proxima#wheres-the-money',
    }),
    buildMockCard({
        title: 'The Master Codebreaker',
        subtitle: 'High Stakes',
        power: 1,
        hp: 4,
        cost: 2,
        hasNonKeywordAbility: true,
        aspects: ['cunning'],
        types: ['unit'],
        traits: ['underworld'],
        setId: {
            set: 'LAW',
            number: 229,
        },
        unique: true,
        arena: 'ground',
        internalName: 'the-master-codebreaker#high-stakes',
    }),
    buildMockCard({
        title: '0-0-0',
        subtitle: 'Translation and Torture',
        power: 4,
        hp: 4,
        cost: 3,
        hasNonKeywordAbility: true,
        aspects: ['aggression', 'villainy'],
        types: ['unit'],
        traits: ['underworld', 'droid'],
        setId: {
            set: 'LAW',
            number: 174,
        },
        unique: true,
        arena: 'ground',
        internalName: '000#translation-and-torture',
    }),
    buildMockCard({
        title: 'Shadow of Stygeon Prime',
        power: 0,
        hp: 0,
        upgradePower: 0,
        upgradeHp: 0,
        cost: 4,
        hasNonKeywordAbility: true,
        aspects: ['aggression', 'cunning', 'villainy'],
        types: ['upgrade'],
        traits: ['condition'],
        setId: {
            set: 'LAW',
            number: 77,
        },
        unique: false,
        internalName: 'shadow-of-stygeon-prime',
    }),
    buildMockCard({
        title: 'BT-1',
        subtitle: 'Blastomech',
        power: 2,
        hp: 4,
        cost: 2,
        hasNonKeywordAbility: true,
        aspects: ['aggression', 'villainy'],
        types: ['unit'],
        traits: ['underworld', 'droid'],
        setId: {
            set: 'LAW',
            number: 173,
        },
        unique: true,
        arena: 'ground',
        internalName: 'bt1#blastomech',
    }),
    buildMockCard({
        title: 'Latts Razzi',
        subtitle: 'Deadly Whipmaster',
        power: 2,
        hp: 1,
        cost: 3,
        hasNonKeywordAbility: true,
        aspects: ['command', 'vigilance'],
        types: ['unit'],
        traits: ['underworld', 'bounty hunter'],
        setId: {
            set: 'LAW',
            number: 39,
        },
        unique: true,
        arena: 'ground',
        internalName: 'latts-razzi#deadly-whipmaster',
    }),
    buildMockCard({
        title: 'Patient Hunter',
        power: 3,
        hp: 3,
        cost: 4,
        hasNonKeywordAbility: true,
        aspects: ['command', 'cunning'],
        types: ['unit'],
        traits: ['bounty hunter'],
        setId: {
            set: 'LAW',
            number: 73,
        },
        unique: false,
        arena: 'ground',
        internalName: 'patient-hunter',
    }),
    buildMockCard({
        title: 'Millennium Falcon',
        subtitle: 'Dodging Patrols',
        power: 2,
        hp: 5,
        cost: 3,
        hasNonKeywordAbility: true,
        aspects: ['command', 'cunning', 'heroism'],
        types: ['unit'],
        traits: ['rebel', 'vehicle', 'transport'],
        setId: {
            set: 'LAW',
            number: 68,
        },
        unique: true,
        arena: 'space',
        internalName: 'millennium-falcon#dodging-patrols',
    }),
    buildMockCard({
        title: 'Combat Exercise',
        cost: 1,
        hasNonKeywordAbility: true,
        aspects: ['command'],
        types: ['event'],
        traits: ['learned'],
        setId: {
            set: 'LAW',
            number: 165,
        },
        unique: false,
        internalName: 'combat-exercise',
    }),
    buildMockCard({
        title: 'Enfys Nest\'s Helmet',
        power: 0,
        hp: 0,
        upgradePower: 0,
        upgradeHp: 2,
        cost: 2,
        hasNonKeywordAbility: true,
        aspects: ['aggression', 'heroism'],
        types: ['upgrade'],
        traits: ['item', 'armor'],
        setId: {
            set: 'LAW',
            number: 186,
        },
        unique: true,
        internalName: 'enfys-nests-helmet',
    }),
    buildMockCard({
        title: 'Aerie',
        subtitle: 'Cloud-Rider Dropship',
        power: 3,
        hp: 7,
        cost: 6,
        hasNonKeywordAbility: true,
        aspects: ['aggression', 'heroism'],
        types: ['unit'],
        traits: ['underworld', 'vehicle', 'transport'],
        setId: {
            set: 'LAW',
            number: 184,
        },
        unique: true,
        arena: 'space',
        internalName: 'aerie#cloudrider-dropship',
    }),
    buildMockCard({
        title: 'Weazel',
        subtitle: 'Fighting Back',
        power: 2,
        hp: 3,
        cost: 2,
        hasNonKeywordAbility: true,
        aspects: ['aggression', 'heroism'],
        types: ['unit'],
        traits: ['underworld'],
        setId: {
            set: 'LAW',
            number: 182,
        },
        unique: true,
        arena: 'ground',
        internalName: 'weazel#fighting-back',
    }),
    buildMockCard({
        title: 'Taramyn Barcona',
        subtitle: 'Eyes Front!',
        power: 4,
        hp: 6,
        cost: 5,
        hasNonKeywordAbility: true,
        aspects: ['vigilance', 'command'],
        types: ['unit'],
        traits: ['rebel', 'trooper'],
        setId: {
            set: 'LAW',
            number: 40,
        },
        unique: true,
        arena: 'ground',
        internalName: 'taramyn-barcona#eyes-front',
    }),
    buildMockCard({
        title: 'Enfys Nest',
        subtitle: 'Until We Can Go No Higher',
        power: 3,
        hp: 7,
        cost: 5,
        hasNonKeywordAbility: true,
        aspects: ['aggression', 'heroism'],
        types: ['leader'],
        traits: ['underworld'],
        setId: {
            set: 'LAW',
            number: 14,
        },
        unique: true,
        arena: 'ground',
        internalName: 'enfys-nest#until-we-can-go-no-higher',
    }),
    buildMockCard({
        title: 'Vel Sartha',
        subtitle: 'Aldhani Insurgent',
        power: 4,
        hp: 7,
        cost: 6,
        hasNonKeywordAbility: true,
        aspects: ['vigilance', 'heroism'],
        types: ['leader'],
        traits: ['rebel'],
        setId: {
            set: 'LAW',
            number: 6,
        },
        unique: true,
        arena: 'ground',
        internalName: 'vel-sartha#aldhani-insurgent',
    }),
    buildMockCard({
        title: 'Cloud-Rider Veteran',
        power: 1,
        hp: 4,
        cost: 2,
        hasNonKeywordAbility: true,
        aspects: ['aggression', 'heroism'],
        types: ['unit'],
        traits: ['underworld'],
        setId: {
            set: 'LAW',
            number: 181,
        },
        unique: false,
        arena: 'ground',
        internalName: 'cloudrider-veteran',
    }),
    buildMockCard({
        title: 'Sullustan Sapper',
        power: 4,
        hp: 2,
        cost: 3,
        hasNonKeywordAbility: false,
        aspects: ['aggression', 'cunning'],
        types: ['unit'],
        traits: ['underworld'],
        keywords: ['ambush', 'overwhelm'],
        setId: {
            set: 'LAW',
            number: 81,
        },
        unique: false,
        arena: 'ground',
        internalName: 'sullustan-sapper',
    }),
    buildMockCard({
        title: 'Thermal Detonator',
        power: 0,
        hp: 0,
        upgradePower: 1,
        upgradeHp: 1,
        cost: 3,
        hasNonKeywordAbility: true,
        aspects: ['aggression'],
        types: ['upgrade'],
        traits: ['item', 'weapon'],
        setId: {
            set: 'LAW',
            number: 201,
        },
        unique: false,
        internalName: 'thermal-detonator',
    }),
    buildMockCard({
        title: 'Rodian Bondsman',
        power: 2,
        hp: 3,
        cost: 2,
        hasNonKeywordAbility: true,
        aspects: ['vigilance'],
        types: ['unit'],
        traits: ['bounty hunter'],
        setId: {
            set: 'LAW',
            number: 116,
        },
        unique: false,
        arena: 'ground',
        internalName: 'rodian-bondsman',
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
