const mockCards = [
    // Add mock cards here
    // Mandalorian
    buildMockCard({
        title: 'Mandalorian',
        cost: 0,
        hp: 2,
        power: 2,
        hasNonKeywordAbility: false,
        aspects: ['Vigilance'],
        types: ['token', 'unit'],
        traits: ['mandalorian'],
        keywords: ['shielded'],
        setId: {
            set: 'ASH'
        },
        unique: false,
        arena: 'ground',
        internalName: 'mandalorian',
    }),
    // Grogu, Charming Companion
    buildMockCard({
        title: 'Grogu',
        subtitle: 'Charming Companion',
        power: 0,
        hp: 3,
        cost: 4,
        hasNonKeywordAbility: true,
        aspects: ['cunning', 'heroism'],
        types: ['leader'],
        traits: ['force'],
        setId: {
            set: 'ASH',
            number: 18
        },
        unique: true,
        arena: 'ground',
        internalName: 'grogu#charming-companion',
    }),
    // Shin Hati, Going Somewhere
    buildMockCard({
        title: 'Shin Hati',
        subtitle: 'Going Somewhere?',
        power: 6,
        hp: 6,
        cost: 5,
        hasNonKeywordAbility: true,
        aspects: ['vigilance', 'villainy'],
        types: ['unit'],
        traits: ['force'],
        setId: {
            set: 'ASH',
            number: 49
        },
        unique: true,
        arena: 'ground',
        internalName: 'shin-hati#going-somewhere',
    }),
    // Blade of Talzin, A Gift of Shadows
    buildMockCard({
        title: 'Blade of Talzin',
        subtitle: 'A Gift of Shadows',
        power: 0,
        hp: 0,
        upgradePower: 2,
        upgradeHp: 1,
        cost: 2,
        hasNonKeywordAbility: true,
        aspects: ['vigilance', 'villainy'],
        types: ['upgrade'],
        traits: ['night', 'item', 'weapon'],
        setId: {
            set: 'ASH',
            number: 55
        },
        unique: true,
        internalName: 'blade-of-talzin#a-gift-of-shadows',
    }),
    // The Armorer, Secrecy is Our Survival
    buildMockCard({
        title: 'The Armorer',
        subtitle: 'Secrecy is Our Survival',
        power: 5,
        hp: 5,
        cost: 6,
        hasNonKeywordAbility: true,
        aspects: ['vigilance', 'heroism'],
        types: ['unit'],
        traits: ['mandalorian'],
        keywords: ['shielded'],
        setId: {
            set: 'ASH',
            number: 64
        },
        unique: true,
        arena: 'ground',
        internalName: 'the-armorer#secrecy-is-our-survival',
    }),
    // Ezra Bridger, The Force Is All I Need
    buildMockCard({
        title: 'Ezra Bridger',
        subtitle: 'The Force Is All I Need',
        power: 6,
        hp: 6,
        cost: 6,
        hasNonKeywordAbility: true,
        aspects: ['cunning', 'heroism'],
        types: ['unit'],
        traits: ['force', 'jedi', 'spectre'],
        keywords: ['support'],
        setId: {
            set: 'ASH',
            number: 209
        },
        unique: true,
        arena: 'ground',
        internalName: 'ezra-bridger#the-force-is-all-i-need',
    }),
    buildMockCard({
        title: 'Jod Na Nawood',
        subtitle: 'Keeping Secrets',
        cost: 3,
        power: 4,
        hp: 3,
        hasNonKeywordAbility: true,
        aspects: ['cunning'],
        types: ['unit'],
        traits: ['force', 'underworld'],
        keywords: ['sentinel'],
        setId: {
            set: 'ASH',
            number: 219
        },
        unique: true,
        arena: 'ground',
        internalName: 'jod-na-nawood#keeping-secrets',
    }),
    buildMockCard({
        title: 'Blade Three',
        subtitle: 'Bane of the Devastator',
        cost: 3,
        power: 2,
        hp: 4,
        hasNonKeywordAbility: true,
        aspects: ['cunning', 'heroism'],
        types: ['unit'],
        traits: ['rebel', 'vehicle', 'fighter'],
        setId: {
            set: 'ASH',
            number: 204
        },
        unique: true,
        arena: 'space',
        internalName: 'blade-three#bane-of-the-devastator',
    }),
    buildMockCard({
        title: 'Mortar Trooper',
        cost: 2,
        power: 1,
        hp: 4,
        hasNonKeywordAbility: true,
        aspects: ['aggression', 'villainy'],
        types: ['unit'],
        traits: ['imperial', 'trooper'],
        setId: {
            set: 'ASH',
            number: 142
        },
        unique: false,
        arena: 'ground',
        internalName: 'mortar-trooper',
    }),
    buildMockCard({
        title: 'Mandalorian Flagship',
        subtitle: 'Captured from the Empire',
        cost: 7,
        power: 4,
        hp: 8,
        hasNonKeywordAbility: true,
        aspects: ['command', 'heroism'],
        types: ['unit'],
        traits: ['mandalorian', 'vehicle', 'capital ship'],
        setId: {
            set: 'ASH',
            number: 113
        },
        unique: true,
        arena: 'space',
        internalName: 'mandalorian-flagship#captured-from-the-empire',
    }),
    buildMockCard({
        title: 'Ninth Sister',
        subtitle: 'Hulking Inquisitor',
        cost: 7,
        power: 8,
        hp: 7,
        hasNonKeywordAbility: true,
        aspects: ['aggression', 'villainy'],
        types: ['unit'],
        traits: ['force', 'imperial', 'inquisitor'],
        keywords: ['overwhelm'],
        setId: {
            set: 'ASH',
            number: 148
        },
        unique: true,
        arena: 'ground',
        internalName: 'ninth-sister#hulking-inquisitor',
    }),
    buildMockCard({
        title: 'The Mandalorian',
        subtitle: 'Devoted Rescuer',
        cost: 4,
        power: 5,
        hp: 4,
        hasNonKeywordAbility: true,
        aspects: ['vigilance', 'heroism'],
        types: ['unit'],
        traits: ['mandalorian'],
        keywords: ['shielded'],
        setId: {
            set: 'ASH',
            number: 62
        },
        unique: true,
        arena: 'ground',
        internalName: 'the-mandalorian#devoted-rescuer',
    }),
    buildMockCard({
        title: 'Mando\'s N-1 Starfighter',
        subtitle: 'Faster Than a Fathier',
        cost: 2,
        power: 1,
        hp: 3,
        hasNonKeywordAbility: true,
        aspects: ['cunning', 'heroism'],
        types: ['unit'],
        traits: ['mandalorian', 'vehicle', 'fighter'],
        keywords: ['support'],
        setId: {
            set: 'ASH',
            number: 203
        },
        unique: true,
        arena: 'space',
        internalName: 'mandos-n1-starfighter#faster-than-a-fathier',
    }),
    buildMockCard({
        title: 'Huyang',
        subtitle: 'Your Aptitude Falls Short',
        cost: 2,
        power: 2,
        hp: 4,
        hasNonKeywordAbility: true,
        aspects: ['vigilance', 'heroism'],
        types: ['unit'],
        traits: ['jedi', 'droid'],
        setId: {
            set: 'ASH',
            number: 56
        },
        unique: true,
        arena: 'ground',
        internalName: 'huyang#your-aptitude-falls-short',
    }),
    buildMockCard({
        title: 'T-6 Shuttle 1974',
        subtitle: 'With a Mentor\'s Dedication',
        cost: 4,
        power: 2,
        hp: 6,
        hasNonKeywordAbility: true,
        aspects: ['command', 'heroism'],
        types: ['unit'],
        traits: ['jedi', 'vehicle', 'transport'],
        keywords: ['sentinel'],
        setId: {
            set: 'ASH',
            number: 109
        },
        unique: true,
        arena: 'space',
        internalName: 't6-shuttle-1974#with-a-mentors-dedication',
    }),
    buildMockCard({
        title: 'Ahsoka Tano',
        subtitle: 'Trust in The Force',
        cost: 6,
        power: 5,
        hp: 6,
        hasNonKeywordAbility: true,
        aspects: ['command', 'heroism'],
        types: ['leader'],
        traits: ['force', 'jedi'],
        keywords: ['support'],
        setId: {
            set: 'ASH',
            number: 9
        },
        unique: true,
        arena: 'ground',
        internalName: 'ahsoka-tano#trust-in-the-force',
    }),
    buildMockCard({
        title: 'Whistling Birds',
        cost: 3,
        power: 0,
        hp: 0,
        upgradePower: 2,
        upgradeHp: 2,
        hasNonKeywordAbility: true,
        aspects: ['aggression'],
        types: ['upgrade'],
        traits: ['item', 'weapon'],
        setId: {
            set: 'ASH',
            number: 183
        },
        unique: false,
        internalName: 'whistling-birds',
    }),
    buildMockCard({
        title: 'Chimaera',
        subtitle: 'A Frightening Reality',
        cost: 7,
        power: 6,
        hp: 6,
        hasNonKeywordAbility: true,
        aspects: ['vigilance', 'villainy'],
        types: ['unit'],
        traits: ['imperial', 'vehicle', 'capital ship'],
        setId: {
            set: 'ASH',
            number: 52
        },
        unique: true,
        arena: 'space',
        internalName: 'chimaera#a-frightening-reality',
    }),
    buildMockCard({
        title: 'Protectorate Fighter',
        cost: 3,
        power: 2,
        hp: 1,
        hasNonKeywordAbility: true,
        aspects: ['command'],
        types: ['unit'],
        traits: ['mandalorian', 'vehicle', 'fighter'],
        setId: {
            set: 'ASH',
            number: 124
        },
        unique: false,
        arena: 'space',
        internalName: 'protectorate-fighter',
    }),
    buildMockCard({
        title: 'Turning the Tide',
        cost: 3,
        hasNonKeywordAbility: true,
        aspects: ['command'],
        types: ['event'],
        traits: ['tactic'],
        setId: {
            set: 'ASH',
            number: 138
        },
        unique: false,
        internalName: 'turning-the-tide',
    }),
    buildMockCard({
        title: 'Stronger Together',
        cost: 4,
        hasNonKeywordAbility: true,
        aspects: ['command'],
        types: ['event'],
        traits: ['learned'],
        setId: {
            set: 'ASH',
            number: 140
        },
        unique: false,
        internalName: 'stronger-together',
    }),
    buildMockCard({
        title: 'Bo-Katan\'s Gauntlet',
        subtitle: 'Reinforce From Above',
        cost: 5,
        power: 4,
        hp: 5,
        hasNonKeywordAbility: true,
        aspects: ['vigilance', 'heroism'],
        types: ['unit'],
        traits: ['mandalorian', 'vehicle', 'transport'],
        keywords: ['restore 1'],
        setId: {
            set: 'ASH',
            number: 63
        },
        unique: true,
        arena: 'space',
        internalName: 'bokatans-gauntlet#reinforce-from-above',
    }),
    buildMockCard({
        title: 'Bo-Katan Kryze',
        subtitle: 'For All of Mandalore',
        cost: 2,
        power: 2,
        hp: 4,
        hasNonKeywordAbility: true,
        aspects: ['command', 'heroism'],
        types: ['unit'],
        traits: ['mandalorian'],
        setId: {
            set: 'ASH',
            number: 105
        },
        unique: true,
        arena: 'ground',
        internalName: 'bokatan-kryze#for-all-of-mandalore',
    }),
    buildMockCard({
        title: 'Grand Admiral Thrawn',
        subtitle: 'Victory is Mine',
        cost: 8,
        power: 5,
        hp: 8,
        hasNonKeywordAbility: true,
        aspects: ['vigilance', 'villainy'],
        types: ['leader'],
        traits: ['imperial', 'official'],
        keywords: ['restore 2'],
        setId: {
            set: 'ASH',
            number: 4
        },
        unique: true,
        arena: 'ground',
        internalName: 'grand-admiral-thrawn#victory-is-mine',
    }),
    buildMockCard({
        title: 'Foundling Rescue',
        cost: 4,
        hasNonKeywordAbility: true,
        aspects: ['vigilance'],
        types: ['event'],
        traits: ['plan'],
        setId: {
            set: 'ASH',
            number: 92
        },
        unique: false,
        internalName: 'foundling-rescue',
    }),
    buildMockCard({
        title: 'Pointless to Resist',
        cost: 1,
        power: 0,
        hp: 0,
        upgradePower: 0,
        upgradeHp: 0,
        hasNonKeywordAbility: true,
        aspects: ['vigilance', 'villainy'],
        types: ['upgrade'],
        traits: ['condition'],
        setId: {
            set: 'ASH',
            number: 54
        },
        unique: false,
        internalName: 'pointless-to-resist',
    }),
    buildMockCard({
        title: 'Scion Shuttle',
        subtitle: 'At Morgan\'s Bidding',
        cost: 2,
        power: 1,
        hp: 3,
        hasNonKeywordAbility: true,
        keywords: ['support'],
        aspects: ['vigilance', 'villainy'],
        types: ['unit'],
        traits: ['imperial', 'vehicle', 'transport'],
        setId: {
            set: 'ASH',
            number: 46
        },
        unique: true,
        arena: 'space',
        internalName: 'scion-shuttle#at-morgans-bidding',
    }),
    buildMockCard({
        title: 'Gar Saxon',
        subtitle: 'Coveting Power',
        cost: 3,
        power: 3,
        hp: 4,
        hasNonKeywordAbility: true,
        aspects: ['vigilance', 'villainy'],
        types: ['unit'],
        traits: ['mandalorian', 'trooper'],
        setId: {
            set: 'ASH',
            number: 47
        },
        unique: true,
        arena: 'ground',
        internalName: 'gar-saxon#coveting-power',
    }),
    buildMockCard({
        title: 'Grogu',
        subtitle: 'Yes. Yes. Yes.',
        cost: 3,
        power: 2,
        hp: 6,
        hasNonKeywordAbility: true,
        aspects: ['aggression', 'heroism'],
        types: ['unit'],
        traits: ['force', 'droid'],
        setId: {
            set: 'ASH',
            number: 155
        },
        unique: true,
        arena: 'ground',
        internalName: 'grogu#yes-yes-yes',
    }),
    buildMockCard({
        title: 'Eye of Sion',
        subtitle: 'Delivered from Exile',
        cost: 7,
        power: 5,
        hp: 8,
        hasNonKeywordAbility: true,
        aspects: ['villainy'],
        types: ['unit'],
        traits: ['imperial', 'vehicle', 'transport'],
        setId: {
            set: 'ASH',
            number: 245
        },
        unique: true,
        arena: 'space',
        internalName: 'eye-of-sion#delivered-from-exile',
    }),
    buildMockCard({
        title: 'The Mandalorian',
        subtitle: 'We Can\'t Keep Running',
        cost: 6,
        power: 4,
        hp: 6,
        hasNonKeywordAbility: true,
        aspects: ['aggression', 'heroism'],
        types: ['leader'],
        traits: ['mandalorian'],
        keywords: ['support'],
        setId: {
            set: 'ASH',
            number: 14
        },
        unique: true,
        arena: 'ground',
        internalName: 'the-mandalorian#we-cant-keep-running',
    }),
    buildMockCard({
        title: 'Zeb Orrelios',
        subtitle: 'Fists Work Every Time',
        cost: 7,
        power: 5,
        hp: 7,
        hasNonKeywordAbility: true,
        aspects: ['aggression', 'heroism'],
        types: ['unit'],
        traits: ['rebel', 'spectre'],
        setId: {
            set: 'ASH',
            number: 161
        },
        unique: true,
        arena: 'ground',
        internalName: 'zeb-orrelios#fists-work-every-time',
    }),
    buildMockCard({
        title: 'Sabine Wren',
        subtitle: 'Bargaining On Belief',
        cost: 5,
        power: 3,
        hp: 5,
        hasNonKeywordAbility: true,
        aspects: ['vigilance', 'heroism'],
        types: ['leader'],
        traits: ['jedi', 'mandalorian', 'spectre'],
        setId: {
            set: 'ASH',
            number: 6
        },
        unique: true,
        arena: 'ground',
        internalName: 'sabine-wren#bargaining-on-belief',
    }),
    buildMockCard({
        title: 'Sabine Wren',
        subtitle: 'I Learned the Hard Way',
        cost: 5,
        power: 4,
        hp: 5,
        hasNonKeywordAbility: true,
        aspects: ['cunning', 'heroism'],
        types: ['unit'],
        traits: ['jedi', 'mandalorian', 'spectre'],
        keywords: ['shielded'],
        setId: {
            set: 'ASH',
            number: 208
        },
        unique: true,
        arena: 'ground',
        internalName: 'sabine-wren#i-learned-the-hard-way',
    }),
    buildMockCard({
        title: 'Sabine\'s Lightsaber',
        subtitle: 'Not Alone',
        cost: 2,
        upgradeHp: 2,
        upgradePower: 2,
        hp: 0,
        power: 0,
        hasNonKeywordAbility: true,
        aspects: ['command', 'heroism'],
        types: ['upgrade'],
        traits: ['item', 'weapon', 'lightsaber'],
        setId: {
            set: 'ASH',
            number: 114
        },
        unique: true,
        internalName: 'sabines-lightsaber#not-alone',
    }),
    buildMockCard({
        title: 'Get Lost',
        cost: 4,
        hasNonKeywordAbility: true,
        aspects: ['vigilance', 'heroism'],
        types: ['event'],
        traits: ['tactic'],
        setId: {
            set: 'ASH',
            number: 67
        },
        unique: false,
        internalName: 'get-lost',
    }),
    buildMockCard({
        title: 'Far Far Away',
        cost: 3,
        hasNonKeywordAbility: true,
        aspects: ['cunning'],
        types: ['event'],
        traits: ['gambit'],
        setId: {
            set: 'ASH',
            number: 236
        },
        unique: false,
        internalName: 'far-far-away',
    }),
    buildMockCard({
        title: 'Moff Gideon',
        subtitle: 'Indomitable Warlord',
        cost: 7,
        power: 5,
        hp: 8,
        hasNonKeywordAbility: true,
        aspects: ['command', 'villainy'],
        types: ['leader'],
        traits: ['imperial', 'official'],
        setId: {
            set: 'ASH',
            number: 8
        },
        unique: true,
        arena: 'ground',
        internalName: 'moff-gideon#indomitable-warlord',
    }),
    buildMockCard({
        title: 'Mouse Droid',
        cost: 1,
        power: 1,
        hp: 1,
        hasNonKeywordAbility: true,
        aspects: ['villainy'],
        types: ['unit'],
        traits: ['imperial', 'droid'],
        keywords: ['raid 1'],
        setId: {
            set: 'ASH',
            number: 237
        },
        unique: false,
        arena: 'ground',
        internalName: 'mouse-droid',
    }),
    buildMockCard({
        title: 'Imperial Armored Commando',
        cost: 4,
        power: 4,
        hp: 3,
        hasNonKeywordAbility: false,
        aspects: ['vigilance', 'villainy'],
        types: ['unit'],
        traits: ['imperial', 'trooper'],
        keywords: ['sentinel', 'shielded'],
        setId: {
            set: 'ASH',
            number: 48
        },
        unique: false,
        arena: 'ground',
        internalName: 'imperial-armored-commando',
    }),
    buildMockCard({
        title: 'Elzar Mann',
        subtitle: 'Haunted by a Vision',
        cost: 6,
        power: 3,
        hp: 7,
        hasNonKeywordAbility: true,
        aspects: ['cunning'],
        types: ['unit'],
        traits: ['force', 'jedi'],
        setId: {
            set: 'ASH',
            number: 224
        },
        unique: true,
        arena: 'ground',
        internalName: 'elzar-mann#haunted-by-a-vision',
    }),
    buildMockCard({
        title: 'Womp Rat',
        cost: 1,
        power: 2,
        hp: 1,
        hasNonKeywordAbility: false,
        aspects: ['cunning'],
        types: ['unit'],
        traits: ['creature'],
        keywords: ['hidden'],
        setId: {
            set: 'ASH',
            number: 213
        },
        unique: false,
        arena: 'ground',
        internalName: 'womp-rat',
    }),
    buildMockCard({
        title: 'LEP Ratcatcher',
        cost: 1,
        power: 1,
        hp: 1,
        hasNonKeywordAbility: true,
        aspects: [],
        types: ['unit'],
        traits: ['droid'],
        setId: {
            set: 'ASH',
            number: 259
        },
        unique: false,
        arena: 'ground',
        internalName: 'lep-ratcatcher',
    }),
    buildMockCard({
        title: 'Luke Skywalker',
        subtitle: 'Answering the Call',
        cost: 6,
        power: 5,
        hp: 5,
        hasNonKeywordAbility: true,
        aspects: ['command', 'heroism'],
        keywords: ['restore 1'],
        types: ['unit'],
        traits: ['force', 'jedi'],
        setId: {
            set: 'ASH',
            number: 112
        },
        unique: true,
        arena: 'ground',
        internalName: 'luke-skywalker#answering-the-call',
    }),
    buildMockCard({
        title: 'Admiral Ackbar',
        subtitle: 'Assume Attack Coordinates',
        cost: 5,
        power: 6,
        hp: 6,
        hasNonKeywordAbility: true,
        aspects: ['command', 'heroism'],
        types: ['unit'],
        traits: ['rebel', 'official'],
        setId: {
            set: 'ASH',
            number: 110
        },
        unique: true,
        arena: 'ground',
        internalName: 'admiral-ackbar#assume-attack-coordinates',
    }),
    buildMockCard({
        title: 'Crix Madine',
        subtitle: 'Strike Team Strategist',
        cost: 3,
        power: 3,
        hp: 2,
        hasNonKeywordAbility: true,
        aspects: ['command', 'heroism'],
        types: ['unit'],
        traits: ['rebel', 'official'],
        setId: {
            set: 'ASH',
            number: 108
        },
        unique: true,
        arena: 'ground',
        internalName: 'crix-madine#strike-team-strategist',
    }),
    buildMockCard({
        title: 'Paz Vizsla',
        subtitle: 'For a Brighter Future',
        cost: 5,
        power: 4,
        hp: 7,
        hasNonKeywordAbility: true,
        aspects: ['vigilance', 'command', 'heroism'],
        keywords: ['sentinel'],
        types: ['unit'],
        traits: ['mandalorian'],
        setId: {
            set: 'ASH',
            number: 28
        },
        unique: true,
        arena: 'ground',
        internalName: 'paz-vizsla#for-a-brighter-future',
    }),
    buildMockCard({
        title: 'Koska Reeves',
        subtitle: 'Warrior of Mandalore',
        cost: 4,
        power: 4,
        hp: 4,
        hasNonKeywordAbility: true,
        aspects: ['vigilance'],
        types: ['unit'],
        traits: ['mandalorian'],
        setId: {
            set: 'ASH',
            number: 79
        },
        unique: true,
        arena: 'ground',
        internalName: 'koska-reeves#warrior-of-mandalore',
    }),
    buildMockCard({
        title: 'Diplomatic Pageantry',
        cost: 1,
        hasNonKeywordAbility: true,
        aspects: ['cunning'],
        types: ['event'],
        traits: ['law'],
        setId: {
            set: 'ASH',
            number: 231
        },
        unique: false,
        internalName: 'diplomatic-pageantry',
    }),
    buildMockCard({
        title: 'The Student Guides the Master',
        cost: 1,
        hasNonKeywordAbility: true,
        aspects: ['command', 'heroism'],
        types: ['event'],
        traits: ['learned'],
        setId: {
            set: 'ASH',
            number: 115
        },
        unique: false,
        internalName: 'the-student-guides-the-master',
    }),
    buildMockCard({
        title: 'Bo-Katan Kryze',
        subtitle: 'Reclaiming Mandalore',
        cost: 10,
        power: 4,
        hp: 7,
        hasNonKeywordAbility: true,
        aspects: ['command', 'heroism'],
        types: ['leader'],
        traits: ['mandalorian'],
        setId: {
            set: 'ASH',
            number: 10
        },
        unique: true,
        arena: 'ground',
        internalName: 'bokatan-kryze#reclaiming-mandalore',
    }),
    buildMockCard({
        title: 'Baylan Skoll',
        subtitle: 'Power Beyond Dream',
        cost: 5,
        power: 4,
        hp: 6,
        hasNonKeywordAbility: true,
        aspects: ['vigilance', 'villainy'],
        types: ['leader'],
        traits: ['force'],
        setId: {
            set: 'ASH',
            number: 3
        },
        unique: true,
        arena: 'ground',
        internalName: 'baylan-skoll#power-beyond-dream',
    }),
    buildMockCard({
        title: 'Morgan Elsbeth',
        subtitle: 'Life Abandoned',
        cost: 6,
        power: 5,
        hp: 6,
        hasNonKeywordAbility: true,
        aspects: ['vigilance', 'villainy'],
        types: ['unit'],
        traits: ['force', 'night'],
        keywords: ['support'],
        setId: {
            set: 'ASH',
            number: 50
        },
        unique: true,
        arena: 'ground',
        internalName: 'morgan-elsbeth#life-abandoned',
    }),
    buildMockCard({
        title: 'Pre Vizsla',
        subtitle: 'Strong-Willed Ruler',
        cost: 8,
        power: 6,
        hp: 6,
        hasNonKeywordAbility: true,
        aspects: ['vigilance', 'villainy'],
        types: ['unit'],
        traits: ['mandalorian', 'official'],
        setId: {
            set: 'ASH',
            number: 53
        },
        unique: true,
        arena: 'ground',
        internalName: 'pre-vizsla#strongwilled-ruler',
    }),
    buildMockCard({
        title: 'One Must Destroy to Create',
        cost: 3,
        hasNonKeywordAbility: true,
        aspects: ['villainy'],
        types: ['event'],
        traits: ['plan'],
        setId: {
            set: 'ASH',
            number: 247
        },
        unique: false,
        internalName: 'one-must-destroy-to-create',
    }),
    buildMockCard({
        title: 'Shin Hati',
        subtitle: 'Eager Adversary',
        cost: 6,
        power: 4,
        hp: 6,
        hasNonKeywordAbility: true,
        aspects: ['cunning', 'villainy'],
        types: ['leader'],
        traits: ['force'],
        setId: {
            set: 'ASH',
            number: 16
        },
        unique: true,
        arena: 'ground',
        internalName: 'shin-hati#eager-adversary',
    }),
    buildMockCard({
        title: 'Baylan Skoll',
        subtitle: 'Fallen Jedi',
        cost: 6,
        power: 6,
        hp: 6,
        hasNonKeywordAbility: true,
        aspects: ['aggression', 'cunning', 'villainy'],
        keywords: ['overwhelm'],
        types: ['unit'],
        traits: ['force'],
        setId: {
            set: 'ASH',
            number: 39
        },
        unique: true,
        arena: 'ground',
        internalName: 'baylan-skoll#fallen-jedi',
    }),
    buildMockCard({
        title: 'Kelleran Beq',
        subtitle: 'Where Are the Others?',
        cost: 4,
        power: 3,
        hp: 5,
        hasNonKeywordAbility: true,
        aspects: ['cunning', 'heroism'],
        keywords: ['ambush'],
        types: ['unit'],
        traits: ['force', 'jedi'],
        setId: {
            set: 'ASH',
            number: 206
        },
        unique: true,
        arena: 'ground',
        internalName: 'kelleran-beq#where-are-the-others',
    }),
    buildMockCard({
        title: 'Marrok\'s Fiend Fighter',
        subtitle: 'Formidable Pursuer',
        cost: 3,
        power: 3,
        hp: 2,
        hasNonKeywordAbility: true,
        aspects: ['villainy'],
        keywords: ['support', 'overwhelm'],
        types: ['unit'],
        traits: ['vehicle', 'fighter'],
        setId: {
            set: 'ASH',
            number: 241
        },
        unique: true,
        arena: 'space',
        internalName: 'marroks-fiend-fighter#formidable-pursuer',
    }),
    buildMockCard({
        title: 'Heroic Purrgil',
        cost: 5,
        power: 3,
        hp: 6,
        hasNonKeywordAbility: true,
        aspects: ['cunning', 'heroism'],
        keywords: ['ambush'],
        types: ['unit'],
        traits: ['creature'],
        setId: {
            set: 'ASH',
            number: 207
        },
        unique: false,
        arena: 'space',
        internalName: 'heroic-purrgil',
    }),
    buildMockCard({
        title: 'Masterstroke',
        cost: 2,
        hasNonKeywordAbility: true,
        aspects: ['cunning'],
        types: ['event'],
        traits: ['tactic'],
        setId: {
            set: 'ASH',
            number: 234
        },
        unique: false,
        internalName: 'masterstroke',
    }),
    buildMockCard({
        title: 'Choose Your Path',
        cost: 2,
        hasNonKeywordAbility: true,
        aspects: ['heroism'],
        types: ['event'],
        traits: ['force', 'mandalorian'],
        setId: {
            set: 'ASH',
            number: 257
        },
        unique: false,
        internalName: 'choose-your-path',
    }),
    // Cad Bane, Still Faster Than You
    buildMockCard({
        title: 'Cad Bane',
        subtitle: 'Still Faster Than You',
        cost: 6,
        power: 4,
        hp: 7,
        hasNonKeywordAbility: true,
        aspects: ['aggression', 'villainy'],
        types: ['leader'],
        traits: ['underworld', 'bounty hunter'],
        keywords: ['overwhelm'],
        setId: {
            set: 'ASH',
            number: 11
        },
        unique: true,
        arena: 'ground',
        internalName: 'cad-bane#still-faster-than-you',
    }),
    // Helgait, Dooku Was a Visionary
    buildMockCard({
        title: 'Helgait',
        subtitle: 'Dooku Was a Visionary',
        cost: 5,
        power: 6,
        hp: 4,
        hasNonKeywordAbility: true,
        aspects: ['cunning', 'villainy'],
        types: ['unit'],
        traits: ['separatist'],
        setId: {
            set: 'ASH',
            number: 195
        },
        unique: true,
        arena: 'ground',
        internalName: 'helgait#dooku-was-a-visionary',
    }),
    // Rehabilitation
    buildMockCard({
        title: 'Rehabilitation',
        cost: 5,
        hasNonKeywordAbility: true,
        aspects: ['cunning', 'villainy'],
        types: ['event'],
        traits: ['learned'],
        setId: {
            set: 'ASH',
            number: 200
        },
        unique: false,
        internalName: 'rehabilitation',
    }),
    // Gorian Shard's Corsair, Pirate Warship
    buildMockCard({
        title: 'Gorian Shard\'s Corsair',
        subtitle: 'Pirate Warship',
        cost: 6,
        power: 6,
        hp: 5,
        hasNonKeywordAbility: true,
        aspects: ['cunning', 'villainy'],
        types: ['unit'],
        traits: ['underworld', 'vehicle', 'capital ship'],
        setId: {
            set: 'ASH',
            number: 196
        },
        unique: true,
        arena: 'space',
        internalName: 'gorian-shards-corsair#pirate-warship',
    }),
    // Justifier, Relentless
    buildMockCard({
        title: 'Justifier',
        subtitle: 'Relentless',
        cost: 5,
        power: 4,
        hp: 5,
        hasNonKeywordAbility: true,
        aspects: ['aggression', 'villainy'],
        types: ['unit'],
        traits: ['underworld', 'vehicle', 'transport'],
        setId: {
            set: 'ASH',
            number: 146
        },
        unique: true,
        arena: 'space',
        internalName: 'justifier#relentless',
    }),
    // The Cyborg Mech, Mysterious Threat
    buildMockCard({
        title: 'The Cyborg Mech',
        subtitle: 'Mysterious Threat',
        cost: 6,
        power: 3,
        hp: 7,
        hasNonKeywordAbility: true,
        aspects: ['aggression', 'villainy'],
        types: ['unit'],
        traits: ['fringe'],
        keywords: ['grit'],
        setId: {
            set: 'ASH',
            number: 147
        },
        unique: true,
        arena: 'ground',
        internalName: 'the-cyborg-mech#mysterious-threat',
    }),
    // Deadly Vulnerability
    buildMockCard({
        title: 'Deadly Vulnerability',
        cost: 1,
        power: 0,
        hp: 0,
        upgradePower: 0,
        upgradeHp: 0,
        hasNonKeywordAbility: true,
        aspects: ['aggression', 'villainy'],
        types: ['upgrade'],
        traits: ['condition'],
        setId: {
            set: 'ASH',
            number: 150
        },
        unique: false,
        internalName: 'deadly-vulnerability',
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
