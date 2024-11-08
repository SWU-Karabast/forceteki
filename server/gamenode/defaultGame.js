const { count } = require('console');

const defaultGameSettings = {
    id: '0001',
    name: 'Test Game',
    allowSpectators: false,
    spectatorSquelch: true,
    owner: 'Order66',
    clocks: 'timer',
    players: [
        {
            user: {
                username: 'Order66',
                settings: {
                    optionSettings: {
                        markCardsUnselectable: true,
                        cancelOwnAbilities: false,
                        orderForcedAbilities: false,
                        confirmOneClick: false,
                        disableCardStats: false,
                        showStatusInSidebar: false,
                        sortHandByName: false
                    }
                }
            },
            id: '66',
            deck: {
                leader: [
                    {
                        count: 1,
                        card: {
                            title: 'Darth Vader',
                            subtitle: 'Dark Lord of the Sith',
                            cost: 7,
                            hp: 8,
                            power: 5,
                            text: 'Action [1 resource, exhaust]: If you played a [Villainy] card this phase, deal 1 damage to a unit and 1 damage to a base.',
                            deployBox: 'On Attack: You may deal 2 damage to a unit.',
                            epicAction: 'Epic Action: If you control 7 or more resources, deploy this leader. (Flip him, ready him, and move him to the ground arena.)',
                            unique: true,
                            rules: 'Vader’s leader ability still can be used as an action even if you haven’t played a Villain card this phase (but it deals no damage).\n',
                            id: '6088773439',
                            aspects: ['aggression', 'villainy'],
                            traits: ['force', 'imperial', 'sith'],
                            arena: 'ground',
                            keywords: [],
                            types: ['leader'],
                            internalName: 'darth-vader#dark-lord-of-the-sith'
                        }
                    }
                ],
                base: [
                    {
                        count: 1,
                        card: {
                            title: 'Command Center',
                            subtitle: null,
                            cost: null,
                            hp: 30,
                            power: null,
                            text: null,
                            deployBox: null,
                            epicAction: null,
                            unique: false,
                            rules: null,
                            id: '0507674993',
                            aspects: [
                                'command'
                            ],
                            traits: [],
                            keywords: [],
                            types: [
                                'base'
                            ],
                            setId: {
                                set: 'SOR',
                                number: 23
                            },
                            internalName: 'command-center'
                        }
                    }
                ],
                deckCards: [
                    {
                        count: 1,
                        card: {
                            title: 'Overwhelming Barrage',
                            subtitle: null,
                            cost: 5,
                            hp: null,
                            power: null,
                            text: 'Give a friendly unit +2/+2 for this phase. Then, it deals damage equal to its power divided as you choose among any number of other units.',
                            deployBox: null,
                            epicAction: null,
                            unique: false,
                            rules: 'You can choose to assign more damage to a unit than it has remaining HP.\nAll damage dealt by a single ability is dealt simultaneously.\n',
                            id: '1900571801',
                            aspects: [
                                'command',
                                'villainy'
                            ],
                            traits: [
                                'tactic'
                            ],
                            keywords: [],
                            types: [
                                'event'
                            ],
                            setId: {
                                set: 'SOR',
                                number: 92
                            },
                            internalName: 'overwhelming-barrage'
                        }
                    },
                    {
                        count: 1,
                        card: {
                            title: 'Maximum Firepower',
                            subtitle: null,
                            cost: 4,
                            hp: null,
                            power: null,
                            text: 'A friendly Imperial unit deals damage equal to its power to a unit.\n\nThen, another friendly Imperial unit deals damage equal to its power to the same unit.',
                            deployBox: null,
                            epicAction: null,
                            unique: false,
                            rules: null,
                            id: '2758597010',
                            aspects: [
                                'villainy'
                            ],
                            traits: [
                                'imperial',
                                'tactic'
                            ],
                            keywords: [],
                            types: [
                                'event'
                            ],
                            setId: {
                                set: 'SOR',
                                number: 234
                            },
                            internalName: 'maximum-firepower'
                        }
                    },
                    {
                        count: 3,
                        card: {
                            title: 'I Am Your Father',
                            subtitle: null,
                            cost: 3,
                            hp: null,
                            power: null,
                            text: 'Deal 7 damage to an enemy unit unless its controller says "no." If they do, draw 3 cards.',
                            deployBox: null,
                            epicAction: null,
                            unique: false,
                            rules: 'You must choose a unit before your opponent chooses whether to say “no.”\nYour opponent may opt to use another method instead of saying “no” as long as they clearly indicate which option they are choosing.\n',
                            id: '0523973552',
                            aspects: [
                                'villainy'
                            ],
                            traits: [
                                'gambit'
                            ],
                            keywords: [],
                            types: [
                                'event'
                            ],
                            setId: {
                                set: 'SOR',
                                number: 233
                            },
                            internalName: 'i-am-your-father'
                        }
                    },
                    {
                        count: 3,
                        card: {
                            title: 'Open Fire',
                            subtitle: null,
                            cost: 3,
                            hp: null,
                            power: null,
                            text: 'Deal 4 damage to a unit.',
                            deployBox: null,
                            epicAction: null,
                            unique: false,
                            rules: null,
                            id: '8148673131',
                            aspects: [
                                'aggression'
                            ],
                            traits: [
                                'tactic'
                            ],
                            keywords: [],
                            types: [
                                'event'
                            ],
                            setId: {
                                set: 'SOR',
                                number: 172
                            },
                            internalName: 'open-fire'
                        }
                    },
                    {
                        count: 1,
                        card: {
                            title: 'Resupply',
                            subtitle: null,
                            cost: 3,
                            hp: null,
                            power: null,
                            text: 'Put this event into play as a resource.',
                            deployBox: null,
                            epicAction: null,
                            unique: false,
                            rules: null,
                            id: '2703877689',
                            aspects: [
                                'command'
                            ],
                            traits: [
                                'supply'
                            ],
                            keywords: [],
                            types: [
                                'event'
                            ],
                            setId: {
                                set: 'SOR',
                                number: 126
                            },
                            internalName: 'resupply'
                        }
                    },
                    {
                        count: 1,
                        card: {
                            title: 'Force Choke',
                            subtitle: null,
                            cost: 2,
                            hp: null,
                            power: null,
                            text: 'If you control a FORCE unit, this event costs [1 resource] less to play. \n\nDeal 5 damage to a non-VEHICLE unit. That unit\'s controller draws a card.',
                            deployBox: null,
                            epicAction: null,
                            unique: false,
                            rules: null,
                            id: '1446471743',
                            aspects: [
                                'aggression',
                                'villainy'
                            ],
                            traits: [
                                'force'
                            ],
                            keywords: [],
                            types: [
                                'event'
                            ],
                            setId: {
                                set: 'SOR',
                                number: 139
                            },
                            internalName: 'force-choke'
                        }
                    },
                    {
                        count: 1,
                        card: {
                            title: 'Recruit',
                            subtitle: null,
                            cost: 1,
                            hp: null,
                            power: null,
                            text: 'Search the top 5 cards of your deck for a unit, reveal it, and draw it. (Put the other cards on the bottom of your deck in a random order.)',
                            deployBox: null,
                            epicAction: null,
                            unique: false,
                            rules: 'After searching, put any cards not chosen on the bottom of your deck in a random order.\n',
                            id: '3407775126',
                            aspects: [
                                'command'
                            ],
                            traits: [
                                'supply'
                            ],
                            keywords: [],
                            types: [
                                'event'
                            ],
                            setId: {
                                set: 'SOR',
                                number: 123
                            },
                            internalName: 'recruit'
                        }
                    },
                    {
                        count: 3,
                        card: {
                            title: 'Vader\'s Lightsaber',
                            subtitle: null,
                            cost: 2,
                            hp: 1,
                            power: 3,
                            text: 'Attach to a non-Vehicle unit.\n\nWhen Played: If attached unit is Darth Vader, you may deal 4 damage to a ground unit. ',
                            deployBox: null,
                            epicAction: null,
                            unique: true,
                            rules: null,
                            id: '0705773109',
                            aspects: [
                                'aggression',
                                'villainy'
                            ],
                            traits: [
                                'item',
                                'weapon',
                                'lightsaber'
                            ],
                            keywords: [],
                            types: [
                                'upgrade'
                            ],
                            setId: {
                                set: 'SOR',
                                number: 136
                            },
                            internalName: 'vaders-lightsaber'
                        }
                    },
                    {
                        count: 1,
                        card: {
                            title: 'Relentless',
                            subtitle: 'Konstantine\'s Folly',
                            cost: 9,
                            hp: 8,
                            power: 8,
                            text: 'The first event played by each opponent each round loses all abilities.',
                            deployBox: null,
                            epicAction: null,
                            unique: true,
                            rules: null,
                            id: '3401690666',
                            aspects: [
                                'villainy',
                                'command'
                            ],
                            traits: [
                                'imperial',
                                'vehicle',
                                'capital ship'
                            ],
                            arena: 'space',
                            keywords: [],
                            types: [
                                'unit'
                            ],
                            setId: {
                                set: 'SOR',
                                number: 89
                            },
                            internalName: 'relentless#konstantines-folly'
                        }
                    },
                    {
                        count: 1,
                        card: {
                            title: 'Blizzard Assault AT-AT',
                            subtitle: null,
                            cost: 8,
                            hp: 9,
                            power: 9,
                            text: 'When this unit attacks and defeats a unit: You may deal the excess damage from this attack to an enemy ground unit.',
                            deployBox: null,
                            epicAction: null,
                            unique: false,
                            rules: 'A unit “attacks and defeats a unit” if it defeats the defender at any point during the attack.\nIf Blizzard Assault AT-AT is given Overwhelm, all excess damage is applied to the defending player\'s base, and there is no excess damage that can be dealt by the triggered ability.\n',
                            id: '3830969722',
                            aspects: [
                                'command',
                                'villainy'
                            ],
                            traits: [
                                'imperial',
                                'vehicle',
                                'walker'
                            ],
                            arena: 'ground',
                            keywords: [],
                            types: [
                                'unit'
                            ],
                            setId: {
                                set: 'SOR',
                                number: 88
                            },
                            internalName: 'blizzard-assault-atat'
                        }
                    },
                    {
                        count: 1,
                        card: {
                            title: 'Emperor Palpatine',
                            subtitle: 'Master of the Dark Side',
                            cost: 8,
                            hp: 6,
                            power: 6,
                            text: 'Overwhelm (When attacking an enemy unit, deal excess damage to the opponent\'s base.)\n\nWhen Played: Deal 6 damage divided as you choose among enemy units.',
                            deployBox: null,
                            epicAction: null,
                            unique: true,
                            rules: 'You can choose to assign more damage to a unit than it has remaining HP.\nAll damage dealt by a single ability is dealt simultaneously.\nShields prevent all damage from a unit with Overwhelm. There is no excess damage since the defender is not defeated.\nIf the defender is defeated during an attack before combat damage is dealt, all combat damage is considered excess damage for Overwhelm.\n',
                            id: '9097316363',
                            aspects: [
                                'aggression',
                                'villainy'
                            ],
                            traits: [
                                'force',
                                'imperial',
                                'sith',
                                'official'
                            ],
                            arena: 'ground',
                            keywords: [
                                'overwhelm'
                            ],
                            types: [
                                'unit'
                            ],
                            setId: {
                                set: 'SOR',
                                number: 135
                            },
                            internalName: 'emperor-palpatine#master-of-the-dark-side'
                        }
                    },
                    {
                        count: 1,
                        card: {
                            title: 'Gladiator Star Destroyer',
                            subtitle: null,
                            cost: 6,
                            hp: 6,
                            power: 5,
                            text: 'When Played: Give a unit Sentinel for this phase. (Units in this arena can\'t attack your non-Sentinel units or your base.)',
                            deployBox: null,
                            epicAction: null,
                            unique: false,
                            rules: null,
                            id: '8294130780',
                            aspects: [
                                'command',
                                'villainy'
                            ],
                            traits: [
                                'imperial',
                                'vehicle',
                                'capital ship'
                            ],
                            arena: 'space',
                            keywords: [
                                'sentinel'
                            ],
                            types: [
                                'unit'
                            ],
                            setId: {
                                set: 'SOR',
                                number: 86
                            },
                            internalName: 'gladiator-star-destroyer'
                        }
                    },
                    {
                        count: 1,
                        card: {
                            title: 'TIE Advanced',
                            subtitle: null,
                            cost: 4,
                            hp: 2,
                            power: 3,
                            text: 'When Played: Give 2 Experience tokens to another friendly IMPERIAL unit.',
                            deployBox: null,
                            epicAction: null,
                            unique: false,
                            rules: null,
                            id: '4092697474',
                            aspects: [
                                'villainy'
                            ],
                            traits: [
                                'imperial',
                                'vehicle',
                                'fighter'
                            ],
                            arena: 'space',
                            keywords: [],
                            types: [
                                'unit'
                            ],
                            setId: {
                                set: 'SOR',
                                number: 231
                            },
                            internalName: 'tie-advanced'
                        }
                    },
                    {
                        count: 3,
                        card: {
                            title: 'Imperial Interceptor',
                            subtitle: null,
                            cost: 4,
                            hp: 2,
                            power: 3,
                            text: 'When Played: You may deal 3 damage to a space unit.',
                            deployBox: null,
                            epicAction: null,
                            unique: false,
                            rules: null,
                            id: '9002021213',
                            aspects: [
                                'aggression',
                                'villainy'
                            ],
                            traits: [
                                'imperial',
                                'vehicle',
                                'fighter'
                            ],
                            arena: 'space',
                            keywords: [],
                            types: [
                                'unit'
                            ],
                            setId: {
                                set: 'SOR',
                                number: 132
                            },
                            internalName: 'imperial-interceptor'
                        }
                    },
                    {
                        count: 3,
                        card: {
                            title: 'Grand Moff Tarkin',
                            subtitle: 'Death Star Overseer',
                            cost: 4,
                            hp: 3,
                            power: 2,
                            text: 'When Played: Search the top 5 cards of your deck for up to 2 Imperial cards, reveal them, and draw them. (Put the other cards on the bottom of your deck in a random order.)',
                            deployBox: null,
                            epicAction: null,
                            unique: true,
                            rules: 'After searching, put any cards not chosen on the bottom of your deck in a random order.\n',
                            id: '9266336818',
                            aspects: [
                                'command',
                                'villainy'
                            ],
                            traits: [
                                'imperial',
                                'official'
                            ],
                            arena: 'ground',
                            keywords: [],
                            types: [
                                'unit'
                            ],
                            setId: {
                                set: 'SOR',
                                number: 84
                            },
                            internalName: 'grand-moff-tarkin#death-star-overseer'
                        }
                    },
                    {
                        count: 1,
                        card: {
                            title: 'General Veers',
                            subtitle: 'Blizzard Force Commander',
                            cost: 3,
                            hp: 3,
                            power: 3,
                            text: 'Other friendly Imperial units get +1/+1.',
                            deployBox: null,
                            epicAction: null,
                            unique: true,
                            rules: null,
                            id: '1557302740',
                            aspects: [
                                'villainy'
                            ],
                            traits: [
                                'imperial',
                                'official'
                            ],
                            arena: 'ground',
                            keywords: [],
                            types: [
                                'unit'
                            ],
                            setId: {
                                set: 'SOR',
                                number: 230
                            },
                            internalName: 'general-veers#blizzard-force-commander'
                        }
                    },
                    {
                        count: 3,
                        card: {
                            title: 'Cell Block Guard',
                            subtitle: null,
                            cost: 3,
                            hp: 3,
                            power: 3,
                            text: 'Sentinel (Units in this arena can\'t attack your non-Sentinel units or your base.)',
                            deployBox: null,
                            epicAction: null,
                            unique: false,
                            rules: null,
                            id: '2524528997',
                            aspects: [
                                'villainy'
                            ],
                            traits: [
                                'imperial',
                                'trooper'
                            ],
                            arena: 'ground',
                            keywords: [
                                'sentinel'
                            ],
                            types: [
                                'unit'
                            ],
                            setId: {
                                set: 'SOR',
                                number: 229
                            },
                            internalName: 'cell-block-guard'
                        }
                    },
                    {
                        count: 3,
                        card: {
                            title: 'Superlaser Technician',
                            subtitle: null,
                            cost: 3,
                            hp: 1,
                            power: 2,
                            text: 'When Defeated: You may put this unit into play as a resource and ready it.',
                            deployBox: null,
                            epicAction: null,
                            unique: false,
                            rules: null,
                            id: '8954587682',
                            aspects: [
                                'command',
                                'villainy'
                            ],
                            traits: [
                                'imperial'
                            ],
                            arena: 'ground',
                            keywords: [],
                            types: [
                                'unit'
                            ],
                            setId: {
                                set: 'SOR',
                                number: 83
                            },
                            internalName: 'superlaser-technician'
                        }
                    },
                    {
                        count: 1,
                        card: {
                            title: 'Admiral Piett',
                            subtitle: 'Captain of the Executor',
                            cost: 2,
                            hp: 4,
                            power: 1,
                            text: 'Each friendly non-leader unit that costs 6 or more gains Ambush. (After you play that unit, it may ready and attack an enemy unit.)',
                            deployBox: null,
                            epicAction: null,
                            unique: true,
                            rules: 'Abilities that refer to a card’s cost always refer to its printed cost, regardless of modifiers.\nAmbush is an ability that triggers at the same time as “When Played” abilities. If there is no enemy unit that can be attacked, the unit does not ready.\n',
                            id: '4566580942',
                            aspects: [
                                'command',
                                'villainy'
                            ],
                            traits: [
                                'imperial',
                                'official'
                            ],
                            arena: 'ground',
                            keywords: [
                                'ambush'
                            ],
                            types: [
                                'unit'
                            ],
                            setId: {
                                set: 'SOR',
                                number: 79
                            },
                            internalName: 'admiral-piett#captain-of-the-executor'
                        }
                    },
                    {
                        count: 2,
                        card: {
                            title: 'Viper Probe Droid',
                            subtitle: null,
                            cost: 2,
                            hp: 2,
                            power: 3,
                            text: 'When Played: Look at an opponent\'s hand.',
                            deployBox: null,
                            epicAction: null,
                            unique: false,
                            rules: null,
                            id: '8986035098',
                            aspects: [
                                'villainy'
                            ],
                            traits: [
                                'imperial',
                                'droid'
                            ],
                            arena: 'ground',
                            keywords: [],
                            types: [
                                'unit'
                            ],
                            setId: {
                                set: 'SOR',
                                number: 228
                            },
                            internalName: 'viper-probe-droid'
                        }
                    },
                    {
                        count: 2,
                        card: {
                            title: 'Snowtrooper Lieutenant',
                            subtitle: null,
                            cost: 2,
                            hp: 2,
                            power: 2,
                            text: 'When Played: You may attack with a unit. If it\'s an Imperial unit, it gets +2/+0 for this attack.',
                            deployBox: null,
                            epicAction: null,
                            unique: false,
                            rules: 'Units must be ready in order to attack.\n',
                            id: '9097690846',
                            aspects: [
                                'villainy'
                            ],
                            traits: [
                                'imperial',
                                'trooper'
                            ],
                            arena: 'ground',
                            keywords: [],
                            types: [
                                'unit'
                            ],
                            setId: {
                                set: 'SOR',
                                number: 227
                            },
                            internalName: 'snowtrooper-lieutenant'
                        }
                    },
                    {
                        count: 3,
                        card: {
                            title: 'Admiral Motti',
                            subtitle: 'Brazen and Scornful',
                            cost: 2,
                            hp: 1,
                            power: 1,
                            text: 'When Defeated: You may ready a [Villainy] unit.',
                            deployBox: null,
                            epicAction: null,
                            unique: true,
                            rules: null,
                            id: '9996676854',
                            aspects: [
                                'villainy'
                            ],
                            traits: [
                                'imperial',
                                'official'
                            ],
                            arena: 'ground',
                            keywords: [],
                            types: [
                                'unit'
                            ],
                            setId: {
                                set: 'SOR',
                                number: 226
                            },
                            internalName: 'admiral-motti#brazen-and-scornful'
                        }
                    },
                    {
                        count: 1,
                        card: {
                            title: 'Admiral Ozzel',
                            subtitle: 'Overconfident',
                            cost: 2,
                            hp: 3,
                            power: 2,
                            text: 'Action [exhaust]: Play an Imperial unit from your hand (paying its cost). It enters play ready. Each opponent may ready a unit.',
                            deployBox: null,
                            epicAction: null,
                            unique: true,
                            rules: 'Abilities that let you play a card require you to pay that card’s cost unless specified otherwise.\nOpponents choose and ready their units before resolving any “When Played” abilities or other abilities that trigger when you play your unit.\n',
                            id: '8117080217',
                            aspects: [
                                'aggression',
                                'villainy'
                            ],
                            traits: [
                                'imperial',
                                'official'
                            ],
                            arena: 'ground',
                            keywords: [],
                            types: [
                                'unit'
                            ],
                            setId: {
                                set: 'SOR',
                                number: 129
                            },
                            internalName: 'admiral-ozzel#overconfident'
                        }
                    },
                    {
                        count: 2,
                        card: {
                            title: 'First Legion Snowtrooper',
                            subtitle: null,
                            cost: 2,
                            hp: 3,
                            power: 2,
                            text: 'While attacking a damaged unit, this unit gets +2/+0 and gains Overwhelm. (Deal excess damage to the opponent\'s base.)',
                            deployBox: null,
                            epicAction: null,
                            unique: false,
                            rules: 'Shields prevent all damage from a unit with Overwhelm. There is no excess damage since the defender is not defeated.\nIf the defender is defeated during an attack before combat damage is dealt, all combat damage is considered excess damage for Overwhelm.\n',
                            id: '4619930426',
                            aspects: [
                                'aggression',
                                'villainy'
                            ],
                            traits: [
                                'imperial',
                                'trooper'
                            ],
                            arena: 'ground',
                            keywords: [
                                'overwhelm'
                            ],
                            types: [
                                'unit'
                            ],
                            setId: {
                                set: 'SOR',
                                number: 130
                            },
                            internalName: 'first-legion-snowtrooper'
                        }
                    },
                    {
                        count: 3,
                        card: {
                            title: 'Death Star Stormtrooper',
                            subtitle: null,
                            cost: 1,
                            hp: 1,
                            power: 3,
                            text: null,
                            deployBox: null,
                            epicAction: null,
                            unique: false,
                            rules: null,
                            id: '2383321298',
                            aspects: [
                                'villainy',
                                'aggression'
                            ],
                            traits: [
                                'imperial',
                                'trooper'
                            ],
                            arena: 'ground',
                            keywords: [],
                            types: [
                                'unit'
                            ],
                            setId: {
                                set: 'SOR',
                                number: 128
                            },
                            internalName: 'death-star-stormtrooper'
                        }
                    },
                    {
                        count: 2,
                        card: {
                            title: 'TIE/ln Fighter',
                            subtitle: null,
                            cost: 1,
                            hp: 1,
                            power: 2,
                            text: null,
                            deployBox: null,
                            epicAction: null,
                            unique: false,
                            rules: null,
                            id: '5562575456',
                            aspects: [
                                'villainy'
                            ],
                            traits: [
                                'imperial',
                                'vehicle',
                                'fighter'
                            ],
                            arena: 'space',
                            keywords: [],
                            types: [
                                'unit'
                            ],
                            setId: {
                                set: 'SOR',
                                number: 225
                            },
                            internalName: 'tieln-fighter'
                        }
                    }
                ]
            }
        },
        {
            user: {
                username: 'ThisIsTheWay',
                settings: {
                    optionSettings: {
                        markCardsUnselectable: true,
                        cancelOwnAbilities: false,
                        orderForcedAbilities: false,
                        confirmOneClick: false,
                        disableCardStats: false,
                        showStatusInSidebar: false,
                        sortHandByName: false
                    }
                }
            },
            id: 'th3w4y',
            deck: {
                leader: [
                    {
                        count: 1,
                        card: {
                            title: 'Luke Skywalker',
                            subtitle: 'Faithful Friend',
                            cost: 6,
                            hp: 7,
                            power: 4,
                            text: 'Action [1 resource, exhaust]: Give a Shield token to a [Heroism] unit you played this phase. ',
                            deployBox: 'On Attack: You may give another unit a Shield token. ',
                            epicAction: 'Epic Action: If you control 6 or more resources, deploy this leader. (Flip him, ready him, and move him to the ground arena.)',
                            unique: true,
                            rules: null,
                            id: '2579145458',
                            aspects: ['vigilance', 'heroism'],
                            traits: ['force', 'rebel'],
                            arena: 'ground',
                            keywords: [],
                            types: ['leader'],
                            internalName: 'luke-skywalker#faithful-friend'
                        }
                    }
                ],
                base: [
                    {
                        count: 1,
                        card: {
                            title: 'Administrator’s Tower',
                            subtitle: null,
                            cost: null,
                            hp: 30,
                            power: null,
                            text: null,
                            deployBox: null,
                            epicAction: null,
                            unique: false,
                            rules: null,
                            id: '8129465864',
                            aspects: ['cunning'],
                            traits: [],
                            keywords: [],
                            types: ['base'],
                            internalName: 'administrators-tower'
                        }
                    }
                ],
                deckCards: [
                    {
                        count: 3,
                        card: {
                            title: 'Vanquish',
                            subtitle: null,
                            cost: 5,
                            hp: null,
                            power: null,
                            text: 'Defeat a non-leader unit.',
                            deployBox: null,
                            epicAction: null,
                            unique: false,
                            rules: null,
                            id: '6472095064',
                            aspects: [
                                'vigilance'
                            ],
                            traits: [
                                'tactic'
                            ],
                            keywords: [],
                            types: [
                                'event'
                            ],
                            setId: {
                                set: 'SOR',
                                number: 78
                            },
                            internalName: 'vanquish'
                        }
                    },
                    {
                        count: 2,
                        card: {
                            title: 'Waylay',
                            subtitle: null,
                            cost: 3,
                            hp: null,
                            power: null,
                            text: 'Return a non-leader unit to its owner\'s hand.',
                            deployBox: null,
                            epicAction: null,
                            unique: false,
                            rules: 'Abilities that return a card to hand must choose a card in play unless otherwise specified.\n',
                            id: '7202133736',
                            aspects: [
                                'cunning'
                            ],
                            traits: [
                                'trick'
                            ],
                            keywords: [],
                            types: [
                                'event'
                            ],
                            setId: {
                                set: 'SOR',
                                number: 222
                            },
                            internalName: 'waylay'
                        }
                    },
                    {
                        count: 2,
                        card: {
                            title: 'Surprise Strike',
                            subtitle: null,
                            cost: 2,
                            hp: null,
                            power: null,
                            text: 'Attack with a unit. It gets +3/+0 for this attack.',
                            deployBox: null,
                            epicAction: null,
                            unique: false,
                            rules: 'You must attack with a unit, if able. Units must be ready in order to attack.\n',
                            id: '3809048641',
                            aspects: [
                                'cunning'
                            ],
                            traits: [
                                'tactic'
                            ],
                            keywords: [],
                            types: [
                                'event'
                            ],
                            setId: {
                                set: 'SOR',
                                number: 220
                            },
                            internalName: 'surprise-strike'
                        }
                    },
                    {
                        count: 2,
                        card: {
                            title: 'Asteroid Sanctuary',
                            subtitle: null,
                            cost: 2,
                            hp: null,
                            power: null,
                            text: 'Exhaust an enemy unit.\n\nGive a Shield token to a friendly unit that costs 3 or less.',
                            deployBox: null,
                            epicAction: null,
                            unique: false,
                            rules: 'Abilities that refer to a card’s cost always refer to its printed cost, regardless of modifiers.\n',
                            id: '6901817734',
                            aspects: [
                                'cunning'
                            ],
                            traits: [
                                'trick'
                            ],
                            keywords: [],
                            types: [
                                'event'
                            ],
                            setId: {
                                set: 'SOR',
                                number: 218
                            },
                            internalName: 'asteroid-sanctuary'
                        }
                    },
                    {
                        count: 2,
                        card: {
                            title: 'Repair',
                            subtitle: null,
                            cost: 1,
                            hp: null,
                            power: null,
                            text: 'Heal 3 damage from a unit or base.',
                            deployBox: null,
                            epicAction: null,
                            unique: false,
                            rules: null,
                            id: '8679831560',
                            aspects: [
                                'vigilance'
                            ],
                            traits: [
                                'supply'
                            ],
                            keywords: [],
                            types: [
                                'event'
                            ],
                            setId: {
                                set: 'SOR',
                                number: 74
                            },
                            internalName: 'repair'
                        }
                    },
                    {
                        count: 1,
                        card: {
                            title: 'Shoot First',
                            subtitle: null,
                            cost: 1,
                            hp: null,
                            power: null,
                            text: 'Attack with a unit. It gets +1/+0 for this attack and deals its combat damage before the defender. (If the defender is defeated, it deals no combat damage.)',
                            deployBox: null,
                            epicAction: null,
                            unique: false,
                            rules: 'You must attack with a unit, if able. Units must be ready in order to attack.\n“Combat damage” is only the damage dealt during the “deal combat damage” step of an attack.\nIf the defender is defeated by the attacked, it does not deal combat damage back. If it survives and has Grit, it deals bonus damage from Grit when dealing combat damage back.\n',
                            id: '8297630396',
                            aspects: [
                                'cunning'
                            ],
                            traits: [
                                'trick'
                            ],
                            keywords: [],
                            types: [
                                'event'
                            ],
                            setId: {
                                set: 'SOR',
                                number: 217
                            },
                            internalName: 'shoot-first'
                        }
                    },
                    {
                        count: 3,
                        card: {
                            title: 'Luke\'s Lightsaber',
                            subtitle: null,
                            cost: 2,
                            hp: 1,
                            power: 3,
                            text: 'Attach to a non-Vehicle unit.\n\nWhen Played: If attached unit is Luke Skywalker, heal all damage from him and give a Shield token to him.',
                            deployBox: null,
                            epicAction: null,
                            unique: true,
                            rules: null,
                            id: '6903722220',
                            aspects: [
                                'vigilance',
                                'heroism'
                            ],
                            traits: [
                                'item',
                                'weapon',
                                'lightsaber'
                            ],
                            keywords: [],
                            types: [
                                'upgrade'
                            ],
                            setId: {
                                set: 'SOR',
                                number: 53
                            },
                            internalName: 'lukes-lightsaber'
                        }
                    },
                    {
                        count: 1,
                        card: {
                            title: 'Resilient',
                            subtitle: null,
                            cost: 1,
                            hp: 3,
                            power: 0,
                            text: null,
                            deployBox: null,
                            epicAction: null,
                            unique: false,
                            rules: null,
                            id: '9059202647',
                            aspects: [
                                'vigilance'
                            ],
                            traits: [
                                'innate'
                            ],
                            keywords: [],
                            types: [
                                'upgrade'
                            ],
                            setId: {
                                set: 'SOR',
                                number: 69
                            },
                            internalName: 'resilient'
                        }
                    },
                    {
                        count: 1,
                        card: {
                            title: 'Han Solo',
                            subtitle: 'Reluctant Hero',
                            cost: 7,
                            hp: 6,
                            power: 6,
                            text: 'Ambush (After you play this unit, he may ready and attack an enemy unit.)\n\nWhile attacking, this unit deals combat damage before the defender.',
                            deployBox: null,
                            epicAction: null,
                            unique: true,
                            rules: '“Combat damage” is only the damage dealt during the “deal combat damage” step of an attack.\nAmbush is an ability that triggers at the same time as “When Played” abilities. If there is no enemy unit that can be attacked, the unit does not ready.\nIf the defender is defeated by Han Solo’s combat damage, it does not deal combat damage back. If it survives and has Grit, it deals bonus damage from Grit when dealing combat damage back.\n',
                            id: '9500514827',
                            aspects: [
                                'cunning',
                                'heroism'
                            ],
                            traits: [
                                'underworld'
                            ],
                            arena: 'ground',
                            keywords: [
                                'ambush'
                            ],
                            types: [
                                'unit'
                            ],
                            setId: {
                                set: 'SOR',
                                number: 198
                            },
                            internalName: 'han-solo#reluctant-hero'
                        }
                    },
                    {
                        count: 1,
                        card: {
                            title: 'Obi-Wan Kenobi',
                            subtitle: 'Following Fate',
                            cost: 6,
                            hp: 6,
                            power: 4,
                            text: 'Sentinel (Units in this arena can\'t attack your non-Sentinel units or your base.)\n\nWhen Defeated: Give 2 Experience tokens to another friendly unit. If it\'s a Force unit, draw a card.',
                            deployBox: null,
                            epicAction: null,
                            unique: true,
                            rules: null,
                            id: '4786320542',
                            aspects: [
                                'vigilance',
                                'heroism'
                            ],
                            traits: [
                                'force',
                                'jedi'
                            ],
                            arena: 'ground',
                            keywords: [
                                'sentinel'
                            ],
                            types: [
                                'unit'
                            ],
                            setId: {
                                set: 'SOR',
                                number: 49
                            },
                            internalName: 'obiwan-kenobi#following-fate'
                        }
                    },
                    {
                        count: 1,
                        card: {
                            title: 'Vigilant Honor Guards',
                            subtitle: null,
                            cost: 5,
                            hp: 6,
                            power: 4,
                            text: 'While this unit is undamaged, it gains Sentinel. (Units in this arena can\'t attack your non-Sentinel units or your base.)',
                            deployBox: null,
                            epicAction: null,
                            unique: false,
                            rules: null,
                            id: '7622279662',
                            aspects: [
                                'heroism',
                                'vigilance'
                            ],
                            traits: [
                                'rebel'
                            ],
                            arena: 'ground',
                            keywords: [
                                'sentinel'
                            ],
                            types: [
                                'unit'
                            ],
                            setId: {
                                set: 'SOR',
                                number: 48
                            },
                            internalName: 'vigilant-honor-guards'
                        }
                    },
                    {
                        count: 1,
                        card: {
                            title: 'Chewbacca',
                            subtitle: 'Loyal Companion',
                            cost: 5,
                            hp: 6,
                            power: 3,
                            text: 'Sentinel (Units in this arena can\'t attack your non-Sentinel units or your base.)\n\nWhen this unit is attacked: Ready him.',
                            deployBox: null,
                            epicAction: null,
                            unique: true,
                            rules: '“When this unit is attacked” triggers at the same time as “On Attack” abilities.\n',
                            id: '8918765832',
                            aspects: [
                                'cunning',
                                'heroism'
                            ],
                            traits: [
                                'underworld',
                                'wookiee'
                            ],
                            arena: 'ground',
                            keywords: [
                                'sentinel'
                            ],
                            types: [
                                'unit'
                            ],
                            setId: {
                                set: 'SOR',
                                number: 196
                            },
                            internalName: 'chewbacca#loyal-companion'
                        }
                    },
                    {
                        count: 1,
                        card: {
                            title: 'Snowspeeder',
                            subtitle: null,
                            cost: 5,
                            hp: 6,
                            power: 3,
                            text: 'Ambush (After you play this unit, it may ready and attack an enemy unit.)\n\nOn Attack: Exhaust an enemy Vehicle ground unit.',
                            deployBox: null,
                            epicAction: null,
                            unique: false,
                            rules: 'Ambush is an ability that triggers at the same time as “When Played” abilities. If there is no enemy unit that can be attacked, the unit does not ready.\n',
                            id: '1862616109',
                            aspects: [
                                'heroism'
                            ],
                            traits: [
                                'rebel',
                                'vehicle',
                                'speeder'
                            ],
                            arena: 'ground',
                            keywords: [
                                'ambush'
                            ],
                            types: [
                                'unit'
                            ],
                            setId: {
                                set: 'SOR',
                                number: 244
                            },
                            internalName: 'snowspeeder'
                        }
                    },
                    {
                        count: 1,
                        card: {
                            title: 'General Dodonna',
                            subtitle: 'Massassi Group Commander',
                            cost: 4,
                            hp: 4,
                            power: 4,
                            text: 'Other friendly Rebel units get +1/+1.',
                            deployBox: null,
                            epicAction: null,
                            unique: true,
                            rules: null,
                            id: '9799982630',
                            aspects: [
                                'heroism'
                            ],
                            traits: [
                                'rebel',
                                'official'
                            ],
                            arena: 'ground',
                            keywords: [],
                            types: [
                                'unit'
                            ],
                            setId: {
                                set: 'SOR',
                                number: 242
                            },
                            internalName: 'general-dodonna#massassi-group-commander'
                        }
                    },
                    {
                        count: 1,
                        card: {
                            title: 'Auzituck Liberator Gunship',
                            subtitle: null,
                            cost: 4,
                            hp: 4,
                            power: 3,
                            text: 'Ambush (After you play this unit, it may ready and attack an enemy unit.)',
                            deployBox: null,
                            epicAction: null,
                            unique: false,
                            rules: 'Ambush is an ability that triggers at the same time as “When Played” abilities. If there is no enemy unit that can be attacked, the unit does not ready.\n',
                            id: '7285270931',
                            aspects: [
                                'cunning',
                                'heroism'
                            ],
                            traits: [
                                'vehicle',
                                'fighter'
                            ],
                            arena: 'space',
                            keywords: [
                                'ambush'
                            ],
                            types: [
                                'unit'
                            ],
                            setId: {
                                set: 'SOR',
                                number: 195
                            },
                            internalName: 'auzituck-liberator-gunship'
                        }
                    },
                    {
                        count: 1,
                        card: {
                            title: 'System Patrol Craft',
                            subtitle: null,
                            cost: 4,
                            hp: 4,
                            power: 3,
                            text: 'Sentinel (Units in this arena can\'t attack your non-Sentinel units or your base.)',
                            deployBox: null,
                            epicAction: null,
                            unique: false,
                            rules: null,
                            id: '7751685516',
                            aspects: [
                                'vigilance'
                            ],
                            traits: [
                                'vehicle',
                                'fighter'
                            ],
                            arena: 'space',
                            keywords: [
                                'sentinel'
                            ],
                            types: [
                                'unit'
                            ],
                            setId: {
                                set: 'SOR',
                                number: 66
                            },
                            internalName: 'system-patrol-craft'
                        }
                    },
                    {
                        count: 1,
                        card: {
                            title: 'Cloud City Wing Guard',
                            subtitle: null,
                            cost: 3,
                            hp: 4,
                            power: 2,
                            text: 'Sentinel (Units in this arena can\'t attack your non-Sentinel units or your base.)',
                            deployBox: null,
                            epicAction: null,
                            unique: false,
                            rules: null,
                            id: '9702250295',
                            aspects: [
                                'vigilance'
                            ],
                            traits: [
                                'fringe',
                                'trooper'
                            ],
                            arena: 'ground',
                            keywords: [
                                'sentinel'
                            ],
                            types: [
                                'unit'
                            ],
                            setId: {
                                set: 'SOR',
                                number: 63
                            },
                            internalName: 'cloud-city-wing-guard'
                        }
                    },
                    {
                        count: 1,
                        card: {
                            title: 'Yoda',
                            subtitle: 'Old Master',
                            cost: 3,
                            hp: 4,
                            power: 2,
                            text: 'Restore 2 (When this unit attacks, heal 2 damage from your base.)\n\nWhen Defeated: Choose any number of players. They each draw a card.',
                            deployBox: null,
                            epicAction: null,
                            unique: true,
                            rules: null,
                            id: '4405415770',
                            aspects: [
                                'vigilance',
                                'heroism'
                            ],
                            traits: [
                                'force',
                                'jedi'
                            ],
                            arena: 'ground',
                            keywords: [
                                'restore'
                            ],
                            types: [
                                'unit'
                            ],
                            setId: {
                                set: 'SOR',
                                number: 45
                            },
                            internalName: 'yoda#old-master'
                        }
                    },
                    {
                        count: 1,
                        card: {
                            title: 'Wing Leader',
                            subtitle: null,
                            cost: 3,
                            hp: 1,
                            power: 2,
                            text: 'When Played: Give 2 Experience tokens to another friendly REBEL unit.',
                            deployBox: null,
                            epicAction: null,
                            unique: false,
                            rules: null,
                            id: '3443737404',
                            aspects: [
                                'heroism'
                            ],
                            traits: [
                                'rebel',
                                'vehicle',
                                'fighter'
                            ],
                            arena: 'space',
                            keywords: [],
                            types: [
                                'unit'
                            ],
                            setId: {
                                set: 'SOR',
                                number: 241
                            },
                            internalName: 'wing-leader'
                        }
                    },
                    {
                        count: 3,
                        card: {
                            title: 'Fleet Lieutenant',
                            subtitle: null,
                            cost: 3,
                            hp: 3,
                            power: 3,
                            text: 'When Played: You may attack with a unit. If it\'s a Rebel unit, it gets +2/+0 for this attack.',
                            deployBox: null,
                            epicAction: null,
                            unique: false,
                            rules: 'Units must be ready in order to attack.\n',
                            id: '3038238423',
                            aspects: [
                                'heroism'
                            ],
                            traits: [
                                'rebel',
                                'trooper'
                            ],
                            arena: 'ground',
                            keywords: [],
                            types: [
                                'unit'
                            ],
                            setId: {
                                set: 'SOR',
                                number: 240
                            },
                            internalName: 'fleet-lieutenant'
                        }
                    },
                    {
                        count: 1,
                        card: {
                            title: 'Rogue Operative',
                            subtitle: null,
                            cost: 3,
                            hp: 4,
                            power: 2,
                            text: 'Saboteur (When this unit attacks, ignore Sentinel and defeat the defender\'s Shields.)\n\nRaid 2 (This unit gets +2/+0 while attacking.)',
                            deployBox: null,
                            epicAction: null,
                            unique: false,
                            rules: null,
                            id: '1017822723',
                            aspects: [
                                'cunning',
                                'heroism'
                            ],
                            traits: [
                                'rebel',
                                'trooper'
                            ],
                            arena: 'ground',
                            keywords: [
                                'saboteur',
                                'raid'
                            ],
                            types: [
                                'unit'
                            ],
                            setId: {
                                set: 'SOR',
                                number: 194
                            },
                            internalName: 'rogue-operative'
                        }
                    },
                    {
                        count: 3,
                        card: {
                            title: 'Leia Organa',
                            subtitle: 'Defiant Princess',
                            cost: 2,
                            hp: 2,
                            power: 2,
                            text: 'When Played: Either ready a resource or exhaust a unit.',
                            deployBox: null,
                            epicAction: null,
                            unique: true,
                            rules: 'You may choose whether to ready a resource or exhaust a unit.\n',
                            id: '9680213078',
                            aspects: [
                                'cunning',
                                'heroism'
                            ],
                            traits: [
                                'rebel',
                                'official'
                            ],
                            arena: 'ground',
                            keywords: [],
                            types: [
                                'unit'
                            ],
                            setId: {
                                set: 'SOR',
                                number: 189
                            },
                            internalName: 'leia-organa#defiant-princess'
                        }
                    },
                    {
                        count: 2,
                        card: {
                            title: 'Restored ARC-170',
                            subtitle: null,
                            cost: 2,
                            hp: 3,
                            power: 2,
                            text: 'Restore 1 (When this unit attacks, heal 1 damage from your base.)',
                            deployBox: null,
                            epicAction: null,
                            unique: false,
                            rules: null,
                            id: '0074718689',
                            aspects: [
                                'vigilance',
                                'heroism'
                            ],
                            traits: [
                                'rebel',
                                'vehicle',
                                'fighter'
                            ],
                            arena: 'space',
                            keywords: [
                                'restore'
                            ],
                            types: [
                                'unit'
                            ],
                            setId: {
                                set: 'SOR',
                                number: 44
                            },
                            internalName: 'restored-arc170'
                        }
                    },
                    {
                        count: 3,
                        card: {
                            title: 'Alliance X-Wing',
                            subtitle: null,
                            cost: 2,
                            hp: 3,
                            power: 2,
                            text: null,
                            deployBox: null,
                            epicAction: null,
                            unique: false,
                            rules: null,
                            id: '0494601180',
                            aspects: [
                                'heroism'
                            ],
                            traits: [
                                'rebel',
                                'vehicle',
                                'fighter'
                            ],
                            arena: 'space',
                            keywords: [],
                            types: [
                                'unit'
                            ],
                            setId: {
                                set: 'SOR',
                                number: 237
                            },
                            internalName: 'alliance-xwing'
                        }
                    },
                    {
                        count: 1,
                        card: {
                            title: 'Rebel Pathfinder',
                            subtitle: null,
                            cost: 2,
                            hp: 3,
                            power: 2,
                            text: 'Saboteur (When this unit attacks, ignore Sentinel and defeat the defender\'s Shields.)',
                            deployBox: null,
                            epicAction: null,
                            unique: false,
                            rules: null,
                            id: '0046930738',
                            aspects: [
                                'heroism'
                            ],
                            traits: [
                                'rebel',
                                'trooper'
                            ],
                            arena: 'ground',
                            keywords: [
                                'saboteur'
                            ],
                            types: [
                                'unit'
                            ],
                            setId: {
                                set: 'SOR',
                                number: 239
                            },
                            internalName: 'rebel-pathfinder'
                        }
                    },
                    {
                        count: 3,
                        card: {
                            title: 'C-3PO',
                            subtitle: 'Protocol Droid',
                            cost: 2,
                            hp: 4,
                            power: 1,
                            text: 'When Played/On Attack: Choose a number, then look at the top card of your deck. If its cost is the chosen number, you may reveal and draw it. (Otherwise, leave it on top of your deck.)',
                            deployBox: null,
                            epicAction: null,
                            unique: true,
                            rules: null,
                            id: '8009713136',
                            aspects: [
                                'heroism'
                            ],
                            traits: [
                                'rebel',
                                'droid'
                            ],
                            arena: 'ground',
                            keywords: [],
                            types: [
                                'unit'
                            ],
                            setId: {
                                set: 'SOR',
                                number: 238
                            },
                            internalName: 'c3po#protocol-droid'
                        }
                    },
                    {
                        count: 3,
                        card: {
                            title: 'R2-D2',
                            subtitle: 'Ignoring Protocol',
                            cost: 1,
                            hp: 4,
                            power: 1,
                            text: 'When Played/On Attack: Look at the top card of your deck. You may put it on the bottom of your deck. (Otherwise, leave it on top of your deck.)',
                            deployBox: null,
                            epicAction: null,
                            unique: true,
                            rules: null,
                            id: '9568000754',
                            aspects: [
                                'heroism'
                            ],
                            traits: [
                                'rebel',
                                'droid'
                            ],
                            arena: 'ground',
                            keywords: [],
                            types: [
                                'unit'
                            ],
                            setId: {
                                set: 'SOR',
                                number: 236
                            },
                            internalName: 'r2d2#ignoring-protocol'
                        }
                    },
                    {
                        count: 1,
                        card: {
                            title: '2-1B Surgical Droid',
                            subtitle: null,
                            cost: 1,
                            hp: 3,
                            power: 1,
                            text: 'On Attack: You may heal 2 damage from another unit.',
                            deployBox: null,
                            epicAction: null,
                            unique: false,
                            rules: null,
                            id: '5449704164',
                            aspects: [
                                'vigilance'
                            ],
                            traits: [
                                'droid'
                            ],
                            arena: 'ground',
                            keywords: [],
                            types: [
                                'unit'
                            ],
                            setId: {
                                set: 'SOR',
                                number: 59
                            },
                            internalName: '21b-surgical-droid'
                        }
                    }
                ]
            }
        }
    ]
};

module.exports = defaultGameSettings;