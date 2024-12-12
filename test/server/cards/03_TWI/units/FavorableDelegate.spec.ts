describe('Favorable Delegate', function () {
    integration(function (contextRef) {
        describe('Favorable Delegate\'s ability', function () {
            describe('When played ability', function () {
                beforeEach(function () {
                    contextRef.setupTest({
                        phase: 'action',
                        player1: {
                            hand: ['favorable-delegate']
                        },
                    });
                });

                it('should draw a card when played', function () {
                    const { context } = contextRef;

                    context.player1.clickCard(context.favorableDelegate);
                    expect(context.player1.handSize).toBe(1);
                });
            });
        });
        describe('When defeated ability', function () {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['royal-guard-attache'],
                        groundArena: ['favorable-delegate']
                    },
                    player2: {
                        leader: { card: 'mace-windu#vaapad-form-master', deployed: true },
                        hasInitiative: true
                    },
                    autoSingleTarget: true
                });
            });

            it('should discard a card', function () {
                const { context } = contextRef;
                const handRoyalGuardAttache = context.player1.findCardByName('royal-guard-attache', 'hand');

                // Atacking Delegate to trigger the When defeated ability
                context.player2.clickCard(context.maceWindu);
                context.player2.clickCard(context.favorableDelegate);

                // Checking if card got discarded correctly
                expect(context.player1.handSize).toBe(0);
                expect(handRoyalGuardAttache).toBeInZone('discard');
                expect(context.player1).toBeActivePlayer();
            });

            it('should discard nothing if empty hand', function () {
                const { context } = contextRef;
                context.player1.setHand([]);

                // Atacking Delegate to trigger the When defeated ability
                context.player2.clickCard(context.maceWindu);
                context.player2.clickCard(context.favorableDelegate);
                expect(context.player1.handSize).toBe(0);
                expect(context.player1).toBeActivePlayer();
            });
        });
    });
});