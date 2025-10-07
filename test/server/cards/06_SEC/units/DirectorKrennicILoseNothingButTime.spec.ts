describe('Director Krennic, I Lose Nothing But Time', function() {
    integration(function(contextRef) {
        it('Director Krennic should discard the top card of deck and may return it to hand if it is a unit', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['director-krennic#i-lose-nothing-but-me'],
                    deck: ['battlefield-marine'],
                },
                player2: {
                    groundArena: ['atst'],
                    hasInitiative: true,
                }
            });

            const { context } = contextRef;

            context.player2.clickCard(context.atst);
            context.player2.clickCard(context.directorKrennic);

            expect(context.player1).toHavePassAbilityPrompt('Return the discard card to your hand');
            context.player1.clickPrompt('Trigger');

            expect(context.player1).toBeActivePlayer();
            expect(context.battlefieldMarine).toBeInZone('hand', context.player1);
        });

        it('Director Krennic should discard the top card of deck and can not return it to hand if it is an upgrade', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['director-krennic#i-lose-nothing-but-me'],
                    deck: ['protector'],
                },
                player2: {
                    groundArena: ['atst'],
                    hasInitiative: true,
                }
            });

            const { context } = contextRef;

            context.player2.clickCard(context.atst);
            context.player2.clickCard(context.directorKrennic);

            expect(context.player1).toBeActivePlayer();
            expect(context.protector).toBeInZone('discard', context.player1);
        });

        it('Director Krennic should discard the top card of deck and can not return it to hand if it is an event', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['director-krennic#i-lose-nothing-but-me'],
                    deck: ['resupply'],
                },
                player2: {
                    groundArena: ['atst'],
                    hasInitiative: true,
                }
            });

            const { context } = contextRef;

            context.player2.clickCard(context.atst);
            context.player2.clickCard(context.directorKrennic);

            expect(context.player1).toBeActivePlayer();
            expect(context.resupply).toBeInZone('discard', context.player1);
        });
    });
});