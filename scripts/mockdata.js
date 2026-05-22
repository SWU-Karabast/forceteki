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
    // Advantage
    buildMockCard({
        title: 'Advantage',
        cost: 0,
        hp: 0,
        power: 0,
        upgradePower: 1,
        upgradeHp: 0,
        hasNonKeywordAbility: true,
        types: ['token', 'upgrade'],
        traits: ['innate'],
        setId: {
            set: 'ASH'
        },
        unique: false,
        internalName: 'advantage'
    }),
    // Luke Skywalker, I Can Save Him
    buildMockCard({
        title: 'Luke Skywalker',
        subtitle: 'I Can Save Him',
        power: 6,
        hp: 7,
        cost: 7,
        hasNonKeywordAbility: true,
        aspects: ['vigilance', 'heroism'],
        types: ['leader'],
        traits: ['force', 'jedi', 'rebel'],
        setId: {
            set: 'ASH',
            number: 5
        },
        unique: true,
        arena: 'ground',
        internalName: 'luke-skywalker#i-can-save-him',
    }),
    // Emperor Palpatine, According to My Design
    buildMockCard({
        title: 'Emperor Palpatine',
        subtitle: 'According to My Design',
        power: 4,
        hp: 8,
        cost: 7,
        hasNonKeywordAbility: true,
        aspects: ['cunning', 'villainy'],
        types: ['leader'],
        traits: ['force', 'imperial', 'sith', 'official'],
        setId: {
            set: 'ASH',
            number: 15
        },
        unique: true,
        arena: 'ground',
        internalName: 'emperor-palpatine#according-to-my-design',
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
    // Leia Organa, Vigilant for Danger
    buildMockCard({
        title: 'Leia Organa',
        subtitle: 'Vigilant for Danger',
        power: 3,
        hp: 4,
        cost: 3,
        hasNonKeywordAbility: true,
        aspects: ['vigilance', 'heroism'],
        types: ['unit'],
        traits: ['rebel', 'official'],
        keywords: ['support'],
        setId: {
            set: 'ASH',
            number: 59
        },
        unique: true,
        arena: 'ground',
        internalName: 'leia-organa#vigilant-for-danger',
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
    // Luke's Jedi Lightsaber, Constructed by Hand
    buildMockCard({
        title: 'Luke\'s Jedi Lightsaber',
        subtitle: 'Constructed by Hand',
        power: 0,
        hp: 0,
        upgradePower: 3,
        upgradeHp: 3,
        cost: 3,
        hasNonKeywordAbility: true,
        aspects: ['vigilance', 'heroism'],
        types: ['upgrade'],
        traits: ['item', 'weapon', 'lightsaber'],
        setId: {
            set: 'ASH',
            number: 66
        },
        unique: true,
        internalName: 'lukes-jedi-lightsaber#constructed-by-hand',
    }),
    // Moff Jerjerrod, We Shall Redouble Our Efforts
    buildMockCard({
        title: 'Moff Jerjerrod',
        subtitle: 'We Shall Redouble Our Efforts',
        power: 1,
        hp: 3,
        cost: 2,
        hasNonKeywordAbility: true,
        aspects: ['command', 'villainy'],
        types: ['unit'],
        traits: ['imperial', 'official'],
        setId: {
            set: 'ASH',
            number: 94
        },
        unique: true,
        arena: 'ground',
        internalName: 'moff-jerjerrod#we-shall-redouble-our-efforts',
    }),
    // Forest Patroller
    buildMockCard({
        title: 'Forest Patroller',
        power: 3,
        hp: 4,
        cost: 3,
        hasNonKeywordAbility: false,
        aspects: ['command', 'villainy'],
        types: ['unit'],
        traits: ['imperial', 'trooper'],
        keywords: ['overwhelm', 'restore 1'],
        setId: {
            set: 'ASH',
            number: 96
        },
        unique: false,
        arena: 'ground',
        internalName: 'forest-patroller',
    }),
    // Moff Gideon, Remnant Commander
    buildMockCard({
        title: 'Moff Gideon',
        subtitle: 'Remnant Commander',
        power: 2,
        hp: 5,
        cost: 3,
        hasNonKeywordAbility: true,
        aspects: ['command', 'villainy'],
        types: ['unit'],
        traits: ['imperial', 'official'],
        keywords: ['sentinel'],
        setId: {
            set: 'ASH',
            number: 97
        },
        unique: true,
        arena: 'ground',
        internalName: 'moff-gideon#remnant-commander',
    }),
    // R5-D4, Built For Adventure
    buildMockCard({
        title: 'R5-D4',
        subtitle: 'Built For Adventure',
        power: 3,
        hp: 4,
        cost: 3,
        hasNonKeywordAbility: true,
        aspects: ['aggression', 'heroism'],
        types: ['unit'],
        traits: ['droid'],
        keywords: ['support'],
        setId: {
            set: 'ASH',
            number: 156
        },
        unique: true,
        arena: 'ground',
        internalName: 'r5d4#built-for-adventure',
    }),
    // Han Solo, It'll Work
    buildMockCard({
        title: 'Han Solo',
        subtitle: 'It\'ll Work',
        power: 3,
        hp: 7,
        cost: 4,
        hasNonKeywordAbility: true,
        aspects: ['aggression', 'heroism'],
        types: ['unit'],
        traits: ['rebel', 'official'],
        keywords: ['saboteur'],
        setId: {
            set: 'ASH',
            number: 158
        },
        unique: true,
        arena: 'ground',
        internalName: 'han-solo#itll-work',
    }),
    // Executor, Final Destruction of the Alliance
    buildMockCard({
        title: 'Executor',
        subtitle: 'Final Destruction of the Alliance',
        power: 5,
        hp: 12,
        cost: 8,
        hasNonKeywordAbility: true,
        aspects: ['cunning', 'villainy'],
        types: ['unit'],
        traits: ['imperial', 'vehicle', 'capital ship'],
        setId: {
            set: 'ASH',
            number: 197
        },
        unique: true,
        arena: 'space',
        internalName: 'executor#final-destruction-of-the-alliance',
    }),
    // There Is No Conflict
    buildMockCard({
        title: 'There Is No Conflict',
        power: 0,
        hp: 0,
        upgradePower: 2,
        upgradeHp: 2,
        cost: 2,
        hasNonKeywordAbility: true,
        aspects: ['cunning', 'villainy'],
        types: ['upgrade'],
        traits: ['innate'],
        setId: {
            set: 'ASH',
            number: 199
        },
        unique: false,
        internalName: 'there-is-no-conflict',
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
    // Helix Starfighter
    buildMockCard({
        title: 'Helix Starfighter',
        power: 3,
        hp: 3,
        cost: 4,
        hasNonKeywordAbility: true,
        aspects: ['cunning'],
        types: ['unit'],
        traits: ['underworld', 'vehicle', 'fighter'],
        setId: {
            set: 'ASH',
            number: 221
        },
        unique: true,
        arena: 'space',
        internalName: 'helix-starfighter',
    }),
    // Darth Vader, Meet Your Destiny
    buildMockCard({
        title: 'Darth Vader',
        subtitle: 'Meet Your Destiny',
        power: 4,
        hp: 6,
        cost: 5,
        hasNonKeywordAbility: true,
        aspects: ['villainy'],
        types: ['unit'],
        traits: ['force', 'imperial', 'sith'],
        keywords: ['shielded'],
        setId: {
            set: 'ASH',
            number: 243
        },
        unique: true,
        arena: 'ground',
        internalName: 'darth-vader#meet-your-destiny',
    }),
    // Anakin Skywalker, You Were Right About Me
    buildMockCard({
        title: 'Anakin Skywalker',
        subtitle: 'You Were Right About Me',
        power: 6,
        hp: 4,
        cost: 5,
        hasNonKeywordAbility: true,
        aspects: ['heroism'],
        types: ['unit'],
        traits: ['force', 'jedi'],
        keywords: ['hidden', 'saboteur'],
        setId: {
            set: 'ASH',
            number: 255
        },
        unique: true,
        arena: 'ground',
        internalName: 'anakin-skywalker#you-were-right-about-me',
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
        title: 'Cobb Vanth',
        subtitle: 'Let Me Handle This',
        cost: 4,
        power: 2,
        hp: 6,
        hasNonKeywordAbility: true,
        aspects: ['vigilance', 'heroism'],
        types: ['unit'],
        traits: ['official'],
        keywords: ['grit'],
        setId: {
            set: 'ASH',
            number: 60
        },
        unique: true,
        arena: 'ground',
        internalName: 'cobb-vanth#let-me-handle-this',
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
        title: 'Home One',
        subtitle: 'Heart of the Fleet',
        cost: 8,
        power: 7,
        hp: 10,
        hasNonKeywordAbility: true,
        aspects: ['vigilance', 'heroism'],
        types: ['unit'],
        traits: ['rebel', 'vehicle', 'capital ship'],
        keywords: ['sentinel'],
        setId: {
            set: 'ASH',
            number: 65
        },
        unique: true,
        arena: 'space',
        internalName: 'home-one#heart-of-the-fleet',
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
        title: 'Shin Hati\'s Fiend Fighter',
        subtitle: 'Compact and Agile',
        cost: 2,
        power: 3,
        hp: 1,
        hasNonKeywordAbility: true,
        aspects: ['cunning', 'villainy'],
        types: ['unit'],
        traits: ['vehicle', 'fighter'],
        setId: {
            set: 'ASH',
            number: 191
        },
        unique: true,
        arena: 'space',
        internalName: 'shin-hatis-fiend-fighter#compact-and-agile',
    }),
    buildMockCard({
        title: 'Doctor Pershing',
        subtitle: 'Dedicated to Research',
        cost: 2,
        power: 0,
        hp: 4,
        hasNonKeywordAbility: true,
        keywords: ['support'],
        aspects: ['vigilance'],
        types: ['unit'],
        traits: ['new republic'],
        setId: {
            set: 'ASH',
            number: 72
        },
        unique: true,
        arena: 'ground',
        internalName: 'doctor-pershing#dedicated-to-research',
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
        title: 'The Great Mothers',
        subtitle: 'With Strange Magicks',
        cost: 7,
        power: 6,
        hp: 7,
        hasNonKeywordAbility: true,
        keywords: ['support'],
        aspects: ['command', 'villainy'],
        types: ['unit'],
        traits: ['force', 'night'],
        setId: {
            set: 'ASH',
            number: 101
        },
        unique: true,
        arena: 'ground',
        internalName: 'the-great-mothers#with-strange-magicks',
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
        title: 'Hold Them Off',
        cost: 4,
        hasNonKeywordAbility: true,
        aspects: ['command'],
        types: ['event'],
        traits: ['tactic'],
        setId: {
            set: 'ASH',
            number: 139
        },
        unique: false,
        internalName: 'hold-them-off',
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
        title: 'Green Leader',
        subtitle: 'Crynyd\'s Sacrifice',
        cost: 2,
        power: 3,
        hp: 1,
        hasNonKeywordAbility: true,
        aspects: ['aggression', 'heroism'],
        types: ['unit'],
        traits: ['rebel', 'vehicle', 'fighter'],
        setId: {
            set: 'ASH',
            number: 153
        },
        unique: true,
        arena: 'space',
        internalName: 'green-leader#crynys-sacrifice',
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
        title: 'Reckless Sacrifice',
        cost: 2,
        hasNonKeywordAbility: true,
        aspects: ['aggression', 'heroism'],
        types: ['event'],
        traits: ['gambit'],
        setId: {
            set: 'ASH',
            number: 163
        },
        unique: false,
        internalName: 'reckless-sacrifice',
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
