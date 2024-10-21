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
                            title: 'Kestro City',
                            subtitle: null,
                            cost: null,
                            hp: 30,
                            power: null,
                            text: null,
                            deployBox: null,
                            epicAction: null,
                            unique: false,
                            rules: null,
                            id: '0461841375',
                            aspects: ['aggression'],
                            traits: [],
                            keywords: [],
                            types: ['base'],
                            internalName: 'kestro-city'
                        }
                    }
                ],
                deckCards: [
                    {
                        count: 50,
                        card: {
                            title: 'Underworld Thug',
                            subtitle: null,
                            cost: 2,
                            hp: 3,
                            power: 2,
                            text: null,
                            deployBox: null,
                            epicAction: null,
                            unique: false,
                            rules: null,
                            id: '1598425314',
                            aspects: [],
                            traits: ['underworld'],
                            arena: 'ground',
                            keywords: [],
                            types: ['unit'],
                            internalName: 'underworld-thug'
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
                        count: 50,
                        card: {
                            title: 'Underworld Thug',
                            subtitle: null,
                            cost: 2,
                            hp: 3,
                            power: 2,
                            text: null,
                            deployBox: null,
                            epicAction: null,
                            unique: false,
                            rules: null,
                            id: '1598425314',
                            aspects: [],
                            traits: ['underworld'],
                            arena: 'ground',
                            keywords: [],
                            types: ['unit'],
                            internalName: 'underworld-thug'
                        }
                    }
                ]
            }
        }
    ]
};

module.exports = defaultGameSettings;