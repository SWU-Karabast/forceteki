describe('Favorable Delegate\'s', function () {
    integration(function (contextRef) {
        describe('abilities', function () {
            it('should draw a card when played and discard when defeated', function () {
                contextRef.setupTest({
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

            it('should discard nothing if empty hand', function () {
                contextRef.setupTest({
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
        });
    });
});