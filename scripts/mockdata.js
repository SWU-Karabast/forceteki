const mockCards = [
    // Add mock cards here
    buildMockCard({
        title: 'Reckless Landing',
        cost: 2,
        hasNonKeywordAbility: true,
        types: ['event'],
        aspects: ['Aggression', 'Cunning'],
        traits: ['gambit'],
        setId: {
            set: 'TS26',
            number: 32
        },
        unique: false,
        internalName: 'reckless-landing'
    }),
    buildMockCard({
        title: 'Yoda',
        subtitle: 'Begun, the Clone War Has',
        cost: 5,
        power: 4,
        hp: 4,
        hasNonKeywordAbility: true,
        aspects: ['Vigilance', 'Command', 'Heroism'],
        types: ['unit'],
        traits: ['force', 'jedi', 'republic'],
        setId: {
            set: 'TS26',
            number: 14
        },
        unique: true,
        arena: 'ground',
        internalName: 'yoda#begun-the-clone-war-has'
    }),
    buildMockCard({
        title: 'C-3P0',
        subtitle: 'Die, Jedi Dogs!',
        cost: 2,
        power: 2,
        hp: 5,
        hasNonKeywordAbility: true,
        aspects: ['Vigilance', 'Command'],
        types: ['unit'],
        traits: ['droid'],
        setId: {
            set: 'TS26',
            number: 15
        },
        unique: true,
        arena: 'ground',
        internalName: 'c3po#die-jedi-dogs'
    }),
    buildMockCard({
        title: 'General Grievous',
        subtitle: 'Crush Them!',
        cost: 5,
        power: 0,
        hp: 0,
        hasNonKeywordAbility: true,
        aspects: ['Command', 'Villainy'],
        types: ['unit'],
        traits: ['separatist', 'official'],
        setId: {
            set: 'TS26',
            number: 50
        },
        unique: true,
        arena: 'ground',
        internalName: 'general-grievous#crush-them'
    }),
    buildMockCard({
        title: 'Prime Minister Almec',
        subtitle: 'Scheming Populist',
        cost: 4,
        power: 2,
        hp: 4,
        hasNonKeywordAbility: true,
        aspects: ['Command', 'Cunning'],
        types: ['unit'],
        traits: ['mandalorian', 'official'],
        keywords: ['saboteur'],
        setId: {
            set: 'TS26',
            number: 28
        },
        unique: true,
        arena: 'ground',
        internalName: 'prime-minister-almec#scheming-populist'
    }),
    buildMockCard({
        title: 'Mother Talzin',
        subtitle: 'Stealing the Spirit',
        cost: 5,
        power: 5,
        hp: 4,
        hasNonKeywordAbility: true,
        aspects: ['Command', 'Cunning', 'Villainy'],
        types: ['unit'],
        traits: ['force', 'night'],
        keywords: ['sentinel'],
        setId: {
            set: 'TS26',
            number: 26
        },
        unique: true,
        arena: 'ground',
        internalName: 'mother-talzin#stealing-the-spirit'
    }),
    buildMockCard({
        title: 'Sundari Gauntlet',
        cost: 5,
        power: 6,
        hp: 5,
        hasNonKeywordAbility: true,
        aspects: ['Command', 'Aggression'],
        types: ['unit'],
        traits: ['mandalorian', 'vehicle', 'transport'],
        keywords: ['sentinel'],
        setId: {
            set: 'TS26',
            number: 24
        },
        unique: false,
        arena: 'space',
        internalName: 'sundari-gauntlet'
    }),
    buildMockCard({
        title: 'Chaotic Diversion',
        cost: 1,
        hasNonKeywordAbility: true,
        aspects: ['Aggression', 'Cunning'],
        types: ['event'],
        traits: ['tactic', 'trick'],
        setId: {
            set: 'TS26',
            number: 31
        },
        unique: false,
        internalName: 'chaotic-diversion',
    }),
    buildMockCard({
        title: 'Moralo Eval',
        subtitle: 'Infamous Murderer',
        cost: 3,
        power: 3,
        hp: 2,
        hasNonKeywordAbility: true,
        aspects: ['Cunning', 'Villainy'],
        types: ['unit'],
        traits: ['underworld'],
        keywords: ['shielded'],
        setId: {
            set: 'TS26',
            number: 73
        },
        unique: true,
        arena: 'ground',
        internalName: 'moralo-eval#infamous-murderer',
    }),
    buildMockCard({
        title: 'Fortune and Glory',
        subtitle: 'Hondo\'s Luxury Yacht',
        cost: 4,
        power: 3,
        hp: 5,
        hasNonKeywordAbility: true,
        aspects: ['Command', 'Cunning'],
        types: ['unit'],
        traits: ['underworld', 'vehicle', 'transport'],
        keywords: ['bounty'],
        setId: {
            set: 'TS26',
            number: 27
        },
        unique: true,
        arena: 'space',
        internalName: 'fortune-and-glory#hondos-luxury-yacht',
    }),
    buildMockCard({
        title: 'King Katuunko',
        subtitle: 'Great King of Toydaria',
        cost: 2,
        power: 2,
        hp: 4,
        hasNonKeywordAbility: true,
        aspects: ['Vigilance', 'Command'],
        types: ['unit'],
        traits: ['official'],
        setId: {
            set: 'TS26',
            number: 16
        },
        unique: true,
        arena: 'ground',
        internalName: 'king-katuunko#great-king-of-toydaria',
    }),
    buildMockCard({
        title: 'Coleman Trebor',
        subtitle: 'Jedi Rescuer',
        cost: 1,
        power: 2,
        hp: 2,
        hasNonKeywordAbility: true,
        aspects: ['Vigilance', 'Aggression', 'Heroism'],
        types: ['unit'],
        traits: ['force', 'jedi', 'republic'],
        keywords: ['hidden'],
        setId: {
            set: 'TS26',
            number: 19
        },
        unique: true,
        arena: 'ground',
        internalName: 'coleman-trebor#jedi-rescuer',
    }),
    buildMockCard({
        title: '501st Veteran',
        cost: 2,
        power: 0,
        hp: 4,
        hasNonKeywordAbility: true,
        aspects: ['Vigilance', 'Aggression'],
        types: ['unit'],
        traits: ['republic', 'clone', 'trooper'],
        keywords: ['grit', 'raid 1'],
        setId: {
            set: 'TS26',
            number: 20
        },
        unique: false,
        arena: 'ground',
        internalName: '501st-veteran',
    }),
    buildMockCard({
        title: 'Take Cover',
        cost: 3,
        hasNonKeywordAbility: true,
        aspects: ['Vigilance'],
        types: ['event'],
        traits: ['tactic'],
        setId: {
            set: 'TS26',
            number: 47
        },
        unique: false,
        internalName: 'take-cover',
    }),
    buildMockCard({
        title: 'Take Charge',
        cost: 3,
        hasNonKeywordAbility: true,
        aspects: ['Command'],
        types: ['event'],
        traits: ['tactic'],
        setId: {
            set: 'TS26',
            number: 60
        },
        unique: false,
        internalName: 'take-charge',
    }),
    buildMockCard({
        title: 'Take Action',
        cost: 3,
        hasNonKeywordAbility: true,
        aspects: ['Aggression'],
        types: ['event'],
        traits: ['tactic'],
        setId: {
            set: 'TS26',
            number: 71
        },
        unique: false,
        internalName: 'take-action',
    }),
    buildMockCard({
        title: 'Take Aim',
        cost: 3,
        hasNonKeywordAbility: true,
        aspects: ['Cunning'],
        types: ['event'],
        traits: ['tactic'],
        setId: {
            set: 'TS26',
            number: 83
        },
        unique: false,
        internalName: 'take-aim',
    }),
    buildMockCard({
        title: 'Remove the Chip',
        cost: 2,
        hasNonKeywordAbility: true,
        aspects: ['Aggression'],
        types: ['event'],
        traits: ['modification'],
        setId: {
            set: 'TS26',
            number: 69
        },
        unique: false,
        internalName: 'remove-the-chip',
    }),
    buildMockCard({
        title: 'Tribunal',
        subtitle: 'Grave of the 332nd',
        cost: 10,
        power: 6,
        hp: 8,
        hasNonKeywordAbility: true,
        aspects: ['Cunning', 'Vigilance'],
        types: ['unit'],
        traits: ['republic', 'vehicle', 'capital ship'],
        setId: {
            set: 'TS26',
            number: 36
        },
        unique: true,
        arena: 'space',
        internalName: 'tribunal#grave-of-the-332nd'
    }),
    buildMockCard({
        title: 'Abandoned the Order',
        cost: 4,
        hp: 0,
        power: 0,
        upgradePower: 1,
        upgradeHp: 1,
        hasNonKeywordAbility: true,
        aspects: ['Cunning', 'Vigilance'],
        types: ['upgrade'],
        traits: ['learned'],
        setId: {
            set: 'TS26',
            number: 37
        },
        unique: false,
        internalName: 'abandoned-the-order'
    }),
    buildMockCard({
        title: 'Twilight',
        subtitle: 'Escaping Malevolence',
        cost: 3,
        power: 3,
        hp: 4,
        hasNonKeywordAbility: true,
        aspects: ['Vigilance', 'Heroism'],
        types: ['unit'],
        traits: ['republic', 'vehicle', 'transport'],
        setId: {
            set: 'TS26',
            number: 41
        },
        unique: true,
        arena: 'space',
        internalName: 'twilight#escaping-malevolence',
    }),
    buildMockCard({
        title: 'R2-D2',
        subtitle: 'Getting His Chance',
        cost: 2,
        power: 1,
        hp: 3,
        hasNonKeywordAbility: true,
        aspects: ['Aggression', 'Heroism'],
        types: ['unit'],
        traits: ['republic', 'droid'],
        keywords: ['raid 2'],
        setId: {
            set: 'TS26',
            number: 62
        },
        unique: true,
        arena: 'ground',
        internalName: 'r2d2#getting-his-chance',
    }),
    buildMockCard({
        title: 'Urgent Mission',
        cost: 2,
        hasNonKeywordAbility: true,
        aspects: ['Aggression', 'Heroism'],
        types: ['event'],
        traits: ['plan'],
        setId: {
            set: 'TS26',
            number: 64
        },
        unique: false,
        internalName: 'urgent-mission',
    }),
    buildMockCard({
        title: 'Ruping Rider',
        cost: 4,
        power: 3,
        hp: 4,
        hasNonKeywordAbility: true,
        aspects: ['Aggression'],
        types: ['unit'],
        traits: ['creature', 'trooper'],
        keywords: ['grit'],
        setId: {
            set: 'TS26',
            number: 67
        },
        unique: false,
        arena: 'ground',
        internalName: 'ruping-rider',
    }),
    buildMockCard({
        title: 'Deployed Droideka',
        cost: 4,
        power: 4,
        hp: 3,
        hasNonKeywordAbility: true,
        aspects: ['Cunning'],
        types: ['unit'],
        traits: ['separatist', 'droid'],
        keywords: ['ambush'],
        setId: {
            set: 'TS26',
            number: 77
        },
        unique: false,
        arena: 'ground',
        internalName: 'deployed-droideka',
    }),
    buildMockCard({
        title: 'Vanquish the Legion',
        cost: 4,
        hasNonKeywordAbility: true,
        aspects: ['Vigilance'],
        types: ['event'],
        traits: ['tactic'],
        setId: {
            set: 'TS26',
            number: 48
        },
        unique: false,
        internalName: 'vanquish-the-legion',
    }),
    buildMockCard({
        title: 'Pre Vizsla',
        subtitle: 'For Mandalore!',
        cost: 3,
        power: 4,
        hp: 3,
        hasNonKeywordAbility: false,
        aspects: ['Cunning', 'Villainy'],
        types: ['unit'],
        traits: ['mandalorian', 'trooper'],
        keywords: ['hidden', 'saboteur'],
        setId: {
            set: 'TS26',
            number: 74
        },
        unique: true,
        arena: 'ground',
        internalName: 'pre-vizsla#for-mandalore',
    }),
    buildMockCard({
        title: 'Jendirian Valley',
        subtitle: 'Refugee Freighter',
        cost: 4,
        power: 1,
        hp: 5,
        hasNonKeywordAbility: true,
        aspects: ['Vigilance', 'Command'],
        types: ['unit'],
        traits: ['republic', 'vehicle', 'transport'],
        keywords: ['restore 1'],
        setId: {
            set: 'TS26',
            number: 18
        },
        unique: true,
        arena: 'space',
        internalName: 'jenridian-valley#refugee-freighter',
    }),
    buildMockCard({
        title: 'Jedi General',
        cost: 5,
        power: 2,
        hp: 3,
        hasNonKeywordAbility: true,
        aspects: ['Command'],
        types: ['unit'],
        traits: ['force', 'republic', 'jedi'],
        keywords: ['ambush'],
        setId: {
            set: 'TS26',
            number: 55
        },
        unique: false,
        arena: 'ground',
        internalName: 'jedi-general',
    }),
    buildMockCard({
        title: 'Secret Marriage',
        cost: 2,
        hasNonKeywordAbility: true,
        aspects: ['Vigilance'],
        types: ['event'],
        traits: ['plan'],
        keywords: ['plot'],
        setId: {
            set: 'TS26',
            number: 46
        },
        unique: false,
        internalName: 'secret-marriage',
    }),
    buildMockCard({
        title: 'Fervor',
        cost: 5,
        hasNonKeywordAbility: true,
        aspects: ['Aggression'],
        types: ['event'],
        traits: ['innate'],
        setId: {
            set: 'TS26',
            number: 72
        },
        unique: false,
        internalName: 'fervor',
    }),
    buildMockCard({
        title: 'Wartime Refugee',
        cost: 1,
        power: 2,
        hp: 3,
        hasNonKeywordAbility: true,
        aspects: ['Vigilance'],
        types: ['unit'],
        traits: ['twi\'lek'],
        setId: {
            set: 'TS26',
            number: 43
        },
        unique: false,
        arena: 'ground',
        internalName: 'wartime-refugee',
    }),
    buildMockCard({
        title: 'Maul',
        subtitle: 'One Last Lesson',
        cost: 4,
        power: 5,
        hp: 4,
        hasNonKeywordAbility: true,
        aspects: ['Aggression', 'Cunning'],
        types: ['unit'],
        traits: ['force', 'underworld'],
        keywords: ['sentinel'],
        setId: {
            set: 'TS26',
            number: 30
        },
        unique: true,
        arena: 'ground',
        internalName: 'maul#one-last-lesson',
    }),
    buildMockCard({
        title: 'Captain Vaughn',
        subtitle: 'Search The Tunnels',
        cost: 3,
        power: 2,
        hp: 5,
        hasNonKeywordAbility: true,
        aspects: ['Vigilance', 'Heroism'],
        types: ['unit'],
        traits: ['republic', 'clone', 'trooper'],
        keywords: ['grit'],
        setId: {
            set: 'TS26',
            number: 39
        },
        unique: true,
        arena: 'ground',
        internalName: 'captain-vaughn#search-the-tunnels',
    }),
    buildMockCard({
        title: 'Relief Frigate',
        cost: 5,
        power: 3,
        hp: 7,
        hasNonKeywordAbility: true,
        aspects: ['Vigilance'],
        types: ['unit'],
        traits: ['republic', 'vehicle', 'capital ship'],
        setId: {
            set: 'TS26',
            number: 42
        },
        unique: false,
        arena: 'space',
        internalName: 'relief-frigate',
    }),
    buildMockCard({
        title: 'Wartime Profiteer',
        cost: 2,
        power: 3,
        hp: 3,
        hasNonKeywordAbility: true,
        aspects: ['Cunning'],
        types: ['unit'],
        traits: ['underworld'],
        setId: {
            set: 'TS26',
            number: 76
        },
        unique: false,
        arena: 'ground',
        internalName: 'wartime-profiteer',
    }),
    buildMockCard({
        title: 'Mechanize',
        cost: 2,
        hasNonKeywordAbility: true,
        aspects: ['Command'],
        types: ['event'],
        traits: ['supply'],
        setId: {
            set: 'TS26',
            number: 57
        },
        unique: false,
        internalName: 'mechanize',
    }),
    buildMockCard({
        title: 'Backed by Black Sun',
        cost: 3,
        hasNonKeywordAbility: true,
        aspects: ['Aggression'],
        types: ['event'],
        traits: ['supply'],
        setId: {
            set: 'TS26',
            number: 70
        },
        unique: false,
        internalName: 'backed-by-black-sun',
    }),
    buildMockCard({
        title: 'Reveal Intentions',
        cost: 1,
        hasNonKeywordAbility: true,
        aspects: ['Cunning'],
        types: ['event'],
        traits: ['gambit'],
        setId: {
            set: 'TS26',
            number: 80
        },
        unique: false,
        internalName: 'reveal-intentions',
    }),
    buildMockCard({
        title: 'First Battle Memorial',
        hp: 27,
        hasNonKeywordAbility: true,
        aspects: ['Vigilance'],
        types: ['base'],
        setId: {
            set: 'TS26',
            number: 9
        },
        unique: false,
        internalName: 'first-battle-memorial',
    }),
    buildMockCard({
        title: 'Dooku\'s Palace',
        hp: 27,
        hasNonKeywordAbility: true,
        aspects: ['Command'],
        types: ['base'],
        setId: {
            set: 'TS26',
            number: 10
        },
        unique: false,
        internalName: 'dookus-palace',
    }),
    buildMockCard({
        title: 'Executioner\'s Arena',
        hp: 27,
        hasNonKeywordAbility: true,
        aspects: ['Aggression'],
        types: ['base'],
        setId: {
            set: 'TS26',
            number: 11
        },
        unique: false,
        internalName: 'executioners-arena',
    }),
    buildMockCard({
        title: 'Sundari Palace',
        hp: 27,
        hasNonKeywordAbility: true,
        aspects: ['Cunning'],
        types: ['base'],
        setId: {
            set: 'TS26',
            number: 12
        },
        unique: false,
        internalName: 'sundari-palace',
    }),
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
        // TODO: Add this back when support exists keywords: ['support'],
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
        // TODO: Add this back when support exists keywords: ['support'],
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
        // TODO: Add this back when support exists keywords: ['support'],
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
    buildMockCard({
        title: 'Fearless Attack',
        cost: 4,
        hasNonKeywordAbility: true,
        aspects: ['Heroism'],
        types: ['event'],
        traits: ['tactic'],
        setId: {
            set: 'TS26',
            number: 84
        },
        unique: false,
        internalName: 'fearless-attack',
    }),
    buildMockCard({
        title: 'Underestimate',
        cost: 1,
        power: 0,
        hp: 0,
        upgradePower: 2,
        upgradeHp: 1,
        hasNonKeywordAbility: true,
        aspects: ['Cunning'],
        types: ['upgrade'],
        traits: ['innate'],
        setId: {
            set: 'TS26',
            number: 79
        },
        unique: false,
        internalName: 'underestimate',
    }),
    buildMockCard({
        title: 'Jango Fett',
        subtitle: 'Guarding the Count',
        cost: 5,
        power: 5,
        hp: 5,
        hasNonKeywordAbility: true,
        aspects: ['Cunning', 'Villainy'],
        types: ['unit'],
        traits: ['separatist', 'bounty hunter'],
        setId: {
            set: 'TS26',
            number: 75
        },
        unique: true,
        arena: 'ground',
        internalName: 'jango-fett#guarding-the-count',
    }),
    buildMockCard({
        title: 'Arms Deal',
        cost: 2,
        hasNonKeywordAbility: true,
        aspects: ['Aggression'],
        types: ['event'],
        traits: ['supply'],
        setId: {
            set: 'TS26',
            number: 68
        },
        unique: false,
        internalName: 'arms-deal',
    }),
    buildMockCard({
        title: 'Wartime Pirate',
        cost: 3,
        power: 4,
        hp: 4,
        hasNonKeywordAbility: true,
        aspects: ['Aggression'],
        types: ['unit'],
        traits: ['underworld', 'vehicle', 'capital ship'],
        setId: {
            set: 'TS26',
            number: 66
        },
        unique: false,
        arena: 'space',
        internalName: 'wartime-pirate',
    }),
    buildMockCard({
        title: 'Encircle',
        cost: 5,
        hasNonKeywordAbility: true,
        aspects: ['Command'],
        types: ['event'],
        traits: ['tactic'],
        setId: {
            set: 'TS26',
            number: 61
        },
        unique: false,
        internalName: 'encircle',
    }),
    buildMockCard({
        title: 'Backed by the Pykes',
        cost: 3,
        hasNonKeywordAbility: true,
        aspects: ['Command'],
        types: ['event'],
        traits: ['supply'],
        setId: {
            set: 'TS26',
            number: 58
        },
        unique: false,
        internalName: 'backed-by-the-pykes',
    }),
    buildMockCard({
        title: 'Coruscanti Spy',
        cost: 1,
        power: 0,
        hp: 2,
        hasNonKeywordAbility: true,
        aspects: ['Command'],
        types: ['unit'],
        traits: ['official'],
        keywords: ['raid 2'],
        setId: {
            set: 'TS26',
            number: 53
        },
        unique: false,
        arena: 'ground',
        internalName: 'coruscanti-spy',
    }),
    buildMockCard({
        title: 'Sith Traditions',
        cost: 2,
        hp: 0,
        power: 0,
        upgradePower: 1,
        upgradeHp: 1,
        hasNonKeywordAbility: true,
        aspects: ['Command', 'Villainy'],
        types: ['upgrade'],
        traits: ['sith', 'learned'],
        setId: {
            set: 'TS26',
            number: 52
        },
        unique: false,
        internalName: 'sith-traditions',
    }),
    buildMockCard({
        title: 'Champion',
        cost: 5,
        hp: 0,
        power: 0,
        upgradePower: 4,
        upgradeHp: 4,
        hasNonKeywordAbility: false,
        aspects: ['Vigilance'],
        types: ['upgrade'],
        traits: ['innate'],
        setId: {
            set: 'TS26',
            number: 45
        },
        unique: false,
        internalName: 'champion',
    }),
    buildMockCard({
        title: 'Dooku\'s Solar Sailer',
        subtitle: 'Beautiful and Expensive',
        cost: 3,
        power: 2,
        hp: 4,
        hasNonKeywordAbility: true,
        aspects: ['Vigilance', 'Villainy'],
        types: ['unit'],
        traits: ['separatist', 'vehicle', 'transport'],
        setId: {
            set: 'TS26',
            number: 38
        },
        unique: true,
        arena: 'space',
        internalName: 'dookus-solar-sailer#beautiful-and-expensive',
    }),
    buildMockCard({
        title: 'Fiery Alliance',
        cost: 2,
        power: 0,
        hp: 0,
        upgradePower: 2,
        upgradeHp: 2,
        hasNonKeywordAbility: true,
        aspects: ['Command', 'Aggression'],
        types: ['upgrade'],
        traits: ['innate'],
        setId: {
            set: 'TS26',
            number: 25
        },
        unique: false,
        internalName: 'fiery-alliance',
    }),
    buildMockCard({
        title: 'The Darksaber',
        subtitle: 'Only the Strongest Shall Rule',
        cost: 4,
        hp: 0,
        power: 0,
        upgradePower: 2,
        upgradeHp: 2,
        hasNonKeywordAbility: true,
        aspects: ['Command', 'Aggression', 'Villainy'],
        types: ['upgrade'],
        traits: ['mandalorian', 'item', 'weapon'],
        setId: {
            set: 'TS26',
            number: 22
        },
        unique: true,
        internalName: 'the-darksaber#only-the-strongest-shall-rule',
    }),
    buildMockCard({
        title: 'Rush Clovis',
        subtitle: 'Trapped by Authority',
        cost: 2,
        power: 2,
        hp: 3,
        hasNonKeywordAbility: false,
        aspects: ['Vigilance', 'Command'],
        types: ['unit'],
        traits: ['separatist', 'official'],
        keywords: ['ambush', 'restore 2'],
        setId: {
            set: 'TS26',
            number: 17
        },
        unique: true,
        arena: 'ground',
        internalName: 'rush-clovis#trapped-by-authority',
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
