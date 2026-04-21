describe('Salacious Crumb, Cackling Companion', function() {
    integration(function(contextRef) {
        describe('Salacious Crumb, Cackling Companion\'s ability', function() {
            beforeEach(function() {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['salacious-crumb#cackling-companion'],
                        leader: 'jabba-the-hutt#wonderful-human-being'
                    }
                });
            });

            it('should be ready when controlling SEC Jabba the Hutt leader', function() {
                const { context } = contextRef;
                context.player1.clickCard(context.salaciousCrumbCacklingCompanion);
                expect(context.salaciousCrumbCacklingCompanion.exhausted).toBeFalse();
                expect(context.player2).toBeActivePlayer();
            });

            it('should be ready when controlling a SEC Jabba the Hutt leader unit', function() {
                const { context } = contextRef;
                context.jabbaTheHuttWonderfulHumanBeing.deployed = true;
                context.player1.clickCard(context.salaciousCrumbCacklingCompanion);
                expect(context.salaciousCrumbCacklingCompanion.exhausted).toBeFalse();
                expect(context.player2).toBeActivePlayer();
            });
        });

        describe('Salacious Crumb, Cackling Companion\'s ability', function() {
            beforeEach(function() {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['salacious-crumb#cackling-companion'],
                        leader: 'jabba-the-hutt#his-high-exaltedness'
                    }
                });
            });

            it('should be ready when controlling SHD Jabba the Hutt leader', function() {
                const { context } = contextRef;
                context.player1.clickCard(context.salaciousCrumbCacklingCompanion);
                expect(context.salaciousCrumbCacklingCompanion.exhausted).toBeFalse();
                expect(context.player2).toBeActivePlayer();
            });

            it('should be ready when controlling a SHD Jabba the Hutt leader unit', function() {
                const { context } = contextRef;
                context.jabbaTheHuttHisHighExaltedness.deployed = true;
                context.player1.clickCard(context.salaciousCrumbCacklingCompanion);
                expect(context.salaciousCrumbCacklingCompanion.exhausted).toBeFalse();
                expect(context.player2).toBeActivePlayer();
            });
        });

        it('should be ready when controlling SOR Jabba the Hutt ground unit ', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['salacious-crumb#cackling-companion'],
                    groundArena: ['jabba-the-hutt#cunning-daimyo']
                }
            });
            const { context } = contextRef;
            context.player1.clickCard(context.salaciousCrumbCacklingCompanion);
            expect(context.salaciousCrumbCacklingCompanion.exhausted).toBeFalse();
            expect(context.player2).toBeActivePlayer();
        });

        it('should NOT be ready when not controlling and Jabba leaders or units ', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['salacious-crumb#cackling-companion'],
                    leader: 'the-mandalorian#sworn-to-the-creed'
                },
                player2: {
                    leader: 'jabba-the-hutt#his-high-exaltedness'
                }
            });
            const { context } = contextRef;
            context.player1.clickCard(context.salaciousCrumbCacklingCompanion);
            expect(context.salaciousCrumbCacklingCompanion.exhausted).toBeTrue();
            expect(context.player2).toBeActivePlayer();
        });

        it('should NOT be ready when not controlling and Jabba leaders or units ', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['salacious-crumb#cackling-companion'],
                    leader: 'the-mandalorian#sworn-to-the-creed'
                },
                player2: {
                    leader: 'jabba-the-hutt#his-high-exaltedness'
                }
            });
            const { context } = contextRef;
            context.player1.clickCard(context.salaciousCrumbCacklingCompanion);
            expect(context.salaciousCrumbCacklingCompanion.exhausted).toBeTrue();
            expect(context.player2).toBeActivePlayer();
        });

        it('should NOT be ready when not controlling and Jabba leaders or units ', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['salacious-crumb#cackling-companion'],
                    leader: 'the-mandalorian#sworn-to-the-creed'
                },
                player2: {
                    leader: 'jabba-the-hutt#his-high-exaltedness'
                }
            });

            const { context } = contextRef;
            context.jabbaTheHuttHisHighExaltedness.deployed = true;
            context.player1.clickCard(context.salaciousCrumbCacklingCompanion);
            expect(context.salaciousCrumbCacklingCompanion.exhausted).toBeTrue();
            expect(context.player2).toBeActivePlayer();
        });

        it('should NOT be ready when played by opponent via Vermillion and opponent does not control Jabba', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    spaceArena: ['vermillion#qiras-auction-house']
                },
                player2: {
                    deck: ['salacious-crumb#cackling-companion'],
                    leader: 'jabba-the-hutt#his-high-exaltedness'
                }
            });

            const { context } = contextRef;

            // P1 attacks with Vermillion
            context.player1.clickCard(context.vermillion);
            context.player1.clickCard(context.p2Base);

            // Choose opponent's deck
            context.player1.clickPrompt('Opponent\'s deck');

            // View revealed card
            context.player1.clickDone();

            // Choose yourself to play Salacious Crumb
            context.player1.clickPrompt('You');

            // Choose to play the card for free
            context.player1.clickPrompt('Trigger');

            // Crumb should NOT enter play ready: P1 does not control Jabba the Hutt.
            // Before the fix, the condition would check P2 (the card owner), who does control Jabba.
            expect(context.salaciousCrumbCacklingCompanion).toBeInZone('groundArena', context.player1);
            expect(context.salaciousCrumbCacklingCompanion.exhausted).toBeTrue();
        });

        it('should be ready when played by opponent via Vermillion and opponent controls Jabba', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    spaceArena: ['vermillion#qiras-auction-house'],
                    leader: 'jabba-the-hutt#his-high-exaltedness'
                },
                player2: {
                    deck: ['salacious-crumb#cackling-companion']
                }
            });

            const { context } = contextRef;

            // P1 attacks with Vermillion
            context.player1.clickCard(context.vermillion);
            context.player1.clickCard(context.p2Base);

            // Choose opponent's deck
            context.player1.clickPrompt('Opponent\'s deck');

            // View revealed card
            context.player1.clickDone();

            // Choose yourself to play Salacious Crumb
            context.player1.clickPrompt('You');

            // Choose to play the card for free
            context.player1.clickPrompt('Trigger');

            // Crumb SHOULD enter play ready: P1 controls Jabba the Hutt.
            expect(context.salaciousCrumbCacklingCompanion).toBeInZone('groundArena', context.player1);
            expect(context.salaciousCrumbCacklingCompanion.exhausted).toBeFalse();
        });
    });
});
