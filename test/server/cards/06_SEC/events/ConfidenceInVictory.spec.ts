
describe('Confidence in Victory', function() {
    integration(function (contextRef) {
        describe('Play restriction', function () {
            beforeEach(async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'anakin-skywalker#tempted-by-the-dark-side',
                        hasForceToken: true,
                        hand: ['confidence-in-victory', 'resupply'],
                        deck: ['confidence-in-victory', 'atst'],
                        groundArena: [
                            'bib-fortuna#jabbas-majordomo',
                            'ezra-bridger#resourceful-troublemaker',
                            'tech#source-of-insight'
                        ],
                        resources: [
                            'confidence-in-victory',
                            'atst', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst',
                            'atst', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst'
                        ]
                    },
                    player2: {
                        hand: ['takedown'],
                    }
                });

                const { context } = contextRef;
                context.confidenceInHand = context.player1.findCardByName('confidence-in-victory', 'hand');
                context.confidenceInDeck = context.player1.findCardByName('confidence-in-victory', 'deck');
                context.confidenceInResources = context.player1.findCardByName('confidence-in-victory', 'resource');
            });

            it('can be played as the player\'s first action', function () {
                const { context } = contextRef;

                // P1 plays Confidence in Victory
                expect(context.player1).toBeAbleToSelect(context.confidenceInHand);
                context.player1.clickCard(context.confidenceInHand);

                expect(context.player1).toHaveEnabledPromptButtons(['Space', 'Ground']);
                context.player1.clickPrompt('Space');
                expect(context.confidenceInHand).toBeInZone('discard');
            });

            it('can be played as the player\'s first action if the opponent has taken an action', function () {
                const { context } = contextRef;

                // Move to next action phase where P2 has initiative
                context.player1.passAction();
                context.player2.claimInitiative();
                context.player2.clickDone();
                context.player1.clickDone();

                // P2 plays Takedown as their first action
                context.player2.clickCard(context.takedown);
                context.player2.clickCard(context.bibFortuna);

                // P1 plays Confidence in Victory as their first action
                expect(context.player1).toBeAbleToSelect(context.confidenceInHand);
                context.player1.clickCard(context.confidenceInHand);

                expect(context.player1).toHaveEnabledPromptButtons(['Space', 'Ground']);
                context.player1.clickPrompt('Space');
                expect(context.confidenceInHand).toBeInZone('discard');
            });

            it('can be played from Resources if it gains Smuggle', function () {
                const { context } = contextRef;

                // P1 plays Confidence in Victory from Resources
                context.player1.clickCard(context.confidenceInResources);

                expect(context.player1).toHaveEnabledPromptButtons(['Space', 'Ground']);
                context.player1.clickPrompt('Space');
                expect(context.confidenceInResources).toBeInZone('discard');
            });

            it('cannot be played if the player has already taken an action', function () {
                const { context } = contextRef;

                // P1 passes their first action
                context.player1.passAction();

                // P2 takes an action
                context.player2.clickCard(context.takedown);
                context.player2.clickCard(context.bibFortuna);

                // P1 cannot play Confidence in Victory as their second action
                expect(context.player1).toBeActivePlayer();
                expect(context.player1).not.toBeAbleToSelect(context.confidenceInHand);
            });

            it('cannot be played if the player\'s first action allows them to play a card via action ability', function () {
                const { context } = contextRef;

                // P1 uses Bib Fortuna to play an Event from their hand
                context.player1.clickCard(context.bibFortuna);
                expect(context.player1).toHaveEnabledPromptButtons(['Attack', 'Play an event from your hand. It costs 1 less.']);
                context.player1.clickPrompt('Play an event from your hand. It costs 1 less.');
                expect(context.player1).toHavePrompt('Choose an event');
                expect(context.player1).toBeAbleToSelectExactly([
                    // Confidence in Victory cannot be played this way
                    context.resupply
                ]);
                context.player1.clickCard(context.resupply);
            });

            it('cannot be played if the player\'s first action allows them to play a card via triggered ability', function () {
                const { context } = contextRef;

                // P1 attacks with Ezra to trigger his ability
                context.player1.clickCard(context.ezraBridger);
                context.player1.clickCard(context.p2Base);

                // Resolve Ezra's ability
                expect(context.player1).toHaveExactSelectableDisplayPromptCards([context.confidenceInDeck]);
                expect(context.player1).toHaveExactEnabledDisplayPromptPerCardButtons(['Discard it', 'Leave it on top of your deck']);
                expect(context.player1).toHaveExactDisabledDisplayPromptPerCardButtons(['Play it']);
                context.player1.clickDisplayCardPromptButton(context.confidenceInDeck.uuid, 'leave');
            });
        });

        describe('Event ability', function () {
            it('wins the game if the player is the only who controls units in the chosen arena at the start of the regroup phase (Space)', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['confidence-in-victory'],
                        spaceArena: ['ruthless-raider'],
                    },
                    player2: {
                        spaceArena: ['lurking-tie-phantom'],
                    }
                });

                const { context } = contextRef;

                // P1 plays Confidence in Victory
                context.player1.clickCard(context.confidenceInVictory);

                expect(context.player1).toHavePrompt('Choose an arena');
                expect(context.player1).toHaveEnabledPromptButtons(['Space', 'Ground']);
                context.player1.clickPrompt('Space');

                // P2 claims initiative
                context.player2.claimInitiative();

                // P1 attacks and defeats P2's only space unit
                context.player1.clickCard(context.ruthlessRaider);
                context.player1.clickCard(context.lurkingTiePhantom);

                expect(context.ruthlessRaider).toBeInZone('spaceArena');
                expect(context.lurkingTiePhantom).toBeInZone('discard');

                // Move to regroup phase
                context.moveToRegroupPhase();

                // P1 should win the game
                expect(context.game).toBeOver();
                expect(context.player1).toBeGameWinner();
            });

            it('wins the game if the player is the only who controls units in the chosen arena at the start of the regroup phase (Ground)', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['confidence-in-victory'],
                        groundArena: ['ravenous-rathtar'],
                    },
                    player2: {
                        groundArena: ['battlefield-marine']
                    }
                });

                const { context } = contextRef;

                // P1 plays Confidence in Victory
                context.player1.clickCard(context.confidenceInVictory);

                expect(context.player1).toHavePrompt('Choose an arena');
                expect(context.player1).toHaveEnabledPromptButtons(['Space', 'Ground']);
                context.player1.clickPrompt('Ground');

                // P2 claims initiative
                context.player2.claimInitiative();

                // P1 attacks and defeats P2's only ground unit
                context.player1.clickCard(context.ravenousRathtar);
                context.player1.clickCard(context.battlefieldMarine);

                expect(context.ravenousRathtar).toBeInZone('groundArena');
                expect(context.battlefieldMarine).toBeInZone('discard');

                // Move to regroup phase
                context.moveToRegroupPhase();

                // P1 should win the game
                expect(context.game).toBeOver();
                expect(context.player1).toBeGameWinner();
            });

            it('does not win the game if the opponent also controls units in the chosen arena at the start of the regroup phase', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['confidence-in-victory'],
                        spaceArena: ['ruthless-raider'],
                    },
                    player2: {
                        spaceArena: ['lurking-tie-phantom'],
                    }
                });

                const { context } = contextRef;

                // P1 plays Confidence in Victory
                context.player1.clickCard(context.confidenceInVictory);

                expect(context.player1).toHavePrompt('Choose an arena');
                expect(context.player1).toHaveEnabledPromptButtons(['Space', 'Ground']);
                context.player1.clickPrompt('Space');

                // Move to regroup phase without any attacks
                context.moveToRegroupPhase();

                // No player should win the game
                expect(context.game).not.toBeOver();
            });

            it('does not win the game if the player controls no units in the chosen arena at the start of the regroup phase', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['confidence-in-victory'],
                    }
                });

                const { context } = contextRef;

                // P1 plays Confidence in Victory
                context.player1.clickCard(context.confidenceInVictory);

                expect(context.player1).toHavePrompt('Choose an arena');
                expect(context.player1).toHaveEnabledPromptButtons(['Space', 'Ground']);
                context.player1.clickPrompt('Space');

                // Move to regroup phase without any attacks
                context.moveToRegroupPhase();

                // No player should win the game
                expect(context.game).not.toBeOver();
            });

            it('does not win the game if the opponent is the only who controls units in the chosen arena at the start of the regroup phase', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['confidence-in-victory'],
                    },
                    player2: {
                        spaceArena: ['lurking-tie-phantom'],
                    }
                });

                const { context } = contextRef;

                // P1 plays Confidence in Victory
                context.player1.clickCard(context.confidenceInVictory);

                expect(context.player1).toHavePrompt('Choose an arena');
                expect(context.player1).toHaveEnabledPromptButtons(['Space', 'Ground']);
                context.player1.clickPrompt('Space');

                // Move to regroup phase without any attacks
                context.moveToRegroupPhase();

                // No player should win the game
                expect(context.game).not.toBeOver();
            });
        });
    });
});