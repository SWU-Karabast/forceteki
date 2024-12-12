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

                it('should draw nothing when played if empty deck', function () {
                    const { context } = contextRef;
                    context.player1.setDeck([]);
                    context.player1.clickCard(context.favorableDelegate);
                    expect(context.player1.handSize).toBe(0);
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
                const prompt = 'Discard a card from your hand.';

                // Atacking Delegate to trigger the When defeated ability
                context.player2.clickCard(context.maceWindu);
                context.player2.clickCard(context.favorableDelegate);

                // Trying to select the card to discard in my hand
                expect(context.player1).toHavePrompt(prompt);
                expect(context.player1.handSize).toBe(0);
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