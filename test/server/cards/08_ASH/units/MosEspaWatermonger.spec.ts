describe('Mos Espa Watermonger', function() {
    integration(function(contextRef) {
        describe('Mos Espa Watermonger\'s ability', function() {
            it('should draw a card and then discard a card', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['mos-espa-watermonger', 'vanquish'],
                        deck: ['atst']
                    },
                });

                const { context } = contextRef;

                context.player1.clickCard(context.mosEspaWatermonger);
                context.player1.clickPrompt('Trigger');
                expect(context.vanquish).toBeInZone('hand', context.player1);
                expect(context.atst).toBeInZone('hand', context.player1);

                expect(context.player1.handSize).toBe(2);
                expect(context.player1).toHavePrompt('Choose a card to discard for Mos Espa Watermonger\'s effect');
                expect(context.player1).not.toHaveChooseNothingButton();
                expect(context.player1).toBeAbleToSelectExactly([context.vanquish, context.atst]);
                context.player1.clickCard(context.vanquish);

                expect(context.vanquish).toBeInZone('discard', context.player1);
                expect(context.atst).toBeInZone('hand', context.player1);
                expect(context.player1.handSize).toBe(1);
                expect(context.player2).toBeActivePlayer();
            });

            it('should draw no cards and damage base for 3 if no cards in deck and also discard', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['mos-espa-watermonger', 'vanquish'],
                        deck: []
                    },
                });

                const { context } = contextRef;

                context.player1.clickCard(context.mosEspaWatermonger);
                context.player1.clickPrompt('Trigger');
                expect(context.player1).toBeAbleToSelectExactly([context.vanquish]);
                context.player1.clickCard(context.vanquish);

                expect(context.vanquish).toBeInZone('discard', context.player1);
                expect(context.player1.handSize).toBe(0);
                expect(context.p1Base.damage).toBe(3);
                expect(context.player2).toBeActivePlayer();
            });

            it('should be able to be passed', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['mos-espa-watermonger', 'vanquish'],
                        deck: ['atst']
                    },
                });

                const { context } = contextRef;

                context.player1.clickCard(context.mosEspaWatermonger);
                context.player1.clickPrompt('Pass');

                expect(context.vanquish).toBeInZone('hand', context.player1);
                expect(context.atst).toBeInZone('deck', context.player1);
                expect(context.player1.handSize).toBe(1);
                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});