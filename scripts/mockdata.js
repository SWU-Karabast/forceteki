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
        title: 'Colonel Yularen',
        subtitle: 'This Is Why We Plan',
        power: 4,
        hp: 6,
        cost: 5,
        hasNonKeywordAbility: true,
        aspects: ['command', 'villainy'],
        types: ['leader'],
        traits: ['imperial', 'official'],
        setId: {
            set: 'SEC',
            number: 6
        },
        unique: true,
        arena: 'ground',
        internalName: 'colonel-yularen#this-is-why-we-plan',
    }),
    buildMockCard({
        title: 'Nala Se',
        subtitle: 'Chief Medical Scientist',
        power: 4,
        hp: 7,
        hasNonKeywordAbility: true,
        aspects: ['vigilance'],
        types: ['unit'],
        traits: ['kaminoan'],
        setId: {
            set: 'SEC',
            number: 65
        },
        cost: 5,
        unique: true,
        arena: 'ground',
        internalName: 'nala-se#chief-medical-scientist',
    }),
    buildMockCard({
        title: 'Crosshair',
        subtitle: 'Filled With Doubt',
        power: 2,
        hp: 3,
        hasNonKeywordAbility: true,
        aspects: ['aggression'],
        types: ['unit'],
        traits: ['imperial', 'clone', 'trooper'],
        setId: {
            set: 'SEC',
            number: 162
        },
        cost: 2,
        unique: true,
        arena: 'ground',
        internalName: 'crosshair#filled-with-doubt',
    }),
    buildMockCard({
        title: 'Emergency Powers',
        hasNonKeywordAbility: true,
        aspects: ['vigilance', 'villainy'],
        types: ['event'],
        traits: ['law'],
        setId: {
            set: 'SEC',
            number: 40
        },
        cost: 1,
        unique: false,
        internalName: 'emergency-powers',
    }),
    buildMockCard({
        title: 'Let\'s Call It War',
        hasNonKeywordAbility: true,
        aspects: ['aggression'],
        types: ['event'],
        traits: ['tactic'],
        setId: {
            set: 'SEC',
            number: 180
        },
        cost: 3,
        unique: false,
        internalName: 'lets-call-it-war',
    }),
    buildMockCard({
        title: 'Ambition\'s Reward',
        hasNonKeywordAbility: true,
        aspects: ['aggression'],
        types: ['upgrade'],
        traits: ['law'],
        setId: {
            set: 'SEC',
            number: 175
        },
        upgradeHp: 1,
        upgradePower: 1,
        power: 1,
        hp: 1,
        cost: 2,
        unique: false,
        internalName: 'ambitions-reward',
    }),
    buildMockCard({
        title: 'Unauthorized Investigation',
        hasNonKeywordAbility: true,
        aspects: ['aggression'],
        types: ['event'],
        traits: ['plan'],
        setId: {
            set: 'SEC',
            number: 181
        },
        cost: 3,
        unique: false,
        internalName: 'unauthorized-investigation',
    }),
    buildMockCard({
        title: 'Grand Admiral Thrawn',
        subtitle: 'Grand Schemer',
        power: 8,
        hp: 7,
        hasNonKeywordAbility: true,
        aspects: ['cunning', 'villainy'],
        types: ['unit'],
        traits: ['imperial', 'official'],
        setId: {
            set: 'SEC',
            number: 193
        },
        cost: 7,
        unique: true,
        arena: 'ground',
        internalName: 'grand-admiral-thrawn#grand-schemer',
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
        keywords: ['hidden'],
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
        title: 'Ando Commission',
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
        title: 'Rebellious Functionary',
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
        internalName: 'rebellious-functionary',
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
    buildMockCard({
        title: 'Luthen Rael',
        subtitle: 'Don\'t You Want To Fight For Real?',
        power: 2,
        hp: 7,
        cost: 5,
        hasNonKeywordAbility: true,
        aspects: ['aggression', 'heroism'],
        types: ['leader'],
        traits: ['rebel'],
        setId: {
            set: 'SEC',
            number: 13
        },
        unique: true,
        arena: 'ground',
        internalName: 'luthen-rael#dont-you-want-to-fight-for-real',
    }),
    buildMockCard({
        title: 'Jade Squadron Patrol',
        power: 6,
        hp: 6,
        hasNonKeywordAbility: false,
        aspects: ['vigilance', 'heroism'],
        keywords: ['sentinel'],
        types: ['unit'],
        traits: ['resistance', 'vehicle', 'fighter'],
        setId: {
            set: 'SEC',
            number: 49
        },
        cost: 6,
        unique: false,
        arena: 'space',
        internalName: 'jade-squadron-patrol',
    }),
    buildMockCard({
        title: 'A-Wing',
        power: 1,
        hp: 2,
        hasNonKeywordAbility: false,
        aspects: ['cunning'],
        keywords: ['raid 1'],
        types: ['unit'],
        traits: ['vehicle', 'fighter'],
        setId: {
            set: 'SEC',
            number: 213
        },
        cost: 1,
        unique: false,
        arena: 'space',
        internalName: 'awing',
    }),
    buildMockCard({
        title: 'Bardottan Ornithopter',
        power: 3,
        hp: 4,
        hasNonKeywordAbility: true,
        aspects: ['vigilance'],
        types: ['unit'],
        traits: ['fringe', 'vehicle', 'transport'],
        setId: {
            set: 'SEC',
            number: 62
        },
        cost: 4,
        unique: false,
        arena: 'space',
        internalName: 'bardottan-ornithopter',
    }),
    buildMockCard({
        title: 'Daro Commando',
        power: 3,
        hp: 4,
        hasNonKeywordAbility: false,
        keywords: ['overwhelm'],
        aspects: ['command'],
        types: ['unit'],
        traits: ['imperial', 'clone', 'trooper'],
        setId: {
            set: 'SEC',
            number: 113
        },
        cost: 3,
        unique: false,
        arena: 'ground',
        internalName: 'daro-commando',
    }),
    buildMockCard({
        title: 'Supreme Council Aide',
        power: 2,
        hp: 2,
        hasNonKeywordAbility: false,
        aspects: ['villainy'],
        types: ['unit'],
        traits: ['first order', 'official'],
        setId: {
            set: 'SEC',
            number: 237
        },
        cost: 1,
        unique: false,
        arena: 'ground',
        internalName: 'supreme-council-aide',
    }),
    buildMockCard({
        title: 'Imperial Occupier',
        power: 2,
        hp: 2,
        hasNonKeywordAbility: true,
        aspects: ['aggression', 'villainy'],
        types: ['unit'],
        traits: ['imperial', 'trooper'],
        setId: {
            set: 'SEC',
            number: 132
        },
        cost: 2,
        unique: false,
        arena: 'ground',
        internalName: 'imperial-occupier',
    }),
    buildMockCard({
        title: 'C-3PO',
        subtitle: 'Human-Cyborg Relations',
        power: 1,
        hp: 6,
        cost: 4,
        hasNonKeywordAbility: true,
        aspects: ['cunning', 'heroism'],
        types: ['leader'],
        traits: ['rebel', 'droid'],
        setId: {
            set: 'SEC',
            number: 15
        },
        unique: true,
        arena: 'ground',
        internalName: 'c3po#humancyborg-relations',
    }),
    buildMockCard({
        title: 'Unruly Astromech',
        power: 3,
        hp: 2,
        hasNonKeywordAbility: true,
        keywords: ['hidden'],
        aspects: ['cunning'],
        types: ['unit'],
        traits: ['droid'],
        setId: {
            set: 'SEC',
            number: 221
        },
        cost: 3,
        unique: false,
        arena: 'ground',
        internalName: 'unruly-astromech',
    }),
    buildMockCard({
        title: 'Populist Advisor',
        power: 1,
        hp: 4,
        hasNonKeywordAbility: true,
        aspects: ['vigilance', 'heroism'],
        types: ['unit'],
        traits: ['new republic', 'official'],
        setId: {
            set: 'SEC',
            number: 41
        },
        cost: 1,
        unique: false,
        arena: 'ground',
        internalName: 'populist-advisor',
    }),
    buildMockCard({
        title: 'Reckless Rebel',
        power: 2,
        hp: 1,
        hasNonKeywordAbility: false,
        keywords: ['saboteur'],
        aspects: ['aggression'],
        types: ['unit'],
        traits: ['rebel', 'twi\'lek'],
        setId: {
            set: 'SEC',
            number: 160
        },
        cost: 1,
        unique: false,
        arena: 'ground',
        internalName: 'reckless-rebel',
    }),
    buildMockCard({
        title: 'Knowledge and Defense',
        hasNonKeywordAbility: true,
        aspects: ['vigilance'],
        types: ['event'],
        traits: ['learned'],
        setId: {
            set: 'SEC',
            number: 75
        },
        cost: 3,
        unique: false,
        internalName: 'knowledge-and-defense',
    }),
    buildMockCard({
        title: 'Figure of Unity',
        hasNonKeywordAbility: true,
        aspects: ['command', 'heroism'],
        types: ['upgrade'],
        traits: ['innate'],
        setId: {
            set: 'SEC',
            number: 104
        },
        cost: 3,
        upgradeHp: 2,
        upgradePower: 2,
        hp: 2,
        power: 2,
        unique: true,
        internalName: 'figure-of-unity',
    }),
    buildMockCard({
        title: 'Miraj Scintel',
        subtitle: 'The Weak Deserve to Kneel',
        power: 3,
        hp: 7,
        hasNonKeywordAbility: true,
        aspects: ['aggression', 'villainy'],
        types: ['unit'],
        traits: ['separatist', 'official'],
        setId: {
            set: 'SEC',
            number: 139
        },
        cost: 5,
        unique: true,
        arena: 'ground',
        internalName: 'miraj-scintel#the-weak-deserve-to-kneel',
    }),
    buildMockCard({
        title: 'Convene the Senate',
        hasNonKeywordAbility: true,
        aspects: ['command'],
        types: ['event'],
        traits: ['law'],
        setId: {
            set: 'SEC',
            number: 128
        },
        cost: 3,
        unique: false,
        internalName: 'convene-the-senate',
    }),
    buildMockCard({
        title: 'AAT Incinerator',
        power: 3,
        hp: 6,
        hasNonKeywordAbility: true,
        aspects: ['aggression'],
        types: ['unit'],
        traits: ['imperial', 'vehicle', 'tank'],
        setId: {
            set: 'SEC',
            number: 169
        },
        cost: 5,
        unique: false,
        arena: 'ground',
        internalName: 'aat-incinerator',
    }),
    buildMockCard({
        title: 'GNK Power Droid',
        power: 1,
        hp: 3,
        hasNonKeywordAbility: true,
        aspects: ['command'],
        types: ['unit'],
        traits: ['droid'],
        setId: {
            set: 'SEC',
            number: 110
        },
        cost: 2,
        unique: false,
        arena: 'ground',
        internalName: 'gnk-power-droid',
    }),
    buildMockCard({
        title: 'Vuutun Palaa',
        subtitle: 'Droid Control Ship',
        power: 7,
        hp: 7,
        hasNonKeywordAbility: true,
        aspects: ['command'],
        types: ['unit'],
        traits: ['separatist', 'vehicle', 'capital ship'],
        setId: {
            set: 'SEC',
            number: 122
        },
        cost: 9,
        unique: true,
        arena: 'space',
        internalName: 'vuutun-palaa#droid-control-ship',
    }),
    buildMockCard({
        title: 'Senator Chuchi',
        subtitle: 'Voice for the Voiceless',
        power: 2,
        hp: 5,
        hasNonKeywordAbility: true,
        aspects: ['vigilance', 'heroism'],
        keywords: ['restore 1'],
        types: ['unit'],
        traits: ['republic', 'official'],
        setId: {
            set: 'SEC',
            number: 45
        },
        cost: 3,
        unique: true,
        arena: 'ground',
        internalName: 'senator-chuchi#voice-for-the-voiceless',
    }),
    buildMockCard({
        title: 'Congress of Malastare',
        power: 5,
        hp: 5,
        hasNonKeywordAbility: true,
        aspects: ['vigilance'],
        types: ['unit'],
        traits: ['republic', 'official'],
        setId: {
            set: 'SEC',
            number: 64
        },
        cost: 5,
        unique: false,
        arena: 'ground',
        internalName: 'congress-of-malastare',
    }),
    buildMockCard({
        title: 'Mon Mothma',
        subtitle: 'Forming a Coalition',
        power: 3,
        hp: 7,
        cost: 5,
        hasNonKeywordAbility: true,
        aspects: ['command', 'heroism'],
        types: ['leader'],
        traits: ['republic', 'official'],
        setId: {
            set: 'SEC',
            number: 9
        },
        unique: true,
        arena: 'ground',
        internalName: 'mon-mothma#forming-a-coalition',
    }),
    buildMockCard({
        title: 'Alderaanian Envoys',
        power: 3,
        hp: 7,
        hasNonKeywordAbility: false,
        keywords: ['restore 3'],
        aspects: ['vigilance'],
        types: ['unit'],
        traits: ['republic', 'official'],
        setId: {
            set: 'SEC',
            number: 66
        },
        cost: 6,
        unique: false,
        arena: 'ground',
        internalName: 'alderaanian-envoys',
    }),
    buildMockCard({
        title: 'Populist Champion',
        power: 3,
        hp: 5,
        hasNonKeywordAbility: false,
        aspects: ['vigilance', 'heroism'],
        types: ['unit'],
        traits: ['new republic', 'official'],
        setId: {
            set: 'SEC',
            number: 44
        },
        cost: 3,
        unique: false,
        arena: 'ground',
        internalName: 'populist-champion',
    }),
    buildMockCard({
        title: 'Rotunda Senate Guards',
        power: 4,
        hp: 5,
        hasNonKeywordAbility: true,
        aspects: ['vigilance'],
        types: ['unit'],
        traits: ['republic', 'trooper'],
        setId: {
            set: 'SEC',
            number: 63
        },
        cost: 4,
        unique: false,
        arena: 'ground',
        internalName: 'rotunda-senate-guards',
    }),
    buildMockCard({
        title: 'Leia Organa',
        subtitle: 'Of a Secret Bloodline',
        power: 4,
        hp: 7,
        cost: 6,
        hasNonKeywordAbility: true,
        aspects: ['vigilance', 'heroism'],
        types: ['leader'],
        traits: ['new republic', 'official'],
        setId: {
            set: 'SEC',
            number: 4
        },
        unique: true,
        arena: 'ground',
        internalName: 'leia-organa#of-a-secret-bloodline',
    }),
    buildMockCard({
        title: 'Hyperspace Disaster',
        hasNonKeywordAbility: true,
        aspects: ['vigilance'],
        types: ['event'],
        traits: ['disaster'],
        setId: {
            set: 'SEC',
            number: 78
        },
        cost: 7,
        unique: false,
        internalName: 'hyperspace-disaster',
    }),
    buildMockCard({
        title: 'Corporate Warmongering',
        hasNonKeywordAbility: true,
        aspects: ['command', 'villainy'],
        types: ['event'],
        traits: ['plan'],
        setId: {
            set: 'SEC',
            number: 91
        },
        cost: 4,
        unique: false,
        internalName: 'corporate-warmongering',
    }),
    buildMockCard({
        title: 'Catch Unawares',
        hasNonKeywordAbility: true,
        aspects: ['cunning'],
        types: ['event'],
        traits: ['tactic'],
        setId: {
            set: 'SEC',
            number: 229
        },
        cost: 2,
        unique: false,
        internalName: 'catch-unawares',
    }),
    buildMockCard({
        title: 'Tempest Assault',
        hasNonKeywordAbility: true,
        aspects: ['aggression', 'villainy'],
        types: ['event'],
        traits: ['tactic'],
        setId: {
            set: 'SEC',
            number: 144
        },
        cost: 4,
        unique: false,
        internalName: 'tempest-assault',
    }),
    buildMockCard({
        title: 'Unauthorized Investigation',
        hasNonKeywordAbility: true,
        aspects: ['aggression'],
        types: ['event'],
        traits: ['plan'],
        setId: {
            set: 'SEC',
            number: 181
        },
        cost: 3,
        unique: false,
        internalName: 'unauthorized-investigation',
    }),
    buildMockCard({
        title: 'Governor Pryce',
        subtitle: 'Tyrant of Lothal',
        power: 4,
        hp: 6,
        cost: 6,
        hasNonKeywordAbility: true,
        aspects: ['aggression', 'villainy'],
        types: ['leader'],
        traits: ['imperial', 'official'],
        setId: {
            set: 'SEC',
            number: 11
        },
        unique: true,
        arena: 'ground',
        internalName: 'governor-pryce#tyrant-of-lothal',
    }),
    buildMockCard({
        title: 'Chancellor Valorum',
        subtitle: 'Civil Servant',
        power: 3,
        hp: 7,
        hasNonKeywordAbility: true,
        aspects: ['command', 'command'],
        types: ['unit'],
        traits: ['republic', 'official'],
        setId: {
            set: 'SEC',
            number: 107
        },
        cost: 5,
        unique: true,
        arena: 'ground',
        internalName: 'chancellor-valorum#civil-servant',
    }),
    buildMockCard({
        title: 'Grand Moff Tarkin',
        subtitle: 'Taking Krennic\'s Achievement',
        power: 2,
        hp: 6,
        hasNonKeywordAbility: true,
        aspects: ['cunning', 'villainy'],
        types: ['unit'],
        traits: ['imperial', 'official'],
        setId: {
            set: 'SEC',
            number: 192
        },
        cost: 6,
        unique: true,
        arena: 'ground',
        internalName: 'grand-moff-tarkin#taking-krennics-achievement',
    }),
    buildMockCard({
        title: 'Grand Admiral Thrawn',
        subtitle: 'Grand Schemer',
        power: 8,
        hp: 7,
        hasNonKeywordAbility: true,
        aspects: ['cunning', 'villainy'],
        types: ['unit'],
        traits: ['imperial', 'official'],
        setId: {
            set: 'SEC',
            number: 193
        },
        cost: 7,
        unique: true,
        arena: 'ground',
        internalName: 'grand-admiral-thrawn#grand-schemer',
    }),
    buildMockCard({
        title: 'The Galleon',
        subtitle: 'Marauding Pirate Ship',
        power: 6,
        hp: 6,
        hasNonKeywordAbility: true,
        aspects: ['aggression', 'villainy'],
        types: ['unit'],
        traits: ['underworld', 'vehicle', 'transport'],
        setId: {
            set: 'SEC',
            number: 141
        },
        cost: 7,
        unique: true,
        arena: 'space',
        internalName: 'the-galleon#marauding-pirate-ship',
    }),
    buildMockCard({
        title: 'Screeching TIE Fighter',
        power: 2,
        hp: 1,
        hasNonKeywordAbility: true,
        aspects: ['cunning', 'villainy'],
        types: ['unit'],
        traits: ['imperial', 'vehicle', 'fighter'],
        setId: {
            set: 'SEC',
            number: 185
        },
        cost: 1,
        unique: false,
        arena: 'space',
        internalName: 'screeching-tie-fighter',
    }),
    buildMockCard({
        title: 'Junior Senator',
        power: 3,
        hp: 2,
        hasNonKeywordAbility: true,
        aspects: ['cunning', 'heroism'],
        types: ['unit'],
        traits: ['republic', 'official'],
        setId: {
            set: 'SEC',
            number: 200
        },
        cost: 2,
        unique: false,
        arena: 'ground',
        internalName: 'junior-senator',
    }),
    buildMockCard({
        title: 'Enforcer Squadron',
        power: 5,
        hp: 3,
        hasNonKeywordAbility: false,
        keywords: ['hidden'],
        aspects: ['aggression', 'heroism'],
        types: ['unit'],
        traits: ['republic', 'vehicle', 'fighter'],
        setId: {
            set: 'SEC',
            number: 138
        },
        cost: 4,
        unique: false,
        arena: 'space',
        internalName: 'enforcer-squadron',
    }),
    buildMockCard({
        title: 'Ambition\'s Reward',
        hasNonKeywordAbility: true,
        aspects: ['aggression'],
        types: ['upgrade'],
        traits: ['law'],
        setId: {
            set: 'SEC',
            number: 175
        },
        cost: 2,
        upgradeHp: 1,
        upgradePower: 1,
        hp: 1,
        power: 1,
        unique: false,
        internalName: 'ambitions-reward',
    }),
    buildMockCard({
        title: 'Alexsandr Kallus',
        subtitle: 'With New Purpose',
        power: 6,
        hp: 6,
        hasNonKeywordAbility: true,
        aspects: ['aggression', 'heroism'],
        types: ['unit'],
        traits: ['rebel', 'spectre'],
        setId: {
            set: 'SEC',
            number: 155
        },
        cost: 7,
        unique: true,
        arena: 'ground',
        internalName: 'alexsandr-kallus#with-new-purpose',
    }),
    buildMockCard({
        title: 'Lando Calrissian',
        subtitle: 'Trust Me',
        power: 6,
        hp: 8,
        hasNonKeywordAbility: true,
        keywords: ['grit'],
        aspects: ['vigilance'],
        types: ['unit'],
        traits: ['fringe', 'official'],
        setId: {
            set: 'SEC',
            number: 68
        },
        cost: 7,
        unique: true,
        arena: 'ground',
        internalName: 'lando-calrissian#trust-me',
    }),
    buildMockCard({
        title: 'Cassian Andor',
        subtitle: 'Lay Low',
        power: 2,
        hp: 2,
        hasNonKeywordAbility: true,
        aspects: ['vigilance', 'heroism'],
        types: ['unit'],
        traits: ['fringe'],
        setId: {
            set: 'SEC',
            number: 42
        },
        cost: 2,
        unique: true,
        arena: 'ground',
        internalName: 'cassian-andor#lay-low',
    }),
    buildMockCard({
        title: 'Dryden Vos',
        subtitle: 'I Get All Worked Up',
        power: 2,
        hp: 5,
        hasNonKeywordAbility: true,
        aspects: ['aggression', 'villainy'],
        types: ['unit'],
        traits: ['underworld'],
        setId: {
            set: 'SEC',
            number: 137
        },
        cost: 4,
        unique: true,
        arena: 'ground',
        internalName: 'dryden-vos#i-get-all-worked-up',
    }),
    buildMockCard({
        title: 'Defense Fleet X-Wing',
        power: 1,
        hp: 4,
        hasNonKeywordAbility: false,
        keywords: ['sentinel'],
        aspects: ['vigilance'],
        types: ['unit'],
        traits: ['new republic', 'vehicle', 'fighter'],
        setId: {
            set: 'SEC',
            number: 60
        },
        cost: 3,
        unique: false,
        arena: 'space',
        internalName: 'defense-fleet-xwing',
    }),
    buildMockCard({
        title: 'Loan Shark',
        power: 2,
        hp: 5,
        hasNonKeywordAbility: false,
        keywords: ['ambush', 'raid 1'],
        aspects: ['cunning'],
        types: ['unit'],
        traits: ['official'],
        setId: {
            set: 'SEC',
            number: 222
        },
        cost: 4,
        unique: false,
        arena: 'ground',
        internalName: 'loan-shark',
    }),
    buildMockCard({
        title: 'Covert Operative',
        power: 2,
        hp: 4,
        hasNonKeywordAbility: true,
        aspects: ['heroism'],
        types: ['unit'],
        traits: ['rebel'],
        setId: {
            set: 'SEC',
            number: 253
        },
        cost: 4,
        unique: false,
        arena: 'ground',
        internalName: 'covert-operative',
    }),
    buildMockCard({
        title: 'Academy Disciplinarian',
        power: 3,
        hp: 4,
        hasNonKeywordAbility: true,
        aspects: ['aggression'],
        types: ['unit'],
        traits: ['imperial', 'official'],
        setId: {
            set: 'SEC',
            number: 165
        },
        cost: 3,
        unique: false,
        arena: 'ground',
        internalName: 'academy-disciplinarian',
    }),
    buildMockCard({
        title: 'Theed Security',
        power: 2,
        hp: 3,
        hasNonKeywordAbility: true,
        aspects: ['command', 'heroism'],
        types: ['unit'],
        traits: ['naboo', 'trooper'],
        setId: {
            set: 'SEC',
            number: 95
        },
        cost: 2,
        unique: false,
        arena: 'ground',
        internalName: 'theed-security',
    }),
    buildMockCard({
        title: 'Emissary\'s Sheathipede',
        power: 2,
        hp: 4,
        hasNonKeywordAbility: true,
        aspects: ['cunning'],
        types: ['unit'],
        traits: ['separatist', 'vehicle', 'transport'],
        setId: {
            set: 'SEC',
            number: 215
        },
        cost: 2,
        unique: false,
        arena: 'space',
        internalName: 'emissarys-sheathipede',
    }),
    buildMockCard({
        title: 'One in a Million',
        hasNonKeywordAbility: true,
        keywords: ['plot'],
        aspects: ['vigilance', 'heroism'],
        types: ['event'],
        traits: ['gambit'],
        setId: {
            set: 'SEC',
            number: 53
        },
        cost: 1,
        unique: false,
        internalName: 'one-in-a-million',
    }),
    buildMockCard({
        title: 'Restore Freedom',
        hasNonKeywordAbility: true,
        aspects: ['heroism'],
        types: ['event'],
        traits: ['gambit'],
        setId: {
            set: 'SEC',
            number: 257
        },
        cost: 2,
        unique: false,
        internalName: 'restore-freedom',
    }),
    buildMockCard({
        title: 'Crucible',
        subtitle: 'Centuries of Wisdom',
        power: 5,
        hp: 5,
        hasNonKeywordAbility: true,
        aspects: ['command'],
        types: ['unit'],
        traits: ['jedi', 'vehicle', 'transport'],
        setId: {
            set: 'SEC',
            number: 119
        },
        cost: 6,
        unique: true,
        arena: 'space',
        internalName: 'crucible#centuries-of-wisdom',
    }),
    buildMockCard({
        title: 'Libertine',
        subtitle: 'Under New Ownership',
        power: 3,
        hp: 7,
        hasNonKeywordAbility: true,
        aspects: ['cunning', 'cunning'],
        types: ['unit'],
        traits: ['underworld', 'vehicle', 'transport'],
        setId: {
            set: 'SEC',
            number: 212
        },
        cost: 4,
        unique: true,
        arena: 'space',
        internalName: 'libertine#under-new-ownership',
    }),
    buildMockCard({
        title: 'Cikatro Vizago',
        subtitle: 'Business Is What Matters',
        power: 3,
        hp: 4,
        hasNonKeywordAbility: true,
        aspects: ['cunning'],
        types: ['unit'],
        traits: ['underworld'],
        setId: {
            set: 'SEC',
            number: 218
        },
        cost: 3,
        unique: true,
        arena: 'ground',
        internalName: 'cikatro-vizago#business-is-what-matters',
    }),
    buildMockCard({
        title: 'Zam Wesell',
        subtitle: 'Inconspicuous Assassin',
        power: 1,
        hp: 5,
        hasNonKeywordAbility: true,
        aspects: ['vigilance', 'villainy'],
        types: ['unit'],
        traits: ['underworld', 'bounty hunter'],
        setId: {
            set: 'SEC',
            number: 29
        },
        cost: 2,
        unique: true,
        arena: 'ground',
        internalName: 'zam-wesell#inconspicuous-assassin',
    }),
    buildMockCard({
        title: 'Creditor\'s Claim',
        hasNonKeywordAbility: true,
        aspects: ['vigilance', 'villainy'],
        types: ['upgrade'],
        traits: ['supply'],
        setId: {
            set: 'SEC',
            number: 39
        },
        upgradeHp: 2,
        upgradePower: 2,
        power: 2,
        hp: 2,
        cost: 3,
        unique: false,
        internalName: 'creditors-claim',
    }),
    buildMockCard({
        title: 'Ziton Moj',
        subtitle: 'Black Sun Bully',
        power: 4,
        hp: 5,
        hasNonKeywordAbility: true,
        aspects: ['aggression'],
        types: ['unit'],
        traits: ['underworld'],
        setId: {
            set: 'SEC',
            number: 168
        },
        cost: 4,
        unique: true,
        arena: 'ground',
        internalName: 'ziton-moj#black-sun-bully',
    }),
    buildMockCard({
        title: 'DJ',
        subtitle: 'Need a Lift?',
        power: 4,
        hp: 6,
        hasNonKeywordAbility: true,
        aspects: ['cunning', 'cunning'],
        keywords: ['saboteur'],
        types: ['leader'],
        traits: ['underworld'],
        setId: {
            set: 'SEC',
            number: 18
        },
        cost: 6,
        unique: true,
        arena: 'ground',
        internalName: 'dj#need-a-lift',
    }),
    buildMockCard({
        title: 'Director Kennic',
        subtitle: 'I Lose Nothing But Time',
        power: 8,
        hp: 10,
        hasNonKeywordAbility: true,
        aspects: ['command', 'villainy'],
        types: ['unit'],
        traits: ['imperial', 'official'],
        setId: {
            set: 'SEC',
            number: 90
        },
        cost: 9,
        unique: true,
        arena: 'ground',
        internalName: 'director-krennic#i-lose-nothing-but-me',
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