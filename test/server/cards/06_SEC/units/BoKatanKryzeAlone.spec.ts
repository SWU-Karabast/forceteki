describe('Bo-Katan Kryze, Alone', function () {
    integration(function (contextRef) {
        describe('Bo-Katan Kryze\'s triggered ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['bokatan-kryze#alone'],
                        groundArena: ['porg']
                    },
                    player2: {
                        groundArena: ['wampa', 'rampaging-wampa'],
                    }
                });
            });

            it('should give all enemy units -3/-3', function () {
                const { context } = contextRef;

                // play Bo-Katan Kryze, Alone
                context.player1.clickCard(context.bokatanKryze);
                // give her an experience counter
                context.player1.clickCard(context.bokatanKryze);

                // verify enemy units are -3/-3
                expect(context.wampa.getPower()).toBe(1);
                expect(context.wampa.getHp()).toBe(2);
                expect(context.rampagingWampa).toBeInZone('discard');
                // verify friendly unit is unaffected
                expect(context.porg.getPower()).toBe(1);
                expect(context.porg.getHp()).toBe(1);

                // pass phase, ensure -3/-3 is gone
                context.moveToNextActionPhase();
                expect(context.wampa.getPower()).toBe(4);
                expect(context.wampa.getHp()).toBe(5);
            });

            it('should only target a friendly unit to give an experience counter when an enemy unit dies', function () {
                const { context } = contextRef;

                // play Bo-Katan Kryze, Alone
                context.player1.clickCard(context.bokatanKryze);

                // select friendly unit to give experience token to
                expect(context.player1).toBeAbleToSelectExactly([context.bokatanKryze, context.porg]);
                context.player1.clickCard(context.porg);
                // check the porg got an experience counter
                expect(context.porg.getPower()).toBe(2);
                expect(context.porg.getHp()).toBe(2);
            });

            it('should not give a friendly unit an experience counter when a friendly unit dies', function () {
                const { context } = contextRef;

                // play Bo-Katan Kryze, Alone
                context.player1.clickCard(context.bokatanKryze);
                // give her an experience counter
                context.player1.clickCard(context.bokatanKryze);

                // attack 1/2 wampa into 1/1 porg
                context.player2.clickCard(context.wampa);
                context.player2.clickCard(context.porg);

                // porg is defeated, wampa has 1 damage
                expect(context.wampa.damage).toBe(1);
                expect(context.porg).toBeInZone('discard');
                // player 1 is active player, but no prompt to select a friendly unit
                expect(context.player1).toBeActivePlayer();
                expect(context.player1).not.toBeAbleToSelect(context.bokatanKryze);
                // bo-katan did not get a second experience counter
                expect(context.bokatanKryze.getPower()).toBe(9);
                expect(context.bokatanKryze.getHp()).toBe(9);
            });
        });

        describe('Bo-Katan Kryze\'s triggered ability with No Glory, Only Results', function() {
            it('should not trigger when Bo-Katan Kryze\'s controller uses No Glory, Only Results', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['no-glory-only-results'],
                        groundArena: ['bokatan-kryze#alone', 'porg']
                    },
                    player2: {
                        groundArena: ['wampa', 'rampaging-wampa'],
                    }
                });

                const { context } = contextRef;
                // player 1 plays No Glory, Only Results, chooses Wampa
                context.player1.clickCard(context.noGloryOnlyResults);
                context.player1.clickCard(context.wampa);
                // Wampa is defeated, no trigger from Bo-Katan
                expect(context.wampa).toBeInZone('discard');
                expect(context.player2).toBeActivePlayer();
            });

            it('should trigger when Bo-Katan Kryze\'s opponent uses No Glory, Only Results', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['no-glory-only-results'],
                        groundArena: ['wampa', 'rampaging-wampa'],
                    },
                    player2: {
                        groundArena: ['bokatan-kryze#alone', 'porg']
                    }
                });

                const { context } = contextRef;
                // Player 1 plays No Glory, Only Results, chooses Porg
                context.player1.clickCard(context.noGloryOnlyResults);
                context.player1.clickCard(context.porg);
                // Porg is defeated
                expect(context.porg).toBeInZone('discard');
                // Player 2 is prompted to select a friendly unit to give an experience counter to
                expect(context.player2).toBeAbleToSelectExactly([context.bokatanKryze]);
                context.player2.clickCard(context.bokatanKryze);
                // Bo-Katan got an experience counter, and is now a 9/9
                expect(context.bokatanKryze.getPower()).toBe(9);
                expect(context.bokatanKryze.getHp()).toBe(9);
                // Player 2 is now the active player
                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});
