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
                expect(context.getChatLogs(5)).toContain('player1 uses Battlefield Marine\'s gained ability from Arcana Star Map to search 10 cards instead');
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
                            'battlefield-marine',           // 1  — Heroism unit (not Villainy → invalid)
                            'vanguard-infantry',            // 2  — Heroism unit (not Villainy → invalid)
                            'scout-bike-pursuer',           // 3  — Villainy unit, cost 1 ✓
                            'hunting-nexu',                 // 4  — non-Villainy unit → invalid
                            'tieln-fighter',                // 5  — Villainy unit, cost 1 ✓
                            'daring-raid',                  // 6  — event → invalid
                            'protector',                    // 7  — non-unit → invalid
                            'isb-agent',                    // 8  — Villainy unit, cost 2 ✓
                            'death-star-stormtrooper',      // 9  — Villainy unit, cost 1 ✓
                            'superlaser-technician',        // 10 — Villainy unit, cost 2 ✓
                            'atst',                         // 11 — Villainy unit but cost 6 → invalid (cost cap enforced)
                            'awing',                        // 12 — Heroism unit → invalid
                            'yoda#old-master',              // 13 — non-Villainy → invalid
                            'gungi#finding-himself',        // 14 — non-Villainy → invalid
                            'takedown',                     // 15 — event → invalid
                            'rivals-fall',                  // 16 — event → invalid
                            'avenger#hunting-star-destroyer', // 17 — Villainy ship but cost 8 → invalid (cost cap enforced)
                            'tie-striker',                  // 18 — Villainy unit, cost 3 ✓
                            'peridea-bandit',               // 19 — Villainy unit, cost 1 ✓
                            'mouse-droid',                  // 20 — Villainy unit, cost 1 ✓
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

            it('should not double a When Defeated search — the Star Map is gone before the search resolves (Owen Lars)', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: [{ card: 'owen-lars#devoted-uncle', damage: 3, upgrades: ['arcana-star-map#path-to-peridea'] }],
                        // top 5: 1 Force unit (selectable) + 4 non-Force/non-unit cards (invalid)
                        // cards 6-10 should NOT appear — they would only show if the count were doubled
                        deck: [
                            'yoda#old-master',      // 1 — Force unit ✓
                            'wampa',                // 2 — non-Force unit → invalid
                            'resupply',             // 3 — event → invalid
                            'pyke-sentinel',        // 4 — non-Force unit → invalid
                            'devotion',             // 5 — upgrade → invalid
                            'scout-bike-pursuer',   // 6 — would appear if search were doubled; must stay hidden
                            'isb-agent',            // 7
                            'waylay',               // 8
                            'takedown',             // 9
                            'vanguard-infantry',    // 10
                        ],
                    },
                    player2: {
                        groundArena: ['battlefield-marine'],
                    },
                });

                const { context } = contextRef;

                context.player1.passAction();
                context.player2.clickCard(context.battlefieldMarine);
                context.player2.clickCard(context.owenLars);

                // Owen Lars's When Defeated triggers — should show only top 5, NOT top 10
                expect(context.player1).toHaveExactDisplayPromptCards({
                    selectable: [context.yoda],
                    invalid: [context.wampa, context.resupply, context.pykeSentinel, context.devotion],
                });
                context.player1.clickPrompt('Take nothing');
            });

            it('should double Improvised Identity\'s deck search and still grant the discarded unit\'s abilities to the attacker', async function() {
                // Improvised Identity normally searches the top 3 cards. With Arcana Star Map it should search top 6.
                // The discarded unit's abilities must still be granted to the attacker for the follow-up attack.
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: [{
                            card: 'wampa',
                            upgrades: ['improvised-identity', 'arcana-star-map#path-to-peridea']
                        }],
                        // Top 3 has no ground units; positions 4-6 include kage-elite (Raid 2 + Saboteur).
                        // Without doubling, II's search would yield no eligible unit.
                        deck: [
                            'cartel-spacer', 'takedown', 'resupply',
                            'kage-elite', 'devotion', 'jedi-sentinel'
                        ]
                    },
                    player2: {
                        groundArena: ['pyke-sentinel']
                    },
                });

                const { context } = contextRef;

                context.player1.clickCard(context.wampa);
                context.player1.clickPrompt('Search the top 3 cards of your deck for a ground unit and discard it. Then, you may attack with this unit. For this attack, this unit gains the discarded unit\'s abilities.');

                // ASM doubles the search: all 6 cards are shown.
                expect(context.player1).toHaveExactDisplayPromptCards({
                    selectable: [context.kageElite, context.jediSentinel],
                    invalid: [context.cartelSpacer, context.takedown, context.resupply, context.devotion]
                });

                // Discard Kage Elite (Raid 2 + Saboteur)
                context.player1.clickCardInDisplayCardPrompt(context.kageElite);
                expect(context.kageElite).toBeInZone('discard');

                // Follow-up attack prompt should name the discarded unit, proving II read its discard correctly.
                expect(context.player1).toHavePrompt('Attack with Wampa. It gains Kage Elite\'s abilities for this attack.');
                expect(context.player1).toBeAbleToSelectExactly([context.pykeSentinel, context.p2Base]); // Gains Saboteur, so can target base
                context.player1.clickCard(context.p2Base);

                // Wampa (4 power) + Raid 2 (from Kage Elite) = 6 damage to base
                expect(context.p2Base.damage).toBe(6);
            });
        });
    });
});
