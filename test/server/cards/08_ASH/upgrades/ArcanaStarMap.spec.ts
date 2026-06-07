describe('Arcana Star Map', function () {
    integration(function (contextRef) {
        describe('Arcana Star Map\'s ability', function () {
            it('should cause the attached unit\'s controller to search twice as many cards from the top of the deck', async function () {
                // Recruit normally searches top 5; with Arcana Star Map it should search top 10
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['arcana-star-map#path-to-peridea', 'recruit'],
                        groundArena: ['battlefield-marine'],
                        // top 5: wampa(unit), waylay(event), atst(unit), devotion(upgrade), resupply(event)
                        // cards 6-10: green-squadron-awing(unit), pyke-sentinel(unit), restored-arc170(unit), echo-base-defender(unit), escort-skiff(unit)
                        deck: [
                            'wampa', 'waylay', 'atst', 'devotion', 'resupply',
                            'green-squadron-awing', 'pyke-sentinel', 'restored-arc170', 'echo-base-defender', 'escort-skiff'
                        ],
                    },
                });

                const { context } = contextRef;

                context.player1.clickCard(context.arcanaStarMap);
                context.player1.clickCard(context.battlefieldMarine);

                context.player2.passAction();

                context.player1.clickCard(context.recruit);

                // Top 10 cards are shown: units selectable, non-units invalid
                expect(context.player1).toHavePrompt('Select a card');
                expect(context.player1).toHaveExactDisplayPromptCards({
                    selectable: [context.wampa, context.atst, context.greenSquadronAwing, context.pykeSentinel, context.restoredArc170, context.echoBaseDefender, context.escortSkiff],
                    invalid: [context.waylay, context.devotion, context.resupply]
                });
                context.player1.clickPrompt('Take nothing');
            });

            it('should not double opponent\'s searches', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['arcana-star-map#path-to-peridea'],
                        groundArena: ['battlefield-marine'],
                    },
                    player2: {
                        hand: ['recruit'],
                        deck: [
                            'wampa', 'waylay', 'atst', 'devotion', 'resupply',
                            'green-squadron-awing', 'pyke-sentinel', 'restored-arc170', 'echo-base-defender', 'escort-skiff'
                        ],
                    },
                });

                const { context } = contextRef;

                context.player1.clickCard(context.arcanaStarMap);
                context.player1.clickCard(context.battlefieldMarine);

                // Player 2 uses Recruit — should still only see top 5 cards
                context.player2.clickCard(context.recruit);

                expect(context.player2).toHavePrompt('Select a card');
                expect(context.player2).toHaveExactDisplayPromptCards({
                    selectable: [context.wampa, context.atst],
                    invalid: [context.waylay, context.devotion, context.resupply]
                });
                context.player2.clickPrompt('Take nothing');
            });

            it('should double the enemy controller\'s search when attached to their unit', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['arcana-star-map#path-to-peridea'],
                    },
                    player2: {
                        hand: ['recruit'],
                        groundArena: ['battlefield-marine'],
                        deck: [
                            'wampa', 'waylay', 'atst', 'devotion', 'resupply',
                            'green-squadron-awing', 'pyke-sentinel', 'restored-arc170', 'echo-base-defender', 'escort-skiff'
                        ],
                    },
                });

                const { context } = contextRef;

                // Player 1 attaches Arcana Star Map to player 2's battlefield-marine
                context.player1.clickCard(context.arcanaStarMap);
                context.player1.clickCard(context.battlefieldMarine);

                // Player 2 now uses Recruit — should see top 10 because their unit has the upgrade
                context.player2.clickCard(context.recruit);

                expect(context.player2).toHavePrompt('Select a card');
                expect(context.player2).toHaveExactDisplayPromptCards({
                    selectable: [context.wampa, context.atst, context.greenSquadronAwing, context.pykeSentinel, context.restoredArc170, context.echoBaseDefender, context.escortSkiff],
                    invalid: [context.waylay, context.devotion, context.resupply]
                });
                context.player2.clickPrompt('Take nothing');
            });

            it('should follow the attached unit if stolen via Change of Heart', async function () {
                // Both players have 'recruit' so they can't be accessed as context.recruit (ambiguous).
                // Use player.findCardByName('recruit') instead.
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['arcana-star-map#path-to-peridea', 'recruit'],
                        groundArena: ['battlefield-marine'],
                        deck: [
                            'wampa', 'waylay', 'atst', 'devotion', 'resupply',
                            'green-squadron-awing', 'pyke-sentinel', 'restored-arc170', 'echo-base-defender', 'escort-skiff'
                        ],
                    },
                    player2: {
                        hand: ['change-of-heart', 'recruit'],
                        deck: [
                            'wampa', 'waylay', 'atst', 'devotion', 'resupply',
                            'green-squadron-awing', 'pyke-sentinel', 'restored-arc170', 'echo-base-defender', 'escort-skiff'
                        ],
                    },
                });

                const { context } = contextRef;

                context.player1.clickCard(context.arcanaStarMap);
                context.player1.clickCard(context.battlefieldMarine);

                // Player 2 steals battlefield-marine (which has the upgrade)
                context.player2.clickCard(context.changeOfHeart);
                context.player2.clickCard(context.battlefieldMarine);

                // Player 1's search is no longer doubled — they lost control of the unit
                context.player1.clickCard(context.player1.findCardByName('recruit'));
                expect(context.player1).toHaveExactDisplayPromptCards({
                    selectable: [context.player1.findCardByName('wampa', 'deck'), context.player1.findCardByName('atst', 'deck')],
                    invalid: [context.player1.findCardByName('waylay', 'deck'), context.player1.findCardByName('devotion', 'deck'), context.player1.findCardByName('resupply', 'deck')]
                });
                context.player1.clickPrompt('Take nothing');

                // Player 2 now controls the unit with the upgrade — their search IS doubled
                context.player2.clickCard(context.player2.findCardByName('recruit'));
                expect(context.player2).toHaveExactDisplayPromptCards({
                    selectable: [
                        context.player2.findCardByName('wampa', 'deck'),
                        context.player2.findCardByName('atst', 'deck'),
                        context.player2.findCardByName('green-squadron-awing', 'deck'),
                        context.player2.findCardByName('pyke-sentinel', 'deck'),
                        context.player2.findCardByName('restored-arc170', 'deck'),
                        context.player2.findCardByName('echo-base-defender', 'deck'),
                        context.player2.findCardByName('escort-skiff', 'deck'),
                    ],
                    invalid: [
                        context.player2.findCardByName('waylay', 'deck'),
                        context.player2.findCardByName('devotion', 'deck'),
                        context.player2.findCardByName('resupply', 'deck'),
                    ]
                });
                context.player2.clickPrompt('Take nothing');
            });

            it('', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['search-your-feelings'],
                        groundArena: [{ card: 'battlefield-marine', upgrades: ['arcana-star-map#path-to-peridea'] }],
                        deck: ['wampa', 'atst', 'yoda#old-master']
                    },
                });

                const buildCardName = (card) => `${card.title}${card.subtitle ? ', ' + card.subtitle : ''}`;

                const { context } = contextRef;

                // TODO REFACTOR THIS WHEN ENABLING FULL DECK SEARCH

                context.player1.clickCard(context.searchYourFeelings);
                expect(context.player1).toHaveExactDropdownListOptions([context.wampa, context.atst, context.yoda].map((card) => buildCardName(card)));

                context.player1.chooseListOption('Wampa');

                expect(context.getChatLogs(3).join('\n')).not.toContain('Wampa');
                expect(context.player2).toBeActivePlayer();
                expect(context.searchYourFeelings).toBeInZone('discard');
                expect(context.wampa).toBeInZone('hand');
                expect(context.player1.deck.length).toBe(2);
            });

            it('', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['annihilator#tagges-flagship'],
                        groundArena: [{ card: 'battlefield-marine', upgrades: ['arcana-star-map#path-to-peridea'] }],
                    },
                    player2: {
                        groundArena: ['boba-fett#disintegrator', 'wampa'],
                        deck: ['boba-fett#disintegrator', 'boba-fett#feared-bounty-hunter', 'cartel-spacer', 'elite-p38-starfighter', 'crafty-smuggler']
                    }
                });

                const { context } = contextRef;

                const inPlayBoba = context.player2.findCardByName('boba-fett#disintegrator', 'groundArena');
                const inDeckBoba = context.player2.findCardByName('boba-fett#disintegrator', 'deck');
                const inDeckPilotBoba = context.player2.findCardByName('boba-fett#feared-bounty-hunter', 'deck');

                context.player1.clickCard(context.annihilator);
                context.player1.clickCard(inPlayBoba);
                expect(inPlayBoba).toBeInZone('discard');

                // Player sees the opponent's deck
                expect(context.player1).toHaveExactDisplayPromptCards({
                    selectable: [inDeckBoba, inDeckPilotBoba],
                    // invalid: [context.cartelSpacer]      // TODO: uncomment when we re-enable full deck search
                });

                context.player1.clickCardInDisplayCardPrompt(inDeckBoba);
                context.player1.clickCardInDisplayCardPrompt(inDeckPilotBoba);
                context.player1.clickDone();

                expect(context.player2).toBeActivePlayer();
                expect(inDeckBoba).toBeInZone('discard');
                expect(inDeckPilotBoba).toBeInZone('discard');
            });

            it('', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: [{ card: 'wampa', upgrades: ['arcana-star-map#path-to-peridea'] }],
                        hand: ['darth-vader#commanding-the-first-legion'],
                        deck: [
                            'battlefield-marine', // 1
                            'vanguard-infantry', // 2
                            'scout-bike-pursuer', // 3
                            'hunting-nexu', // 4
                            'tieln-fighter', // 5
                            'daring-raid', // 6
                            'protector', // 7
                            'isb-agent', // 8
                            'death-star-stormtrooper', // 9
                            'superlaser-technician', // 10
                            'atst', // 11
                            'awing', // 12
                            'yoda#old-master', // 13
                            'gungi#finding-himself', // 14
                            'takedown', // 15
                            'rivals-fall', // 16
                            'avenger#hunting-star-destroyer', // 17
                            'tie-striker', // 18
                            'peridea-bandit', // 19
                            'mouse-droid', // 20
                            'lothwolf'// 21
                        ],
                    }
                });
                const { context } = contextRef;

                context.player1.clickCard(context.darthVader);
                context.player1.clickPrompt('(No effect) Ambush');
                expect(context.player1).toHaveExactDisplayPromptCards({
                    selectable: [
                        context.scoutBikePursuer, context.tielnFighter, context.isbAgent, context.deathStarStormtrooper,
                        context.superlaserTechnician, context.tieStriker, context.perideaBandit, context.mouseDroid
                    ],
                    invalid: [
                        context.vanguardInfantry, context.huntingNexu, context.daringRaid, context.protector,
                        context.battlefieldMarine, context.atst, context.awing, context.yoda, context.takedown,
                        context.gungi, context.rivalsFall, context.avenger
                    ]
                });

                context.player1.clickCardInDisplayCardPrompt(context.perideaBandit);
                context.player1.clickCardInDisplayCardPrompt(context.mouseDroid);
                context.player1.clickDone();

                expect(context.player2).toBeActivePlayer();
                expect(context.perideaBandit).toBeInZone('groundArena');
                expect(context.mouseDroid).toBeInZone('groundArena');

                expect([
                    context.vanguardInfantry, context.huntingNexu, context.daringRaid, context.protector,
                    context.battlefieldMarine, context.atst, context.awing, context.yoda, context.takedown,
                    context.gungi, context.rivalsFall, context.avenger, context.scoutBikePursuer, context.tielnFighter,
                    context.isbAgent, context.deathStarStormtrooper, context.superlaserTechnician, context.tieStriker,
                ]).toAllBeInBottomOfDeck(context.player1, 18);
            });

            it('', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: [{ card: 'wampa', upgrades: ['arcana-star-map#path-to-peridea'] }],
                        hand: ['prepare-for-takeoff'],
                        deck: [
                            'battlefield-marine', // 1
                            'vanguard-infantry', // 2
                            'scout-bike-pursuer', // 3
                            'hunting-nexu', // 4
                            'tieln-fighter', // 5
                            'daring-raid', // 6
                            'protector', // 7
                            'isb-agent', // 8
                            'death-star-stormtrooper', // 9
                            'superlaser-technician', // 10
                            'atst', // 11
                            'awing', // 12
                            'yoda#old-master', // 13
                            'gungi#finding-himself', // 14
                            'raddus#holdos-final-command', // 15
                            'avenger#hunting-star-destroyer', // 16,
                            'mouse-droid'
                        ],
                    }
                });
                const { context } = contextRef;

                context.player1.clickCard(context.prepareForTakeoff);

                expect(context.player1).toHaveExactDisplayPromptCards({
                    selectable: [
                        context.tielnFighter, context.awing, context.atst, context.avenger, context.raddus
                    ],
                    invalid: [
                        context.isbAgent, context.deathStarStormtrooper, context.superlaserTechnician,
                        context.vanguardInfantry, context.huntingNexu, context.daringRaid, context.protector,
                        context.battlefieldMarine, context.yoda,
                        context.gungi
                    ]
                });

                context.player1.clickCardInDisplayCardPrompt(context.raddus);
                context.player1.clickCardInDisplayCardPrompt(context.avenger);
                context.player1.clickDone();

                expect(context.player2).toBeActivePlayer();
                expect(context.raddus).toBeInZone('groundArena');
                expect(context.avenger).toBeInZone('groundArena');

                expect([
                    context.isbAgent, context.deathStarStormtrooper, context.superlaserTechnician,
                    context.vanguardInfantry, context.huntingNexu, context.daringRaid, context.protector,
                    context.battlefieldMarine, context.yoda,
                    context.gungi, context.tielnFighter, context.awing, context.atst,
                ]).toAllBeInBottomOfDeck(context.player1, 14);
            });
        });
    });
});
