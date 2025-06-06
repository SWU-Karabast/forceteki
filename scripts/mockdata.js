const { color } = require('console-log-colors');

const mockCards = [
    buildMockCard({
        title: 'Malakili',
        subtitle: 'Loving Rancor Keeper',
        power: 1,
        hp: 4,
        hasNonKeywordAbility: true,
        aspects: ['command'],
        types: ['unit'],
        traits: ['underworld'],
        setId: {
            set: 'LOF',
            number: 108
        },
        cost: 2,
        unique: true,
        arena: 'ground',
        internalName: 'malakili#loving-rancor-keeper'
    }),
    buildMockCard({
        title: 'Shien Flurry',
        hasNonKeywordAbility: true,
        aspects: ['cunning'],
        types: ['event'],
        traits: ['learned'],
        setId: {
            set: 'LOF',
            number: 220
        },
        cost: 1,
        unique: false,
        internalName: 'shien-flurry',
    }),
    buildMockCard({
        title: 'Kit Fisto\'s Aethersprite',
        subtitle: 'Good Hunting',
        power: 4,
        hp: 5,
        cost: 5,
        hasNonKeywordAbility: true,
        aspects: ['aggression', 'heroism'],
        keywords: ['saboteur'],
        types: ['unit'],
        traits: ['jedi', 'republic', 'vehicle', 'fighter'],
        setId: {
            set: 'LOF',
            number: 147
        },
        unique: true,
        arena: 'space',
        internalName: 'kit-fistos-aethersprite#good-hunting'
    }),
    buildMockCard({
        title: 'Adi Gallia',
        subtitle: 'Stern and Focused',
        cost: 2,
        power: 2,
        hp: 4,
        hasNonKeywordAbility: true,
        aspects: ['aggression', 'heroism'],
        keywords: [],
        types: ['unit'],
        traits: ['force', 'jedi', 'republic'],
        setId: {
            set: 'LOF',
            number: 142
        },
        unique: true,
        arena: 'ground',
        internalName: 'adi-gallia#stern-and-focused'
    }),
    buildMockCard({
        title: 'Niman Strike',
        hasNonKeywordAbility: true,
        cost: 1,
        aspects: ['command'],
        types: ['event'],
        traits: ['learned'],
        setId: {
            set: 'LOF',
            number: 124
        },
        unique: false,
        internalName: 'niman-strike',
    }),
    buildMockCard({
        title: 'Yaddle',
        subtitle: 'A Chance to Make Things Right',
        cost: 2,
        power: 2,
        hp: 4,
        hasNonKeywordAbility: true,
        aspects: ['vigilance', 'heroism'],
        keywords: ['restore 1'],
        types: ['unit'],
        traits: ['force', 'jedi', 'republic'],
        setId: {
            set: 'LOF',
            number: 45
        },
        unique: true,
        arena: 'ground',
        internalName: 'yaddle#a-chance-to-make-things-right'
    }),
    buildMockCard({
        title: 'Drengir Spawn',
        cost: 4,
        power: 3,
        hp: 3,
        hasNonKeywordAbility: true,
        aspects: ['command', 'villainy'],
        keywords: ['overwhelm'],
        types: ['unit'],
        traits: ['creature'],
        setId: {
            set: 'LOF',
            number: 86
        },
        unique: false,
        arena: 'ground',
        internalName: 'drengir-spawn'
    }),
    buildMockCard({
        title: 'The Legacy Run',
        subtitle: 'Doomed Debris',
        cost: 5,
        power: 3,
        hp: 3,
        hasNonKeywordAbility: true,
        aspects: ['cunning'],
        types: ['unit'],
        traits: ['republic', 'vehicle', 'transport'],
        setId: {
            set: 'LOF',
            number: 213
        },
        unique: true,
        arena: 'space',
        internalName: 'the-legacy-run#doomed-debris'
    }),
    buildMockCard({
        title: 'Aurra Sing',
        subtitle: 'Patient and Deadly',
        cost: 2,
        power: 1,
        hp: 4,
        hasNonKeywordAbility: false,
        aspects: ['cunning', 'villainy'],
        types: ['unit'],
        keywords: ['hidden', 'raid 2'],
        traits: ['underworld', 'bounty hunter'],
        setId: {
            set: 'LOF',
            number: 179
        },
        unique: true,
        arena: 'ground',
        internalName: 'aurra-sing#patient-and-deadly'
    }),
    buildMockCard({
        title: 'Crushing Blow',
        cost: 3,
        hasNonKeywordAbility: true,
        aspects: ['vigilance'],
        types: ['event'],
        traits: ['tactic'],
        setId: {
            set: 'LOF',
            number: 77
        },
        unique: false,
        internalName: 'crushing-blow'
    }),
    buildMockCard({
        title: 'Purge Trooper',
        cost: 3,
        power: 4,
        hp: 2,
        hasNonKeywordAbility: true,
        aspects: ['aggression', 'villainy'],
        types: ['unit'],
        traits: ['imperial', 'trooper'],
        setId: {
            set: 'LOF',
            number: 133
        },
        unique: false,
        arena: 'ground',
        internalName: 'purge-trooper'
    }),
    buildMockCard({
        title: 'Grand Inquisitor',
        subtitle: 'Stories Travel Quickly',
        power: 3,
        hp: 5,
        cost: 5,
        hasNonKeywordAbility: true,
        aspects: ['cunning', 'villainy'],
        types: ['leader'],
        keywords: ['shielded'],
        traits: ['force', 'imperial', 'inquisitor'],
        setId: {
            set: 'LOF',
            number: 14
        },
        unique: true,
        arena: 'ground',
        internalName: 'grand-inquisitor#stories-travel-quickly'
    }),
    buildMockCard({
        title: 'Marchion Ro',
        subtitle: 'Eye of the Nihil',
        power: 6,
        hp: 7,
        cost: 6,
        hasNonKeywordAbility: true,
        aspects: ['cunning', 'villainy'],
        types: ['unit'],
        keywords: [],
        traits: ['underworld', 'nihil'],
        setId: {
            set: 'LOF',
            number: 186
        },
        unique: true,
        arena: 'ground',
        internalName: 'marchion-ro#eye-of-the-nihil'
    }),
    buildMockCard({
        title: 'Nihil Marauder',
        power: 1,
        hp: 5,
        cost: 3,
        hasNonKeywordAbility: false,
        aspects: ['cunning', 'villainy'],
        types: ['unit'],
        keywords: ['raid 3'],
        traits: ['underworld', 'trooper', 'nihil'],
        setId: {
            set: 'LOF',
            number: 182
        },
        unique: false,
        arena: 'ground',
        internalName: 'nihil-marauder'
    }),
    buildMockCard({
        title: 'Gungi',
        subtitle: 'Finding Himself',
        power: 2,
        hp: 5,
        cost: 2,
        hasNonKeywordAbility: false,
        aspects: ['command', 'heroism'],
        types: ['unit'],
        keywords: [],
        traits: ['force', 'jedi', 'wookiee'],
        setId: {
            set: 'LOF',
            number: 93
        },
        unique: true,
        arena: 'ground',
        internalName: 'gungi#finding-himself'
    }),
    buildMockCard({
        title: 'Jedi Temple Guards',
        power: 2,
        hp: 4,
        cost: 4,
        hasNonKeywordAbility: false,
        aspects: ['command'],
        types: ['unit'],
        keywords: ['ambush', 'restore 2'],
        traits: ['force', 'jedi'],
        setId: {
            set: 'LOF',
            number: 113
        },
        unique: false,
        arena: 'ground',
        internalName: 'jedi-temple-guards'
    }),
    buildMockCard({
        title: 'Jedi Vector',
        power: 1,
        hp: 3,
        cost: 2,
        hasNonKeywordAbility: true,
        aspects: ['heroism'],
        types: ['unit'],
        traits: ['jedi', 'vehicle', 'fighter'],
        setId: {
            set: 'LOF',
            number: 244
        },
        unique: false,
        arena: 'space',
        internalName: 'jedi-vector'
    }),
    buildMockCard({
        title: 'Avar Kriss',
        subtitle: 'Marshal of Starlight',
        power: 4,
        hp: 10,
        cost: 9,
        hasNonKeywordAbility: true,
        aspects: ['command', 'heroism'],
        types: ['leader'],
        traits: ['force', 'jedi', 'republic'],
        setId: {
            set: 'LOF',
            number: 7
        },
        unique: true,
        arena: 'ground',
        internalName: 'avar-kriss#marshal-of-starlight'
    }),
    buildMockCard({
        title: 'Priestesses of the Force',
        subtitle: 'Eternal',
        cost: 7,
        power: 6,
        hp: 8,
        hasNonKeywordAbility: true,
        aspects: ['vigilance'],
        types: ['unit'],
        traits: ['force'],
        setId: {
            set: 'LOF',
            number: 72
        },
        unique: true,
        arena: 'ground',
        internalName: 'priestesses-of-the-force#eternal'
    }),
    buildMockCard({
        title: 'Sorcerous Blast',
        cost: 1,
        hasNonKeywordAbility: true,
        aspects: ['aggression'],
        types: ['event'],
        traits: ['force'],
        setId: {
            set: 'LOF',
            number: 172
        },
        unique: false,
        internalName: 'sorcerous-blast'
    }),
    buildMockCard({
        title: 'Vernestra Rwoh',
        subtitle: 'Precocious Knight',
        cost: 3,
        power: 3,
        hp: 4,
        hasNonKeywordAbility: true,
        aspects: ['cunning', 'heroism'],
        types: ['unit'],
        traits: ['force', 'jedi'],
        setId: {
            set: 'LOF',
            number: 195
        },
        unique: true,
        arena: 'ground',
        internalName: 'vernestra-rwoh#precocious-knight'
    }),
    buildMockCard({
        title: 'Eye of Sion',
        subtitle: 'To Peridea',
        cost: 6,
        power: 4,
        hp: 7,
        hasNonKeywordAbility: false,
        aspects: ['command', 'villainy'],
        types: ['unit'],
        keywords: ['hidden', 'ambush', 'overwhelm', 'restore 1'],
        traits: ['imperial', 'vehicle', 'transport'],
        setId: {
            set: 'LOF',
            number: 88
        },
        unique: true,
        arena: 'space',
        internalName: 'eye-of-sion#to-peridea'
    }),
    buildMockCard({
        title: 'Shin Hati',
        subtitle: 'Overeager Apprentice',
        cost: 3,
        power: 4,
        hp: 2,
        hasNonKeywordAbility: false,
        aspects: ['cunning', 'villainy'],
        types: ['unit'],
        keywords: ['hidden', 'shielded'],
        traits: ['force', 'fringe'],
        setId: {
            set: 'LOF',
            number: 183
        },
        unique: true,
        arena: 'ground',
        internalName: 'shin-hati#overeager-apprentice'
    }),
    buildMockCard({
        title: 'Baylan Skoll',
        subtitle: 'Enigmatic Master',
        cost: 5,
        power: 5,
        hp: 5,
        hasNonKeywordAbility: true,
        aspects: ['cunning', 'villainy'],
        types: ['unit'],
        keywords: ['hidden'],
        traits: ['force', 'fringe'],
        setId: {
            set: 'LOF',
            number: 185
        },
        unique: true,
        arena: 'ground',
        internalName: 'baylan-skoll#enigmatic-master'
    }),
    buildMockCard({
        title: 'Graceful Purrgil',
        cost: 5,
        power: 2,
        hp: 7,
        hasNonKeywordAbility: false,
        aspects: ['vigilance'],
        types: ['unit'],
        keywords: ['sentinel'],
        traits: ['creature'],
        setId: {
            set: 'LOF',
            number: 69
        },
        unique: false,
        arena: 'space',
        internalName: 'graceful-purrgil'
    }),
    buildMockCard({
        title: 'Dooku',
        subtitle: 'It Is Too Late',
        cost: 4,
        power: 5,
        hp: 4,
        hasNonKeywordAbility: true,
        aspects: ['cunning'],
        types: ['unit'],
        keywords: ['hidden'],
        traits: ['force', 'jedi'],
        setId: {
            set: 'LOF',
            number: 211
        },
        unique: true,
        arena: 'ground',
        internalName: 'dooku#it-is-too-late'
    }),
    buildMockCard({
        title: 'Protect the Pod',
        cost: 4,
        hasNonKeywordAbility: true,
        aspects: ['command'],
        types: ['event'],
        traits: ['tactic'],
        setId: {
            set: 'LOF',
            number: 128
        },
        unique: false,
        internalName: 'protect-the-pod'
    }),
    buildMockCard({
        title: 'Shatterpoint',
        cost: 4,
        hasNonKeywordAbility: true,
        aspects: ['vigilance'],
        types: ['event'],
        traits: ['force'],
        setId: {
            set: 'LOF',
            number: 79
        },
        unique: false,
        internalName: 'shatterpoint'
    }),
    buildMockCard({
        title: 'Ahsoka Tano',
        subtitle: 'Fighting For Peace',
        power: 5,
        hp: 6,
        cost: 6,
        hasNonKeywordAbility: true,
        aspects: ['vigilance', 'heroism'],
        types: ['leader'],
        traits: ['force', 'fringe'],
        setId: {
            set: 'LOF',
            number: 3
        },
        unique: true,
        arena: 'ground',
        internalName: 'ahsoka-tano#fighting-for-peace'
    }),
    buildMockCard({
        title: 'T-6 Shuttle 1974',
        subtitle: 'Stay Close',
        cost: 3,
        power: 3,
        hp: 4,
        hasNonKeywordAbility: true,
        aspects: ['vigilance', 'heroism'],
        types: ['unit'],
        traits: ['fringe', 'vehicle', 'transport'],
        setId: {
            set: 'LOF',
            number: 47
        },
        unique: true,
        arena: 'space',
        internalName: 't6-shuttle-1974#stay-close'
    }),
    buildMockCard({
        title: 'Hyperspace Wayfarer',
        cost: 6,
        power: 4,
        hp: 10,
        hasNonKeywordAbility: false,
        aspects: ['command'],
        types: ['unit'],
        traits: ['creature'],
        setId: {
            set: 'LOF',
            number: 119
        },
        unique: false,
        arena: 'space',
        internalName: 'hyperspace-wayfarer'
    }),
    buildMockCard({
        title: 'Pounce',
        cost: 2,
        hasNonKeywordAbility: true,
        aspects: ['cunning'],
        types: ['event'],
        traits: ['trick'],
        setId: {
            set: 'LOF',
            number: 224
        },
        unique: false,
        internalName: 'pounce'
    }),
    buildMockCard({
        title: 'Grappling Guardian',
        cost: 7,
        power: 3,
        hp: 9,
        hasNonKeywordAbility: true,
        aspects: ['vigilance'],
        types: ['unit'],
        traits: ['creature'],
        setId: {
            set: 'LOF',
            number: 71
        },
        unique: false,
        arena: 'space',
        internalName: 'grappling-guardian'
    }),
    buildMockCard({
        title: 'Mythosaur',
        subtitle: 'Folklore Awakened',
        cost: 9,
        power: 10,
        hp: 10,
        hasNonKeywordAbility: true,
        aspects: ['vigilance'],
        keywords: ['shielded'],
        types: ['unit'],
        traits: ['mandalorian', 'creature'],
        setId: {
            set: 'LOF',
            number: 73
        },
        unique: true,
        arena: 'ground',
        internalName: 'mythosaur#folklore-awakened'
    }),
    buildMockCard({
        title: 'Second Sister',
        subtitle: 'Seeking the Holocron',
        cost: 4,
        power: 3,
        hp: 6,
        hasNonKeywordAbility: true,
        aspects: ['cunning', 'villainy'],
        types: ['unit'],
        traits: ['force', 'imperial', 'inquisitor'],
        setId: {
            set: 'LOF',
            number: 184
        },
        unique: true,
        arena: 'ground',
        internalName: 'second-sister#seeking-the-holocron'
    }),
    buildMockCard({
        title: 'Supremacy',
        subtitle: 'Of Unimaginable Size',
        cost: 12,
        power: 12,
        hp: 12,
        hasNonKeywordAbility: true,
        aspects: ['command', 'villainy'],
        types: ['unit'],
        keywords: ['ambush'],
        traits: ['first order', 'vehicle', 'capital ship'],
        setId: {
            set: 'LOF',
            number: 89
        },
        unique: true,
        arena: 'space',
        internalName: 'supremacy#of-unimaginable-size'
    }),
    buildMockCard({
        title: 'Exegol Patroller',
        cost: 2,
        power: 3,
        hp: 1,
        hasNonKeywordAbility: false,
        aspects: ['command', 'villainy'],
        types: ['unit'],
        keywords: ['overwhelm'],
        traits: ['first order', 'vehicle', 'sith', 'fighter'],
        setId: {
            set: 'LOF',
            number: 80
        },
        unique: false,
        arena: 'space',
        internalName: 'exegol-patroller',
    }),
    buildMockCard({
        title: 'Supremacy TIE/sf',
        cost: 3,
        power: 3,
        hp: 3,
        hasNonKeywordAbility: false,
        aspects: ['vigilance', 'villainy'],
        types: ['unit'],
        keywords: ['sentinel'],
        traits: ['first order', 'vehicle', 'fighter'],
        setId: {
            set: 'LOF',
            number: 34
        },
        unique: false,
        arena: 'space',
        internalName: 'supremacy-tiesf',
    }),
    buildMockCard({
        title: 'Supreme Leader Snoke',
        subtitle: 'In the Seat of Power',
        cost: 6,
        power: 4,
        hp: 7,
        hasNonKeywordAbility: true,
        aspects: ['command', 'villainy'],
        types: ['leader'],
        traits: ['first order', 'force', 'official'],
        setId: {
            set: 'LOF',
            number: 6
        },
        unique: true,
        arena: 'ground',
        internalName: 'supreme-leader-snoke#in-the-seat-of-power',
    }),
    buildMockCard({
        title: 'Bendu',
        subtitle: 'Do You Fear The Storm?',
        cost: 8,
        power: 10,
        hp: 10,
        hasNonKeywordAbility: true,
        aspects: ['aggression'],
        types: ['unit'],
        traits: ['force', 'creature'],
        setId: {
            set: 'LOF',
            number: 170
        },
        unique: true,
        arena: 'ground',
        internalName: 'bendu#do-you-fear-the-storm',
    }),
    buildMockCard({
        title: 'Caretaker Matron',
        cost: 2,
        power: 0,
        hp: 4,
        hasNonKeywordAbility: true,
        aspects: ['heroism'],
        types: ['unit'],
        traits: ['fringe'],
        setId: {
            set: 'LOF',
            number: 243
        },
        unique: false,
        arena: 'ground',
        internalName: 'caretaker-matron',
    }),
    buildMockCard({
        title: 'Force Illusion',
        cost: 2,
        hasNonKeywordAbility: true,
        aspects: ['cunning'],
        types: ['event'],
        traits: ['force', 'trick'],
        setId: {
            set: 'LOF',
            number: 223
        },
        unique: false,
        internalName: 'force-illusion',
    }),
    buildMockCard({
        title: 'Cal Kestis',
        subtitle: 'I Can\'t Keep Hiding',
        cost: 4,
        power: 3,
        hp: 4,
        hasNonKeywordAbility: true,
        aspects: ['cunning', 'heroism'],
        types: ['leader'],
        traits: ['force', 'fringe'],
        setId: {
            set: 'LOF',
            number: 15
        },
        unique: true,
        arena: 'ground',
        internalName: 'cal-kestis#i-cant-keep-hiding',
    }),
    buildMockCard({
        title: 'Quinlan Vos',
        subtitle: 'Dark Disciple',
        cost: 4,
        power: 4,
        hp: 5,
        hasNonKeywordAbility: true,
        aspects: ['aggression'],
        types: ['unit'],
        traits: ['force', 'jedi', 'republic'],
        setId: {
            set: 'LOF',
            number: 163
        },
        unique: true,
        arena: 'ground',
        internalName: 'quinlan-vos#dark-disciple',
    }),
    buildMockCard({
        title: 'Asajj Ventress',
        subtitle: 'Harden Your Heart',
        cost: 5,
        power: 5,
        hp: 6,
        hasNonKeywordAbility: true,
        aspects: ['aggression'],
        types: ['unit'],
        traits: ['force', 'night', 'bounty hunter'],
        setId: {
            set: 'LOF',
            number: 165
        },
        unique: true,
        arena: 'ground',
        internalName: 'asajj-ventress#harden-your-heart',
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
