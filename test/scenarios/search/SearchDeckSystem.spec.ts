describe('SearchDeckSystem regression suite', function () {
    integration(function (contextRef) {
        describe('basic top-N search', function () {
            it('shows the correct top-N cards, draws the selection, and sends the rest to the bottom (Recruit)', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['recruit'],
                        // top 5: wampa(unit), waylay(event), atst(unit), devotion(upgrade), resupply(event)
                        // beyond top 5: green-squadron-awing
                        deck: ['wampa', 'waylay', 'atst', 'devotion', 'resupply', 'green-squadron-awing'],
                    },
                });

                const { context } = contextRef;

                context.player1.clickCard(context.recruit);

                expect(context.player1).toHavePrompt('Select a card');
                expect(context.player1).toHaveExactDisplayPromptCards({
                    selectable: [context.wampa, context.atst],
                    invalid: [context.waylay, context.devotion, context.resupply],
                });

                context.player1.clickCardInDisplayCardPrompt(context.wampa);

                // Opponent acknowledges reveal
                expect(context.player2).toHaveExactViewableDisplayPromptCards([context.wampa]);
                context.player2.clickDone();

                expect(context.wampa).toBeInZone('hand', context.player1);
                expect(context.atst).toBeInBottomOfDeck(context.player1, 4);
                expect(context.waylay).toBeInBottomOfDeck(context.player1, 4);
                expect(context.devotion).toBeInBottomOfDeck(context.player1, 4);
                expect(context.resupply).toBeInBottomOfDeck(context.player1, 4);
            });
        });

        describe('multi-select search', function () {
            it('allows selecting up to N cards and draws them all (Grand Moff Tarkin)', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['grand-moff-tarkin#death-star-overseer'],
                        // top 5: 2 Imperial units, 1 non-Imperial unit, 1 non-unit, 1 non-unit
                        deck: ['death-star-stormtrooper', 'isb-agent', 'wampa', 'waylay', 'devotion', 'atst'],
                    },
                });

                const { context } = contextRef;

                context.player1.clickCard(context.grandMoffTarkin);

                expect(context.player1).toHavePrompt('Select up to 2 cards');
                expect(context.player1).toHaveExactDisplayPromptCards({
                    selectable: [context.deathStarStormtrooper, context.isbAgent],
                    invalid: [context.wampa, context.waylay, context.devotion],
                });

                context.player1.clickCardInDisplayCardPrompt(context.deathStarStormtrooper);
                context.player1.clickCardInDisplayCardPrompt(context.isbAgent);
                context.player1.clickDone();

                // Opponent sees both revealed cards
                expect(context.player2).toHaveExactViewableDisplayPromptCards([context.deathStarStormtrooper, context.isbAgent]);
                context.player2.clickDone();

                expect(context.deathStarStormtrooper).toBeInZone('hand', context.player1);
                expect(context.isbAgent).toBeInZone('hand', context.player1);
                expect(context.wampa).toBeInBottomOfDeck(context.player1, 3);
                expect(context.waylay).toBeInBottomOfDeck(context.player1, 3);
                expect(context.devotion).toBeInBottomOfDeck(context.player1, 3);
            });
        });

        describe('function-based searchCount', function () {
            it('uses the correct card count based on a condition (Bounty Hunter\'s Quarry)', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['wampa'],
                        deck: [
                            'scout-bike-pursuer', 'battlefield-marine', 'waylay', 'protector', 'inferno-four#unforgetting',
                            'devotion', 'consular-security-force', 'echo-base-defender', 'swoop-racer', 'resupply',
                        ],
                        resources: 3,
                    },
                    player2: {
                        groundArena: [
                            // non-unique — bounty search should show top 5
                            { card: 'specforce-soldier', upgrades: ['bounty-hunters-quarry'] },
                            // unique — bounty search should show top 10
                            { card: 'benthic-two-tubes#partisan-lieutenant', upgrades: ['bounty-hunters-quarry'] },
                        ],
                    },
                });

                const { context } = contextRef;

                // Non-unique: top 5 shown
                context.player1.clickCard(context.wampa);
                context.player1.clickCard(context.specforceSoldier);
                context.player1.clickPrompt('Trigger');

                expect(context.player1).toHaveExactDisplayPromptCards({
                    selectable: [context.scoutBikePursuer, context.battlefieldMarine, context.infernoFour],
                    invalid: [context.waylay, context.protector],
                });
                context.player1.clickPrompt('Take nothing');

                context.readyCard(context.wampa);
                context.player2.passAction();

                // Unique: top 10 shown
                context.player1.clickCard(context.wampa);
                context.player1.clickCard(context.benthicTwoTubes);
                context.player1.clickPrompt('Trigger');

                expect(context.player1).toHaveExactDisplayPromptCards({
                    selectable: [context.scoutBikePursuer, context.battlefieldMarine, context.infernoFour, context.echoBaseDefender, context.swoopRacer],
                    invalid: [context.waylay, context.protector, context.devotion, context.consularSecurityForce, context.resupply],
                });
                context.player1.clickPrompt('Take nothing');
            });
        });

        describe('entire deck search', function () {
            it('shows only selectable cards from the entire deck and shuffles after (Bounty Posting)', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['bounty-posting'],
                        deck: [
                            // Bounty upgrade — selectable
                            'bounty-hunters-quarry',
                            // non-Bounty cards — should not appear in prompt (SearchEntireDeckSystem hides invalid cards)
                            'wampa', 'waylay', 'atst', 'devotion',
                        ],
                    },
                });

                const { context } = contextRef;

                context.player1.clickCard(context.bountyPosting);

                expect(context.player1).toHavePrompt('Select a card');
                // Only the selectable Bounty upgrade is shown; non-Bounty cards are hidden
                expect(context.player1).toHaveExactDisplayPromptCards({
                    selectable: [context.bountyHuntersQuarry],
                });

                context.player1.clickCardInDisplayCardPrompt(context.bountyHuntersQuarry);

                // Opponent sees the revealed card
                expect(context.player2).toHaveExactViewableDisplayPromptCards([context.bountyHuntersQuarry]);
                context.player2.clickDone();

                expect(context.bountyHuntersQuarry).toBeInZone('hand', context.player1);
            });
        });

        describe('opponent deck search', function () {
            it('allows the controlling player to search and discard from the opponent\'s deck (Annihilator)', async function () {
                // Both players have battlefield-marine — use findCardByName to disambiguate
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['annihilator#tagges-flagship'],
                        spaceArena: ['concord-dawn-interceptors'],
                    },
                    player2: {
                        groundArena: ['battlefield-marine'],
                        deck: [
                            'battlefield-marine',  // selectable — matches defeated unit name
                            'waylay', 'devotion',  // non-matching — not selectable
                        ],
                    },
                });

                const { context } = contextRef;
                const arenaMarine = context.player2.findCardByName('battlefield-marine', 'groundArena');
                const deckMarine = context.player2.findCardByName('battlefield-marine', 'deck');

                context.player1.clickCard(context.annihilator);
                context.player1.clickCard(arenaMarine);

                // Player 1 sees player 2's deck and can discard matching cards
                expect(context.player1).toHaveExactDisplayPromptCards({
                    selectable: [deckMarine],
                });
                context.player1.clickCardInDisplayCardPrompt(deckMarine);
                context.player1.clickDone();

                expect(deckMarine).toBeInZone('discard', context.player2);
            });
        });
    });
});
