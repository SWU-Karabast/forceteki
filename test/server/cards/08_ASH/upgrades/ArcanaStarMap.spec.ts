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

            it('should double the correct number of cards when searchCount is determined by a function (Bounty Hunter\'s Quarry)', async function () {
                // BHQ searches top 5 for non-unique targets and top 10 for unique targets.
                // With Arcana Star Map those become top 10 and top 20 respectively.
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: [{ card: 'wampa', upgrades: ['arcana-star-map#path-to-peridea'] }],
                        // 20-card deck — top 10 exposed for non-unique attack, all 20 exposed for unique attack
                        deck: [
                            'scout-bike-pursuer', 'waylay', 'battlefield-marine', 'devotion', 'echo-base-defender',     // 1-5
                            'resupply', 'pyke-sentinel', 'takedown', 'inferno-four#unforgetting', 'protector',          // 6-10
                            'isb-agent', 'rivals-fall', 'death-star-stormtrooper', 'daring-raid', 'vanguard-infantry',     // 11-15
                            'force-throw', 'tieln-fighter', 'repair', 'swoop-racer', 'bamboozle',                          // 16-20
                        ],
                        resources: 3,
                    },
                    player2: {
                        groundArena: [
                            // non-unique — bounty search normally shows top 5, doubled to top 10
                            { card: 'specforce-soldier', upgrades: ['bounty-hunters-quarry'] },
                            // unique — bounty search normally shows top 10, doubled to top 20
                            { card: 'benthic-two-tubes#partisan-lieutenant', upgrades: ['bounty-hunters-quarry'] },
                        ],
                    },
                });

                const { context } = contextRef;

                // Attack 1: kill the non-unique target — BHQ should search top 10 (doubled from 5)
                context.player1.clickCard(context.wampa);
                context.player1.clickCard(context.specforceSoldier);
                context.player1.clickPrompt('Trigger');

                // Cards 1-10 shown — confirms the search was doubled from 5 to 10
                expect(context.player1).toHaveExactDisplayPromptCards({
                    selectable: [context.scoutBikePursuer, context.battlefieldMarine, context.echoBaseDefender, context.pykeSentinel, context.infernoFour],
                    invalid: [context.waylay, context.devotion, context.resupply, context.takedown, context.protector],
                });
                context.player1.clickPrompt('Take nothing');

                // Attack 2: kill the unique target — BHQ should search top 20 (doubled from 10)
                context.readyCard(context.wampa);
                context.player2.passAction();

                context.player1.clickCard(context.wampa);
                context.player1.clickCard(context.benthicTwoTubes);
                context.player1.clickPrompt('Trigger');

                // All 20 deck cards shown — confirms the search was doubled from 10 to 20
                expect(context.player1).toHaveExactDisplayPromptCards({
                    selectable: [
                        context.scoutBikePursuer, context.battlefieldMarine, context.echoBaseDefender, context.pykeSentinel, context.infernoFour,
                        context.isbAgent, context.deathStarStormtrooper, context.vanguardInfantry, context.tielnFighter, context.swoopRacer,
                    ],
                    invalid: [
                        context.waylay, context.devotion, context.resupply, context.takedown, context.protector,
                        context.rivalsFall, context.daringRaid, context.forceThrow, context.repair, context.bamboozle,
                    ],
                });
                context.player1.clickPrompt('Take nothing');
            });

            it('should not double entire-deck searches', async function () {
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

            it('should not double entire-deck searches of the opponent\'s deck (Annihilator)', async function() {
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

            it('should double the search count for effects that deploy units from the deck (Darth Vader)', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: [{ card: 'wampa', upgrades: ['arcana-star-map#path-to-peridea'] }],
                        hand: ['darth-vader#commanding-the-first-legion'],
                        deck: [
                            'battlefield-marine',           // 1  — Rebel unit (not Imperial → invalid)
                            'vanguard-infantry',            // 2  — Rebel unit (not Imperial → invalid)
                            'scout-bike-pursuer',           // 3  — Imperial unit, cost 1 ✓
                            'hunting-nexu',                 // 4  — non-Imperial unit → invalid
                            'tieln-fighter',                // 5  — Imperial unit, cost 1 ✓
                            'daring-raid',                  // 6  — event → invalid
                            'protector',                    // 7  — non-unit → invalid
                            'isb-agent',                    // 8  — Imperial unit, cost 2 ✓
                            'death-star-stormtrooper',      // 9  — Imperial unit, cost 1 ✓
                            'superlaser-technician',        // 10 — Imperial unit, cost 2 ✓
                            'atst',                         // 11 — Imperial unit but cost 6 → invalid (cost cap enforced)
                            'awing',                        // 12 — Rebel unit → invalid
                            'yoda#old-master',              // 13 — non-Imperial → invalid
                            'gungi#finding-himself',        // 14 — non-Imperial → invalid
                            'takedown',                     // 15 — event → invalid
                            'rivals-fall',                  // 16 — event → invalid
                            'avenger#hunting-star-destroyer', // 17 — Imperial ship but cost 8 → invalid (cost cap enforced)
                            'tie-striker',                  // 18 — Imperial unit, cost 3 ✓
                            'peridea-bandit',               // 19 — Imperial unit, cost 1 ✓
                            'mouse-droid',                  // 20 — Imperial unit, cost 1 ✓
                            'lothwolf'                      // 21 — beyond top 20, not shown
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

            it('should double multi-select ship searches (Prepare for Takeoff)', async function () {
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
                        context.battlefieldMarine, context.yoda, context.scoutBikePursuer,
                        context.gungi
                    ]
                });

                context.player1.clickCardInDisplayCardPrompt(context.raddus);
                context.player1.clickCardInDisplayCardPrompt(context.avenger);
                context.player1.clickDone();

                expect(context.player2).toHaveExactViewableDisplayPromptCards([context.avenger, context.raddus]);
                context.player2.clickDone();

                expect(context.player2).toBeActivePlayer();
                expect(context.raddus).toBeInZone('hand');
                expect(context.avenger).toBeInZone('hand');

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
