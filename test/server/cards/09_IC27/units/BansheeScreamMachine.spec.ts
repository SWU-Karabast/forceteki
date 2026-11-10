describe('Banshee, Scream Machine', function() {
    integration(function(contextRef) {
        const abilityTitle = 'Search the top 5 cards of your deck for a non-unit card, reveal it, and put it on top of your deck';

        describe('Banshee\'s on attack ability', function() {
            beforeEach(async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        spaceArena: ['banshee#scream-machine'],
                        // Top 5: wampa, battlefield-marine, vanquish, jetpack, astromech-pilot
                        deck: [
                            'wampa',
                            'battlefield-marine',
                            'vanquish',
                            'jetpack',
                            'astromech-pilot',
                            'cartel-spacer',
                            'atst',
                            'consular-security-force',
                            'echo-base-defender'
                        ]
                    },
                    player2: {
                        spaceArena: ['tieln-fighter']
                    }
                });
            });

            it('should let the player search the top 5 for a non-unit card, reveal it to the opponent and put it on top of the deck', function() {
                const { context } = contextRef;

                // Attack the base and trigger the ability
                context.player1.clickCard(context.bansheeScreamMachine);
                context.player1.clickCard(context.p2Base);
                expect(context.player1).toHavePassAbilityPrompt(abilityTitle);
                context.player1.clickPrompt('Trigger');

                // Only non-unit cards in the top 5 are selectable
                expect(context.player1).toHaveExactDisplayPromptCards({
                    invalid: [
                        context.wampa,
                        context.battlefieldMarine,
                        context.astromechPilot
                    ],
                    selectable: [
                        context.vanquish,
                        context.jetpack
                    ]
                });
                expect(context.player1).toHaveEnabledPromptButton('Take nothing');

                // Choose Vanquish, opponent sees the revealed card
                context.player1.clickCardInDisplayCardPrompt(context.vanquish);
                expect(context.player2).toHaveExactViewableDisplayPromptCards([context.vanquish]);
                context.player2.clickDone();

                // Vanquish on top, cards below the top 5 stay in order, the other 4 searched cards on the bottom
                expect(context.player1.deck.length).toBe(9);
                expect(context.player1.deck[0]).toBe(context.vanquish);
                expect(context.player1.deck[1]).toBe(context.cartelSpacer);
                expect(context.player1.deck[2]).toBe(context.atst);
                expect(context.player1.deck[3]).toBe(context.consularSecurityForce);
                expect(context.player1.deck[4]).toBe(context.echoBaseDefender);
                expect([
                    context.wampa,
                    context.battlefieldMarine,
                    context.jetpack,
                    context.astromechPilot
                ]).toAllBeInBottomOfDeck(context.player1, 4);

                // Attack still dealt damage and the turn passed
                expect(context.p2Base.damage).toBe(2);
                expect(context.player2).toBeActivePlayer();
            });

            it('should be able to put an upgrade on top of the deck', function() {
                const { context } = contextRef;

                // Attack the base, trigger the ability and choose Jetpack
                context.player1.clickCard(context.bansheeScreamMachine);
                context.player1.clickCard(context.p2Base);
                context.player1.clickPrompt('Trigger');
                context.player1.clickCardInDisplayCardPrompt(context.jetpack);

                // Opponent sees the revealed card
                expect(context.player2).toHaveExactViewableDisplayPromptCards([context.jetpack]);
                context.player2.clickDone();

                // Jetpack on top, the other 4 searched cards on the bottom
                expect(context.player1.deck[0]).toBe(context.jetpack);
                expect(context.player1.deck[1]).toBe(context.cartelSpacer);
                expect([
                    context.wampa,
                    context.battlefieldMarine,
                    context.vanquish,
                    context.astromechPilot
                ]).toAllBeInBottomOfDeck(context.player1, 4);
                expect(context.p2Base.damage).toBe(2);
                expect(context.player2).toBeActivePlayer();
            });

            it('should do nothing if the player passes the optional ability', function() {
                const { context } = contextRef;

                const deckBefore = [...context.player1.deck];

                // Attack the base and pass the ability
                context.player1.clickCard(context.bansheeScreamMachine);
                context.player1.clickCard(context.p2Base);
                expect(context.player1).toHavePassAbilityPrompt(abilityTitle);
                context.player1.clickPrompt('Pass');

                // Deck is unchanged
                expect(context.player1.deck).toEqual(deckBefore);
                expect(context.p2Base.damage).toBe(2);
                expect(context.player2).toBeActivePlayer();
            });

            it('should put all searched cards on the bottom of the deck if the player takes nothing', function() {
                const { context } = contextRef;

                // Attack the base, trigger the ability and take nothing
                context.player1.clickCard(context.bansheeScreamMachine);
                context.player1.clickCard(context.p2Base);
                context.player1.clickPrompt('Trigger');
                expect(context.player1).toHaveEnabledPromptButton('Take nothing');
                context.player1.clickPrompt('Take nothing');

                // No reveal for the opponent, all 5 searched cards on the bottom
                expect(context.player2).toBeActivePlayer();
                expect(context.player1.deck.length).toBe(9);
                expect(context.player1.deck[0]).toBe(context.cartelSpacer);
                expect(context.player1.deck[1]).toBe(context.atst);
                expect(context.player1.deck[2]).toBe(context.consularSecurityForce);
                expect(context.player1.deck[3]).toBe(context.echoBaseDefender);
                expect([
                    context.wampa,
                    context.battlefieldMarine,
                    context.vanquish,
                    context.jetpack,
                    context.astromechPilot
                ]).toAllBeInBottomOfDeck(context.player1, 5);
                expect(context.p2Base.damage).toBe(2);
            });

            it('should still trigger when attacking an enemy space unit', function() {
                const { context } = contextRef;

                // Attack the TIE/ln Fighter and trigger the ability
                context.player1.clickCard(context.bansheeScreamMachine);
                context.player1.clickCard(context.tielnFighter);
                expect(context.player1).toHavePassAbilityPrompt(abilityTitle);
                context.player1.clickPrompt('Trigger');

                // Only non-unit cards in the top 5 are selectable
                expect(context.player1).toHaveExactDisplayPromptCards({
                    invalid: [
                        context.wampa,
                        context.battlefieldMarine,
                        context.astromechPilot
                    ],
                    selectable: [
                        context.vanquish,
                        context.jetpack
                    ]
                });

                // Choose Vanquish, Vanquish ends up on top
                context.player1.clickCardInDisplayCardPrompt(context.vanquish);
                context.player2.clickDone();
                expect(context.player1.deck[0]).toBe(context.vanquish);
                expect(context.player2).toBeActivePlayer();
            });
        });

        describe('Banshee\'s on attack ability with unusual decks', function() {
            it('should offer no selectable cards when the top 5 contain only units, and put them all on the bottom', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        spaceArena: ['banshee#scream-machine'],
                        deck: [
                            'wampa',
                            'battlefield-marine',
                            'cartel-spacer',
                            'atst',
                            'astromech-pilot',
                            'vanquish',
                            'jetpack'
                        ]
                    }
                });

                const { context } = contextRef;

                // Attack the base and trigger the ability
                context.player1.clickCard(context.bansheeScreamMachine);
                context.player1.clickCard(context.p2Base);
                context.player1.clickPrompt('Trigger');

                // No card in the top 5 is selectable, take nothing
                expect(context.player1).toHaveExactDisplayPromptCards({
                    invalid: [
                        context.wampa,
                        context.battlefieldMarine,
                        context.cartelSpacer,
                        context.atst,
                        context.astromechPilot
                    ]
                });
                expect(context.player1).toHaveEnabledPromptButton('Take nothing');
                context.player1.clickPrompt('Take nothing');

                // All 5 searched cards on the bottom
                expect(context.player2).toBeActivePlayer();
                expect(context.player1.deck[0]).toBe(context.vanquish);
                expect(context.player1.deck[1]).toBe(context.jetpack);
                expect([
                    context.wampa,
                    context.battlefieldMarine,
                    context.cartelSpacer,
                    context.atst,
                    context.astromechPilot
                ]).toAllBeInBottomOfDeck(context.player1, 5);
                expect(context.p2Base.damage).toBe(2);
            });

            it('should search all cards when the deck has fewer than 5 cards', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        spaceArena: ['banshee#scream-machine'],
                        deck: ['wampa', 'vanquish', 'battlefield-marine']
                    }
                });

                const { context } = contextRef;

                // Attack the base and trigger the ability
                context.player1.clickCard(context.bansheeScreamMachine);
                context.player1.clickCard(context.p2Base);
                context.player1.clickPrompt('Trigger');

                // The whole deck is searched, choose Vanquish
                expect(context.player1).toHaveExactDisplayPromptCards({
                    invalid: [context.wampa, context.battlefieldMarine],
                    selectable: [context.vanquish]
                });
                context.player1.clickCardInDisplayCardPrompt(context.vanquish);

                // Opponent sees the revealed card
                expect(context.player2).toHaveExactViewableDisplayPromptCards([context.vanquish]);
                context.player2.clickDone();

                // Vanquish on top, the other 2 cards on the bottom
                expect(context.player1.deck.length).toBe(3);
                expect(context.player1.deck[0]).toBe(context.vanquish);
                expect([context.wampa, context.battlefieldMarine]).toAllBeInBottomOfDeck(context.player1, 2);
                expect(context.p2Base.damage).toBe(2);
                expect(context.player2).toBeActivePlayer();
            });

            it('should resolve the attack without effect when the deck is empty', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        spaceArena: ['banshee#scream-machine'],
                        deck: []
                    }
                });

                const { context } = contextRef;

                // Attack the base, the ability has nothing to search
                context.player1.clickCard(context.bansheeScreamMachine);
                context.player1.clickCard(context.p2Base);

                // Attack resolves normally and the turn passes
                expect(context.player1.deck.length).toBe(0);
                expect(context.p1Base.damage).toBe(0);
                expect(context.p2Base.damage).toBe(2);
                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});
