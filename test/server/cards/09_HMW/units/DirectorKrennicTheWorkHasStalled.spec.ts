describe('Director Krennic, The Work Has Stalled', function() {
    integration(function(contextRef) {
        it('Director Krennic\'s ability should draw a card if base is upgraded', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['trap-field'],
                    groundArena: ['director-krennic#the-work-has-stalled'],
                    deck: ['porg', 'rey#skywalker']
                },
            });

            const { context } = contextRef;

            context.player1.clickCard(context.trapField);
            context.player1.clickCard(context.p1Base);

            context.player2.passAction();

            context.player1.clickCard(context.directorKrennic);
            context.player1.clickCard(context.p2Base);

            expect(context.player2).toBeActivePlayer();
            expect(context.porg).toBeInZone('hand', context.player1);
            expect(context.rey).toBeInZone('deck', context.player1);
            expect(context.player1.handSize).toBe(1);
        });

        it('Director Krennic\'s ability should not draw a card if base is not upgraded', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['director-krennic#the-work-has-stalled'],
                    deck: ['porg', 'rey#skywalker']
                },
                player2: {
                    hand: ['trap-field'],
                    hasInitiative: true,
                }
            });

            const { context } = contextRef;

            context.player2.clickCard(context.trapField);
            context.player2.clickCard(context.p2Base);

            context.player1.clickCard(context.directorKrennic);
            context.player1.clickCard(context.p2Base);

            expect(context.player2).toBeActivePlayer();
            expect(context.porg).toBeInZone('deck', context.player1);
            expect(context.rey).toBeInZone('deck', context.player1);
        });
    });
});
