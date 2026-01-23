describe('Thats A Rock', function() {
    integration(function(contextRef) {
        describe('Thats A Rock\'s ability', function() {
            it('can deal damage to a unit', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['thats-a-rock'],
                        groundArena: ['pyke-sentinel'],
                        spaceArena: ['cartel-spacer']
                    },
                    player2: {
                        groundArena: ['wampa'],
                        spaceArena: ['imperial-interceptor']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.thatsARock);
                expect(context.player1).toBeAbleToSelectExactly([context.pykeSentinel, context.cartelSpacer, context.wampa, context.imperialInterceptor]);

                context.player1.clickCard(context.wampa);
                expect(context.wampa.damage).toBe(1);
            });

            it('can deal damage to a unit when discarded from hand', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['thats-a-rock'],
                        groundArena: ['pyke-sentinel'],
                        spaceArena: ['cartel-spacer']
                    },
                    player2: {
                        groundArena: ['wampa'],
                        spaceArena: ['imperial-interceptor'],
                        hand: ['spark-of-rebellion']
                    }
                });

                const { context } = contextRef;

                context.player1.passAction();
                context.player2.clickCard(context.sparkOfRebellion);
                context.player2.clickCardInDisplayCardPrompt(context.thatsARock);
                expect(context.thatsARock).toBeInZone('discard');

                expect(context.player1).toHavePrompt('Deal 1 damage to a unit.');
                expect(context.player1).toBeAbleToSelectExactly([context.pykeSentinel, context.cartelSpacer, context.wampa, context.imperialInterceptor]);

                context.player1.clickCard(context.wampa);
                expect(context.wampa.damage).toBe(1);
                expect(context.player1).toBeActivePlayer();
            });

            it('can deal damage to a unit when discarded from deck', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        deck: ['thats-a-rock'],
                        groundArena: ['pyke-sentinel'],
                        spaceArena: ['cartel-spacer']
                    },
                    player2: {
                        groundArena: ['wampa'],
                        spaceArena: ['imperial-interceptor'],
                        hand: ['vigilance']
                    }
                });

                const { context } = contextRef;

                context.player1.passAction();
                context.player2.clickCard(context.vigilance);
                context.player2.clickPrompt('Discard 6 cards from an opponent\'s deck.');
                context.player2.clickPrompt('Give a shield token to a unit.');
                context.player2.clickCard(context.imperialInterceptor);

                expect(context.thatsARock).toBeInZone('discard');

                expect(context.player1).toHavePrompt('Deal 1 damage to a unit.');
                expect(context.player1).toBeAbleToSelectExactly([context.pykeSentinel, context.cartelSpacer, context.wampa, context.imperialInterceptor]);

                context.player1.clickCard(context.wampa);
                expect(context.wampa.damage).toBe(1);
                expect(context.player1).toBeActivePlayer();
            });
        });
    });
});
