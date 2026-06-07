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
        });
    });
});
