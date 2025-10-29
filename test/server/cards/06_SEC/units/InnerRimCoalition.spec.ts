describe('Inner Rim Coalition', function() {
    integration(function(contextRef) {
        describe('Inner Rim Coalition\'s ability -', function() {
            it('should ready a unit cost 5 or less', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['moisture-farmer', 'inner-rim-coalition'],
                        spaceArena: ['cartel-spacer']
                    },
                    player2: {
                        groundArena: [{ card: 'battlefield-marine', exhausted: true }, 'kelleran-beq#the-sabered-hand'],
                        spaceArena: ['bright-hope#the-last-transport']
                    },
                });

                const { context } = contextRef;

                context.player1.clickCard(context.moistureFarmer);
                context.player1.clickCard(context.p2Base);

                context.player2.clickCard(context.kelleranBeq);
                context.player2.clickCard(context.innerRimCoalition);
                expect(context.innerRimCoalition).toBeInZone('discard');
                expect(context.kelleranBeq.damage).toBe(6);

                expect(context.player1).toHavePassAbilityButton();
                expect(context.player1).toBeAbleToSelectExactly([context.brightHope, context.battlefieldMarine, context.cartelSpacer, context.moistureFarmer]);
                context.player1.clickCard(context.moistureFarmer);
            });

            it('should work with No Glory, Only Results', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['moisture-farmer', 'inner-rim-coalition'],
                        spaceArena: ['cartel-spacer']
                    },
                    player2: {
                        leader: { card: 'admiral-piett#commanding-the-armada', exhausted: true, deployed: true },
                        hand: ['no-glory-only-results'],
                        hasInitiative: true
                    }
                });

                const { context } = contextRef;

                context.player2.clickCard(context.noGloryOnlyResults);
                context.player2.clickCard(context.innerRimCoalition);
                context.player2.clickCard(context.admiralPiett);
                expect(context.admiralPiett.exhausted).toBe(false);

                context.player1.passAction();
            });
        });
    });
});