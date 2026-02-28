describe('Ben Solo, Facing the Light', function() {
    integration(function(contextRef) {
        describe('Ben Solo\'s when played ability', function() {
            it('should ready another friendly unit and give it protection from attacks this phase', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['ben-solo#facing-the-light'],
                        groundArena: [{ card: 'battlefield-marine', exhausted: true }, 'rebel-pathfinder'],
                        resources: 20
                    },
                    player2: {
                        groundArena: ['wampa']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.benSolo);
                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.rebelPathfinder]);
                expect(context.player1).not.toHavePassAbilityButton();
                context.player1.clickCard(context.battlefieldMarine);

                expect(context.player2).toBeActivePlayer();
                // Battlefield Marine is now ready
                expect(context.battlefieldMarine.exhausted).toBe(false);

                context.player2.clickCard(context.wampa);
                // cannot target battlefield marine
                // cannot target ben solo (hidden)
                expect(context.player2).toBeAbleToSelectExactly([context.rebelPathfinder, context.p1Base]);
                context.player2.clickCard(context.p1Base);
            });

            it('should ready another friendly unit and give it protection from attacks this phase (sentinel)', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['ben-solo#facing-the-light'],
                        groundArena: [{ card: 'echo-base-defender', exhausted: true }, 'rebel-pathfinder'],
                        resources: 20
                    },
                    player2: {
                        groundArena: ['wampa']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.benSolo);
                context.player1.clickCard(context.echoBaseDefender);

                expect(context.player2).toBeActivePlayer();
                expect(context.echoBaseDefender.exhausted).toBe(false);

                context.player2.clickCard(context.wampa);
                // echo base defender is selectable because he is sentinel
                expect(context.player2).toBeAbleToSelectExactly([context.echoBaseDefender]);
                context.player2.clickCard(context.echoBaseDefender);

                expect(context.player1).toBeActivePlayer();
            });
        });

        describe('Ben Solo\'s when defeated ability', function() {
            it('should ready another friendly unit and give it protection from attacks', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['ben-solo#facing-the-light', { card: 'battlefield-marine', exhausted: true }, 'rebel-pathfinder']
                    },
                    player2: {
                        hand: ['rivals-fall'],
                        groundArena: ['wampa'],
                        hasInitiative: true,
                    }
                });

                const { context } = contextRef;

                context.player2.clickCard(context.rivalsFall);
                context.player2.clickCard(context.benSolo);

                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.rebelPathfinder]);
                context.player1.clickCard(context.battlefieldMarine);

                // Battlefield Marine is now ready
                expect(context.battlefieldMarine.exhausted).toBe(false);
                expect(context.player1).toBeActivePlayer();

                context.player1.passAction();
                context.player2.clickCard(context.wampa);
                expect(context.player2).toBeAbleToSelectExactly([context.rebelPathfinder, context.p1Base]);
                context.player2.clickCard(context.p1Base);

                expect(context.player1).toBeActivePlayer();
            });

            it('should ready another friendly unit and give it protection from attacks (No Glory Only Results)', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['ben-solo#facing-the-light', { card: 'battlefield-marine', exhausted: true }, 'rebel-pathfinder']
                    },
                    player2: {
                        hand: ['no-glory-only-results'],
                        groundArena: [{ card: 'wampa', exhausted: true }],
                        hasInitiative: true,
                    }
                });

                const { context } = contextRef;

                context.player2.clickCard(context.noGloryOnlyResults);
                context.player2.clickCard(context.benSolo);

                expect(context.player2).toBeAbleToSelectExactly([context.wampa]);
                context.player2.clickCard(context.wampa);

                expect(context.player1).toBeActivePlayer();
                expect(context.wampa.exhausted).toBe(false);

                context.player1.clickCard(context.rebelPathfinder);
                expect(context.player1).toBeAbleToSelectExactly([context.p2Base]);
                context.player1.clickCard(context.p2Base);

                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});
