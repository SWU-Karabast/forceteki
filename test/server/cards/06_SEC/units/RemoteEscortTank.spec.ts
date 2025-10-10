describe('Remote Escort Tank', function() {
    integration(function(contextRef) {
        describe('Remote Escort Tank\'s when played ability', function() {
            it('should give any one target unit sentinel for the rest of the phase', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['remote-escort-tank'],
                        groundArena: ['moisture-farmer']
                    },
                    player2: {
                        groundArena: ['battlefield-marine'],
                        spaceArena: ['cartel-spacer']
                    },
                });

                const { context } = contextRef;

                context.player1.clickCard(context.remoteEscortTank);
                expect(context.player1).toBeAbleToSelectExactly([context.remoteEscortTank, context.moistureFarmer, context.battlefieldMarine, context.cartelSpacer]);

                context.player1.clickCard(context.moistureFarmer);

                context.player2.clickCard(context.battlefieldMarine);
                expect(context.player2).toBeAbleToSelectExactly([context.moistureFarmer]);
                context.player2.clickCard(context.moistureFarmer);
                expect(context.moistureFarmer.damage).toBe(3);
                expect(context.battlefieldMarine.damage).toBe(0);

                context.moveToNextActionPhase();

                // should no longer have sentinel
                context.player1.passAction();
                context.player2.clickCard(context.battlefieldMarine);
                expect(context.player2).toBeAbleToSelectExactly([context.remoteEscortTank, context.moistureFarmer, context.p1Base]);
                context.player2.clickCard(context.p1Base);
            });

            it('should be playable using plot', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        resources: ['remote-escort-tank', 'wampa', 'wampa', 'wampa', 'wampa', 'wampa'],
                        leader: 'sabine-wren#galvanized-revolutionary',
                        deck: ['moisture-farmer']
                    },
                    player2: {
                        groundArena: ['battlefield-marine'],
                        spaceArena: ['cartel-spacer']
                    },
                });

                const { context } = contextRef;

                context.player1.clickCard(context.sabineWren);
                context.player1.clickPrompt('Deploy Sabine Wren');
                context.player1.clickPrompt('Trigger');
                expect(context.player1).toBeAbleToSelectExactly([context.remoteEscortTank, context.sabineWren, context.battlefieldMarine, context.cartelSpacer]);

                context.player1.clickCard(context.sabineWren);
                expect(context.moistureFarmer).toBeInZone('resource');

                context.player2.clickCard(context.battlefieldMarine);
                expect(context.player2).toBeAbleToSelectExactly([context.sabineWren]);
                context.player2.clickCard(context.sabineWren);
                expect(context.sabineWren.damage).toBe(3);
                expect(context.battlefieldMarine.damage).toBe(2);

                context.moveToNextActionPhase();

                // should no longer have sentinel
                context.player1.passAction();
                context.player2.clickCard(context.battlefieldMarine);
                expect(context.player2).toBeAbleToSelectExactly([context.remoteEscortTank, context.sabineWren, context.p1Base]);
                context.player2.clickCard(context.p1Base);
            });
        });
    });
});
