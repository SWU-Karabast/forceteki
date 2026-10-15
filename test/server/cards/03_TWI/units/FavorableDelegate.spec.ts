describe('Favorable Delegate\'s', function () {
    integration(function (contextRef) {
        describe('abilities', function () {
            it('should draw a card when played and discard when defeated', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['favorable-delegate']
                    },
                    player2: {
                        leader: { card: 'mace-windu#vaapad-form-master', deployed: true },
                    },
                    autoSingleTarget: true
                });
                const { context } = contextRef;

                // Check card drawn when played
                context.player1.clickCard(context.favorableDelegate);
                expect(context.player1.handSize).toBe(1);
                expect(context.player2).toBeActivePlayer();

                // Check card discarded when defeated
                context.player2.clickCard(context.maceWindu);
                context.player2.clickCard(context.favorableDelegate);
                expect(context.player1.handSize).toBe(0);
                expect(context.player1).toBeActivePlayer();
            });

            it('should discard nothing if empty hand', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['favorable-delegate']
                    },
                    player2: {
                        leader: { card: 'mace-windu#vaapad-form-master', deployed: true },
                        hasInitiative: true,
                    },
                    autoSingleTarget: true
                });
                const { context } = contextRef;
                context.player1.setHand([]);

                // Attacking Delegate to trigger the When defeated ability
                context.player2.clickCard(context.maceWindu);
                context.player2.clickCard(context.favorableDelegate);
                expect(context.player1.handSize).toBe(0);
                expect(context.player1).toBeActivePlayer();
            });

            it('should make the new controller discard when defeated with No Glory, Only Results', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['wampa'],
                        groundArena: ['favorable-delegate']
                    },
                    player2: {
                        hand: ['no-glory-only-results', 'atst'],
                        hasInitiative: true,
                    }
                });
                const { context } = contextRef;

                context.player2.clickCard(context.noGloryOnlyResults);
                context.player2.clickCard(context.favorableDelegate);

                expect(context.favorableDelegate).toBeInZone('discard', context.player1);

                // Player 2 controlled the Delegate when it was defeated, so they discard from their hand
                expect(context.player2).toBeAbleToSelectExactly([context.atst]);
                context.player2.clickCard(context.atst);

                expect(context.atst).toBeInZone('discard', context.player2);
                expect(context.player2.handSize).toBe(0);
                expect(context.wampa).toBeInZone('hand', context.player1);
                expect(context.player1.handSize).toBe(1);
                expect(context.player1).toBeActivePlayer();
            });
        });
    });
});