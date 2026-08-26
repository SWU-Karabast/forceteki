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
            number: 168
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
        hp: 30,
        hasNonKeywordAbility: false,
        aspects: ['cunning'],
        traits: ['naboo'],
        types: ['base'],
        setId: {
            set: 'HMW',
            number: 33
        },
        unique: false,
        internalName: 'otoh-gunga'
    }),
    buildMockCard({
        title: 'Research Station 9',
        hp: 30,
        hasNonKeywordAbility: false,
        aspects: ['cunning'],
        traits: ['endor'],
        types: ['base'],
        setId: {
            set: 'HMW',
            number: 34
        },
        unique: false,
        internalName: 'research-station-9'
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
        text: 'As an additional cost to play this unit, put up to 2 units that each cost 5 or less from your discard pile on the bottom of your deck. This unit gains those units\' "When Played" abilities for this phase.',
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
    buildMockCard({
        title: 'Teebo',
        subtitle: 'Striped Hunter',
        cost: 1,
        power: 3,
        hp: 1,
        hasNonKeywordAbility: true,
        aspects: ['aggression', 'heroism'],
        keywords: ['hidden'],
        traits: ['ewok'],
        types: ['unit'],
        setId: {
            set: 'HMW',
            number: 162
        },
        unique: true,
        arena: 'ground',
        internalName: 'teebo#striped-hunter'
    }),
    buildMockCard({
        title: 'Ewok Archers',
        cost: 3,
        power: 2,
        hp: 5,
        hasNonKeywordAbility: true,
        aspects: ['heroism'],
        traits: ['ewok'],
        types: ['unit'],
        setId: {
            set: 'HMW',
            number: 257
        },
        unique: false,
        arena: 'ground',
        internalName: 'ewok-archers'
    }),
    buildMockCard({
        title: 'Chief Chirpa',
        subtitle: 'Defiant Elder',
        cost: 2,
        power: 1,
        hp: 5,
        hasNonKeywordAbility: true,
        aspects: ['aggression', 'heroism'],
        traits: ['ewok'],
        types: ['unit'],
        setId: {
            set: 'HMW',
            number: 164
        },
        unique: true,
        arena: 'ground',
        internalName: 'chief-chirpa#defiant-elder'
    }),
    buildMockCard({
        title: 'Scorch',
        subtitle: 'Imperial Commando',
        cost: 3,
        power: 3,
        hp: 5,
        hasNonKeywordAbility: true,
        aspects: ['vigilance', 'villainy'],
        traits: ['imperial', 'clone', 'trooper'],
        types: ['unit'],
        setId: {
            set: 'HMW',
            number: 64
        },
        unique: true,
        arena: 'ground',
        internalName: 'scorch#imperial-commando'
    }),
    buildMockCard({
        title: 'Kachirho',
        hp: 30,
        hasNonKeywordAbility: false,
        aspects: ['vigilance'],
        traits: ['kashyyyk'],
        types: ['base'],
        setId: {
            set: 'HMW',
            number: 21
        },
        unique: false,
        internalName: 'kachirho'
    }),
    buildMockCard({
        title: 'Tusken Camp',
        hp: 30,
        hasNonKeywordAbility: false,
        aspects: ['command'],
        traits: ['tatooine'],
        types: ['base'],
        setId: {
            set: 'HMW',
            number: 26
        },
        unique: false,
        internalName: 'tusken-camp'
    }),
    buildMockCard({
        title: 'Bright Tree Village',
        hp: 30,
        hasNonKeywordAbility: false,
        aspects: ['command'],
        traits: ['endor'],
        types: ['base'],
        setId: {
            set: 'HMW',
            number: 23
        },
        unique: false,
        internalName: 'bright-tree-village'
    }),
    buildMockCard({
        title: 'Shadowlands',
        hp: 30,
        hasNonKeywordAbility: false,
        aspects: ['aggression'],
        traits: ['kashyyyk'],
        types: ['base'],
        setId: {
            set: 'HMW',
            number: 30
        },
        unique: false,
        internalName: 'shadowlands'
    }),
    buildMockCard({
        title: 'Bioweapons Lab',
        hp: 30,
        hasNonKeywordAbility: false,
        aspects: ['aggression'],
        traits: ['naboo'],
        types: ['base'],
        setId: {
            set: 'HMW',
            number: 27
        },
        unique: false,
        internalName: 'bioweapons-lab'
    }),
    buildMockCard({
        title: 'Jundland Wastes',
        hp: 30,
        hasNonKeywordAbility: false,
        aspects: ['aggression'],
        traits: ['tatooine'],
        types: ['base'],
        setId: {
            set: 'HMW',
            number: 28
        },
        unique: false,
        internalName: 'jundland-wastes'
    }),
    buildMockCard({
        title: 'Leia Organa',
        subtitle: 'These Are My Friends',
        cost: 1,
        power: 2,
        hp: 3,
        hasNonKeywordAbility: true,
        aspects: ['command', 'heroism'],
        traits: ['rebel', 'official'],
        types: ['unit'],
        setId: {
            set: 'HMW',
            number: 115
        },
        unique: true,
        arena: 'ground',
        internalName: 'leia-organa#these-are-my-friends'
    }),
    buildMockCard({
        title: 'Darth Vader',
        subtitle: 'Might of the Empire',
        cost: 6,
        power: 5,
        hp: 5,
        hasNonKeywordAbility: true,
        aspects: ['command', 'villainy'],
        traits: ['force', 'imperial', 'sith'],
        keywords: ['raid 1'],
        types: ['leader'],
        setId: {
            set: 'HMW',
            number: 7
        },
        unique: true,
        arena: 'ground',
        internalName: 'darth-vader#mightof-the-empire'
    }),
    buildMockCard({
        title: 'Stormtrooper Patrol',
        cost: 3,
        power: 2,
        hp: 4,
        hasNonKeywordAbility: true,
        aspects: ['command', 'villainy'],
        traits: ['imperial', 'trooper'],
        keywords: ['sentinel'],
        types: ['unit'],
        setId: {
            set: 'HMW',
            number: 107
        },
        unique: false,
        arena: 'ground',
        internalName: 'stormtrooper-patrol'
    }),
    buildMockCard({
        title: 'Ewok Brigade',
        cost: 2,
        power: 2,
        hp: 4,
        hasNonKeywordAbility: false,
        aspects: ['command', 'heroism'],
        traits: ['ewok'],
        types: ['unit'],
        setId: {
            set: 'HMW',
            number: 116
        },
        unique: false,
        arena: 'ground',
        internalName: 'ewok-brigade'
    }),
    buildMockCard({
        title: 'Emperor Palpatine',
        subtitle: 'Consolidating Power',
        cost: 5,
        power: 3,
        hp: 2,
        hasNonKeywordAbility: true,
        aspects: ['command', 'villainy'],
        traits: ['force', 'imperial', 'sith', 'official'],
        types: ['unit'],
        setId: {
            set: 'HMW',
            number: 110
        },
        unique: true,
        arena: 'ground',
        internalName: 'emperor-palpatine#consolidating-power'
    }),
    buildMockCard({
        title: 'Giant Gorax',
        cost: 7,
        power: 7,
        hp: 7,
        hasNonKeywordAbility: true,
        aspects: ['aggression'],
        traits: ['creature'],
        keywords: ['overwhelm'],
        types: ['unit'],
        setId: {
            set: 'HMW',
            number: 188
        },
        unique: false,
        arena: 'ground',
        internalName: 'giant-gorax'
    }),
    buildMockCard({
        title: 'Village Troublemaker',
        cost: 1,
        power: 2,
        hp: 2,
        hasNonKeywordAbility: true,
        aspects: ['aggression'],
        traits: ['ewok'],
        types: ['unit'],
        setId: {
            set: 'HMW',
            number: 176
        },
        unique: false,
        arena: 'ground',
        internalName: 'village-troublemaker'
    }),
    buildMockCard({
        title: 'Breach',
        cost: 2,
        hasNonKeywordAbility: true,
        aspects: ['command', 'villainy'],
        traits: ['tactic'],
        types: ['event'],
        setId: {
            set: 'HMW',
            number: 114
        },
        unique: false,
        internalName: 'breach'
    }),
    buildMockCard({
        title: 'Nightfall',
        cost: 2,
        hasNonKeywordAbility: true,
        aspects: ['aggression'],
        traits: ['disaster'],
        types: ['event'],
        setId: {
            set: 'HMW',
            number: 193
        },
        unique: false,
        internalName: 'nightfall'
    }),
    buildMockCard({
        title: 'Grand Moff Tarkin',
        subtitle: 'Tyrant of the Outer Rim',
        backSideTitle: 'The Death Star',
        backSideSubtitle: 'Icon of Tyranny',
        cost: 9,
        power: 2,
        hp: 12,
        hasNonKeywordAbility: true,
        aspects: ['vigilance', 'villainy'],
        traits: ['imperial', 'official'],
        backSideTraits: ['imperial', 'vehicle', 'capital ship'],
        types: ['leader'],
        text: 'Ignore the aspect penalties on upgrades with Fortify you play.',
        epicAction: 'Epic Action: If you control 9 or more resources, deploy this leader.',
        deployBox: 'Ignore the aspect penalties on upgrades with Fortify you play.\n\nWhen the regroup phase starts: You may defeat a base with 10 or less remaining HP.',
        setId: {
            set: 'HMW',
            number: 4
        },
        unique: true,
        arena: 'space',
        internalName: 'grand-moff-tarkin#tyrant-of-the-outer-rim'
    }),
    buildMockCard({
        title: 'Overgrowth',
        cost: 5,
        hasNonKeywordAbility: true,
        aspects: ['command'],
        traits: ['disaster'],
        types: ['event'],
        setId: {
            set: 'HMW',
            number: 151
        },
        unique: false,
        internalName: 'overgrowth'
    }),
    buildMockCard({
        title: 'Ryyk Blademaster',
        cost: 4,
        power: 5,
        hp: 4,
        hasNonKeywordAbility: true,
        aspects: ['command', 'heroism'],
        traits: ['wookiee'],
        types: ['unit'],
        setId: {
            set: 'HMW',
            number: 118
        },
        unique: false,
        arena: 'ground',
        internalName: 'ryyk-blademaster'
    }),
    buildMockCard({
        title: 'King Grakchawwaa',
        subtitle: 'King of Kashyyyk',
        cost: 6,
        power: 6,
        hp: 6,
        hasNonKeywordAbility: true,
        aspects: ['command', 'heroism'],
        traits: ['wookiee', 'official'],
        types: ['unit'],
        setId: {
            set: 'HMW',
            number: 123
        },
        unique: true,
        arena: 'ground',
        internalName: 'king-grakchawwaa#king-of-kashyyyk'
    }),
    buildMockCard({
        title: 'Tarfful',
        subtitle: 'Fighting from the Shadowlands',
        cost: 6,
        power: 3,
        hp: 7,
        hasNonKeywordAbility: true,
        aspects: ['command', 'heroism'],
        traits: ['rebel', 'wookiee'],
        keywords: ['sentinel'],
        types: ['leader'],
        setId: {
            set: 'HMW',
            number: 10
        },
        unique: true,
        arena: 'ground',
        internalName: 'tarfful#fighting-from-the-shadowlands'
    }),
    buildMockCard({
        title: 'Alliance Shield Generator',
        cost: 2,
        power: 0,
        hp: 0,
        upgradePower: 0,
        upgradeHp: 0,
        hasNonKeywordAbility: true,
        aspects: ['vigilance', 'heroism'],
        traits: ['fortification'],
        keywords: ['fortify'],
        types: ['upgrade'],
        setId: {
            set: 'HMW',
            number: 81
        },
        unique: false,
        internalName: 'alliance-shield-generator',
    }),
    buildMockCard({
        title: 'Carbonite Chamber',
        cost: 1,
        power: 0,
        hp: 0,
        upgradePower: 0,
        upgradeHp: 0,
        hasNonKeywordAbility: true,
        aspects: ['vigilance'],
        traits: ['fortification'],
        keywords: ['fortify'],
        types: ['upgrade'],
        setId: {
            set: 'HMW',
            number: 95
        },
        unique: false,
        internalName: 'carbonite-chamber',
    }),
    buildMockCard({
        title: 'Trap Field',
        cost: 2,
        power: 0,
        hp: 0,
        upgradePower: 0,
        upgradeHp: 0,
        hasNonKeywordAbility: true,
        aspects: ['aggression', 'heroism'],
        traits: ['fortification'],
        keywords: ['fortify'],
        types: ['upgrade'],
        setId: {
            set: 'HMW',
            number: 171
        },
        unique: false,
        internalName: 'trap-field',
    }),
    buildMockCard({
        title: 'The Tarkin Doctrine',
        subtitle: 'Protect and Punish',
        cost: 1,
        power: 0,
        hp: 0,
        upgradePower: 0,
        upgradeHp: 0,
        hasNonKeywordAbility: true,
        aspects: ['cunning', 'villainy'],
        traits: ['law'],
        keywords: ['fortify'],
        types: ['upgrade'],
        setId: {
            set: 'HMW',
            number: 206
        },
        unique: true,
        internalName: 'the-tarkin-doctrine#protect-and-punish',
    }),
    buildMockCard({
        title: 'Dark Sanctum',
        cost: 3,
        power: 0,
        hp: 0,
        upgradePower: 0,
        upgradeHp: 0,
        hasNonKeywordAbility: true,
        aspects: ['vigilance', 'villainy'],
        traits: ['fortification'],
        keywords: ['fortify'],
        types: ['upgrade'],
        setId: {
            set: 'HMW',
            number: 70
        },
        unique: false,
        internalName: 'dark-sanctum',
    }),
    buildMockCard({
        title: 'Sinister War Memorial',
        cost: 2,
        power: 0,
        hp: 0,
        upgradePower: 0,
        upgradeHp: 0,
        hasNonKeywordAbility: true,
        aspects: ['command', 'villainy'],
        traits: ['fortification'],
        keywords: ['fortify'],
        types: ['upgrade'],
        setId: {
            set: 'HMW',
            number: 113
        },
        unique: false,
        internalName: 'sinister-war-memorial',
    }),
    buildMockCard({
        title: 'Beast Lair',
        cost: 2,
        power: 0,
        hp: 0,
        upgradePower: 0,
        upgradeHp: 0,
        hasNonKeywordAbility: true,
        aspects: ['command'],
        traits: ['fortification'],
        keywords: ['fortify'],
        types: ['upgrade'],
        setId: {
            set: 'HMW',
            number: 147
        },
        unique: false,
        internalName: 'beast-lair',
    }),
    buildMockCard({
        title: 'Chewbacca',
        subtitle: 'Resourceful Wookiee',
        cost: 3,
        power: 0,
        hp: 5,
        hasNonKeywordAbility: true,
        aspects: ['command', 'heroism'],
        traits: ['wookiee'],
        types: ['unit'],
        setId: {
            set: 'HMW',
            number: 117
        },
        unique: true,
        arena: 'ground',
        internalName: 'chewbacca#resourceful-wookiee'
    }),
    buildMockCard({
        title: 'Hunter',
        subtitle: 'Everyone Get To Cover!',
        cost: 6,
        power: 4,
        hp: 7,
        hasNonKeywordAbility: true,
        aspects: ['vigilance', 'command', 'heroism'],
        traits: ['clone'],
        types: ['unit'],
        setId: {
            set: 'HMW',
            number: 35
        },
        unique: true,
        arena: 'ground',
        internalName: 'hunter#everyone-get-to-cover'
    }),
    buildMockCard({
        title: 'Yord Fandar',
        subtitle: 'Devoutly Disciplined',
        cost: 2,
        power: 2,
        hp: 4,
        hasNonKeywordAbility: true,
        aspects: ['vigilance', 'heroism'],
        traits: ['force', 'jedi'],
        types: ['unit'],
        setId: {
            set: 'HMW',
            number: 74
        },
        unique: true,
        arena: 'ground',
        internalName: 'yord-fandar#devoutly-disciplined'
    }),
    buildMockCard({
        title: 'Growth',
        cost: 5,
        hasNonKeywordAbility: true,
        aspects: [],
        traits: ['innate'],
        types: ['event'],
        setId: {
            set: 'HMW',
            number: 272
        },
        unique: false,
        internalName: 'growth'
    }),
    buildMockCard({
        title: 'Osha',
        subtitle: 'Haunted By Her Past',
        cost: 6,
        power: 5,
        hp: 6,
        hasNonKeywordAbility: true,
        aspects: ['cunning', 'heroism'],
        keywords: ['saboteur'],
        traits: ['force'],
        types: ['leader'],
        setId: {
            set: 'HMW',
            number: 17
        },
        unique: true,
        arena: 'ground',
        internalName: 'osha#haunted-by-her-past'
    }),
    buildMockCard({
        title: 'Mae',
        subtitle: 'Kill The Dream',
        cost: 3,
        power: 2,
        hp: 4,
        hasNonKeywordAbility: false,
        aspects: ['vigilance', 'cunning', 'villainy'],
        traits: ['force', 'sith'],
        keywords: ['ambush', 'shielded', 'grit'],
        types: ['unit'],
        setId: {
            set: 'HMW',
            number: 55
        },
        unique: true,
        arena: 'ground',
        internalName: 'mae#kill-the-dream'
    }),
    buildMockCard({
        title: 'Sol',
        subtitle: 'Compassionate Guardian',
        cost: 2,
        power: 2,
        hp: 2,
        hasNonKeywordAbility: true,
        aspects: ['cunning', 'heroism'],
        traits: ['force', 'jedi'],
        keywords: ['shielded'],
        types: ['unit'],
        setId: {
            set: 'HMW',
            number: 210
        },
        unique: true,
        arena: 'ground',
        internalName: 'sol#compassionate-guardian'
    }),
    buildMockCard({
        title: 'Qimir',
        subtitle: 'Everyone Has a Weakness',
        cost: 1,
        power: 3,
        hp: 1,
        hasNonKeywordAbility: true,
        aspects: ['cunning', 'villainy'],
        traits: ['force'],
        types: ['unit'],
        setId: {
            set: 'HMW',
            number: 196
        },
        unique: true,
        arena: 'ground',
        internalName: 'qimir#everyone-has-a-weakness'
    }),
    buildMockCard({
        title: 'Bacta Tank',
        cost: 1,
        power: 0,
        hp: 0,
        upgradePower: 0,
        upgradeHp: 0,
        hasNonKeywordAbility: true,
        aspects: ['vigilance', 'command'],
        traits: ['fortification'],
        keywords: ['fortify'],
        types: ['upgrade'],
        setId: {
            set: 'HMW',
            number: 37
        },
        unique: false,
        internalName: 'bacta-tank',
    }),
    buildMockCard({
        title: 'Intelligence Agency',
        cost: 1,
        power: 0,
        hp: 0,
        upgradePower: 0,
        upgradeHp: 0,
        hasNonKeywordAbility: true,
        aspects: ['cunning', 'villainy'],
        traits: ['fortification'],
        keywords: ['fortify'],
        types: ['upgrade'],
        setId: {
            set: 'HMW',
            number: 205
        },
        unique: false,
        internalName: 'intelligence-agency',
    }),
    buildMockCard({
        title: 'Han Solo',
        subtitle: 'My Team\'s Ready',
        cost: 5,
        power: 4,
        hp: 7,
        hasNonKeywordAbility: true,
        aspects: ['aggression', 'heroism'],
        traits: ['rebel', 'official'],
        types: ['unit'],
        setId: {
            set: 'HMW',
            number: 170
        },
        unique: true,
        arena: 'ground',
        internalName: 'han-solo#my-teams-ready'
    }),
    buildMockCard({
        title: 'Carrion Spike',
        subtitle: 'Harbinger of Tyranny',
        cost: 5,
        power: 3,
        hp: 5,
        hasNonKeywordAbility: true,
        aspects: ['vigilance', 'villainy'],
        traits: ['imperial', 'vehicle', 'capital ship'],
        keywords: ['shielded'],
        types: ['unit'],
        setId: {
            set: 'HMW',
            number: 66
        },
        unique: true,
        arena: 'space',
        internalName: 'carrion-spike#harbinger-of-tyranny'
    }),
    buildMockCard({
        title: 'Rho Medical Shuttle',
        cost: 3,
        power: 3,
        hp: 3,
        hasNonKeywordAbility: true,
        aspects: ['vigilance', 'villainy'],
        traits: ['imperial', 'vehicle', 'transport'],
        types: ['unit'],
        setId: {
            set: 'HMW',
            number: 63
        },
        unique: false,
        arena: 'space',
        internalName: 'rho-medical-shuttle'
    }),
    buildMockCard({
        title: 'Sando Aqua Monster',
        cost: 8,
        power: 5,
        hp: 9,
        hasNonKeywordAbility: true,
        aspects: ['vigilance'],
        traits: ['creature'],
        keywords: ['grit'],
        types: ['unit'],
        setId: {
            set: 'HMW',
            number: 94
        },
        unique: false,
        arena: 'ground',
        internalName: 'sando-aqua-monster'
    }),
    buildMockCard({
        title: 'Champions of Endor',
        cost: 2,
        power: 3,
        hp: 3,
        hasNonKeywordAbility: false,
        aspects: ['aggression', 'heroism'],
        traits: ['ewok'],
        types: ['unit'],
        setId: {
            set: 'HMW',
            number: 163
        },
        unique: false,
        arena: 'ground',
        internalName: 'champions-of-endor'
    }),
    buildMockCard({
        title: 'Therm Scissorpunch',
        subtitle: 'Boastful Gambler',
        cost: 2,
        power: 5,
        hp: 5,
        hasNonKeywordAbility: true,
        aspects: ['cunning'],
        traits: ['underworld'],
        types: ['unit'],
        setId: {
            set: 'HMW',
            number: 223
        },
        unique: true,
        arena: 'ground',
        internalName: 'therm-scissorpunch#boastful-gambler'
    }),
    buildMockCard({
        title: 'General Grievous',
        subtitle: 'Scourge of Dathomir',
        cost: 7,
        power: 8,
        hp: 5,
        hasNonKeywordAbility: true,
        aspects: ['aggression', 'villainy'],
        traits: ['separatist', 'official'],
        types: ['unit'],
        setId: {
            set: 'HMW',
            number: 159
        },
        unique: true,
        arena: 'ground',
        internalName: 'general-grievous#scourge-of-dathomir'
    }),
    buildMockCard({
        title: 'Dooku\'s Solar Sailer',
        subtitle: 'Droid Army Portent',
        cost: 3,
        power: 3,
        hp: 3,
        hasNonKeywordAbility: true,
        aspects: ['aggression', 'villainy'],
        traits: ['separatist', 'vehicle', 'transport'],
        types: ['unit'],
        setId: {
            set: 'HMW',
            number: 154
        },
        unique: true,
        arena: 'space',
        internalName: 'dookus-solar-sailer#droid-army-portent'
    }),
    buildMockCard({
        title: 'Ravage',
        cost: 4,
        hasNonKeywordAbility: true,
        aspects: ['vigilance', 'villainy'],
        traits: ['disaster', 'tactic'],
        types: ['event'],
        setId: {
            set: 'HMW',
            number: 71
        },
        unique: false,
        internalName: 'ravage'
    }),
    buildMockCard({
        title: 'Raze to Ruin',
        cost: 2,
        hasNonKeywordAbility: true,
        aspects: ['aggression', 'villainy'],
        traits: ['disaster', 'plan'],
        types: ['event'],
        setId: {
            set: 'HMW',
            number: 161
        },
        unique: false,
        internalName: 'raze-to-ruin'
    }),
    buildMockCard({
        title: 'Darth Sidious',
        subtitle: 'There is No Mercy',
        cost: 6,
        power: 4,
        hp: 5,
        hasNonKeywordAbility: true,
        aspects: ['aggression', 'villainy'],
        traits: ['force', 'sith'],
        keywords: ['hidden'],
        types: ['leader'],
        setId: {
            set: 'HMW',
            number: 11
        },
        unique: true,
        arena: 'ground',
        internalName: 'darth-sidious#there-is-no-mercy'
    }),
    buildMockCard({
        title: 'Babwa Venomor',
        subtitle: 'Burning Kashyyyk',
        cost: 2,
        power: 4,
        hp: 4,
        hasNonKeywordAbility: true,
        aspects: ['aggression', 'villainy'],
        keywords: ['overwhelm'],
        traits: ['imperial'],
        types: ['unit'],
        setId: {
            set: 'HMW',
            number: 152
        },
        unique: true,
        arena: 'ground',
        internalName: 'babwa-venomor#burning-kashyyyk'
    }),
    buildMockCard({
        title: 'Third Sister',
        subtitle: 'Cycle of Vengeance',
        cost: 4,
        power: 6,
        hp: 3,
        hasNonKeywordAbility: true,
        aspects: ['aggression', 'cunning', 'villainy'],
        traits: ['force', 'imperial', 'inquisitor'],
        keywords: ['overwhelm'],
        types: ['unit'],
        setId: {
            set: 'HMW',
            number: 51
        },
        unique: true,
        arena: 'ground',
        internalName: 'third-sister#cycle-of-vengeance'
    }),
    buildMockCard({
        title: 'The Warrior',
        subtitle: 'Deft Duelist',
        cost: 5,
        power: 3,
        hp: 6,
        hasNonKeywordAbility: true,
        aspects: ['cunning', 'heroism'],
        traits: ['tusken'],
        keywords: ['ambush', 'raid 1'],
        types: ['leader'],
        setId: {
            set: 'HMW',
            number: 18
        },
        unique: true,
        arena: 'ground',
        internalName: 'the-warrior#deft-duelist'
    }),
    buildMockCard({
        title: 'The Chieftain',
        subtitle: 'Here Since The Oceans Dried',
        cost: 3,
        power: 2,
        hp: 5,
        hasNonKeywordAbility: true,
        aspects: ['cunning', 'heroism'],
        traits: ['tusken'],
        types: ['unit'],
        setId: {
            set: 'HMW',
            number: 212
        },
        unique: true,
        arena: 'ground',
        internalName: 'the-chieftain#here-since-the-oceans-dried'
    }),
    buildMockCard({
        title: 'Teeka',
        subtitle: 'You\'re In Luck',
        cost: 1,
        power: 2,
        hp: 2,
        hasNonKeywordAbility: true,
        aspects: ['cunning'],
        traits: ['jawa'],
        types: ['unit'],
        setId: {
            set: 'HMW',
            number: 221
        },
        unique: true,
        arena: 'ground',
        internalName: 'teeka#youre-in-luck'
    }),
    buildMockCard({
        title: 'Raiding Party',
        cost: 5,
        power: 0,
        hp: 6,
        hasNonKeywordAbility: true,
        aspects: ['cunning'],
        traits: ['tusken'],
        keywords: ['raid 6'],
        types: ['unit'],
        setId: {
            set: 'HMW',
            number: 230
        },
        unique: false,
        arena: 'ground',
        internalName: 'raiding-party'
    }),
    buildMockCard({
        title: 'Sandcrawler Sales Team',
        cost: 2,
        power: 3,
        hp: 2,
        hasNonKeywordAbility: true,
        aspects: ['cunning'],
        traits: ['jawa'],
        keywords: ['saboteur'],
        types: ['unit'],
        setId: {
            set: 'HMW',
            number: 222
        },
        unique: false,
        arena: 'ground',
        internalName: 'sandcrawler-sales-team'
    }),
    buildMockCard({
        title: 'Stormchaser',
        cost: 2,
        power: 3,
        hp: 2,
        hasNonKeywordAbility: true,
        aspects: ['aggression'],
        traits: ['tusken'],
        types: ['unit'],
        setId: {
            set: 'HMW',
            number: 180
        },
        unique: false,
        arena: 'ground',
        internalName: 'stormchaser'
    }),
    buildMockCard({
        title: 'Offworld Jawa',
        cost: 1,
        power: 2,
        hp: 1,
        hasNonKeywordAbility: false,
        aspects: [],
        traits: ['jawa'],
        types: ['unit'],
        setId: {
            set: 'HMW',
            number: 268
        },
        unique: false,
        arena: 'ground',
        internalName: 'offworld-jawa'
    }),
    buildMockCard({
        title: 'Sandstorm',
        cost: 3,
        hasNonKeywordAbility: true,
        aspects: ['cunning'],
        traits: ['disaster'],
        types: ['event'],
        setId: {
            set: 'HMW',
            number: 240
        },
        unique: false,
        internalName: 'sandstorm'
    }),
    buildMockCard({
        title: 'Easy Prey',
        cost: 1,
        hasNonKeywordAbility: true,
        aspects: ['cunning'],
        traits: ['innate'],
        types: ['event'],
        setId: {
            set: 'HMW',
            number: 237
        },
        unique: false,
        internalName: 'easy-prey'
    }),
    buildMockCard({
        title: 'Boba Fett',
        subtitle: 'Family Found',
        cost: 3,
        power: 1,
        hp: 5,
        hasNonKeywordAbility: true,
        aspects: ['cunning'],
        traits: ['tusken'],
        keywords: ['ambush'],
        types: ['unit'],
        setId: {
            set: 'HMW',
            number: 225
        },
        unique: true,
        arena: 'ground',
        internalName: 'boba-fett#family-found'
    }),
    buildMockCard({
        title: 'Luke Skywalker',
        subtitle: 'Dreaming Farmboy',
        cost: 1,
        power: 1,
        hp: 3,
        hasNonKeywordAbility: true,
        aspects: ['cunning', 'heroism'],
        traits: ['force', 'fringe'],
        keywords: ['raid 1'],
        types: ['unit'],
        setId: {
            set: 'HMW',
            number: 208
        },
        unique: true,
        arena: 'ground',
        internalName: 'luke-skywalker#dreaming-boy',
    }),
    buildMockCard({
        title: 'Fennec Shand',
        subtitle: 'A Ship For a Life',
        cost: 1,
        power: 0,
        hp: 4,
        hasNonKeywordAbility: false,
        aspects: ['aggression'],
        traits: ['underworld'],
        keywords: ['raid 2'],
        types: ['unit'],
        setId: {
            set: 'HMW',
            number: 175
        },
        unique: true,
        arena: 'ground',
        internalName: 'fennec-shand#a-ship-for-a-life',
    }),

    // -------- End Mock Cards --------
];

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

    return { mockCardNames, cards: allCards };
}

module.exports = { addMockCards };