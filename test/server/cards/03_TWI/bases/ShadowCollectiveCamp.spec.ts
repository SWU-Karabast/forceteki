describe('Shadow Collective Camp', function () {
    integration(function (contextRef) {
        it('Shadow Collective Camp\'s ability should draw a card when leader deploys', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['battlefield-marine'],
                    base: 'shadow-collective-camp',
                    leader: { card: 'rey#more-than-a-scavenger', deployed: false }
                },
                player2: {
                    leader: { card: 'nala-se#clone-engineer', deployed: false },
                    hasInitiative: true,
                    hand: ['pyke-sentinel'],
                }
            });

            const { context } = contextRef;
            context.player2.clickCard(context.nalaSe);
            expect(context.player2.handSize).toBe(1);

            context.player1.clickCard(context.battlefieldMarine);
            expect(context.player1.handSize).toBe(0);

            context.player2.clickCard(context.pykeSentinel);
            expect(context.player2.handSize).toBe(0);

            context.player1.clickCard(context.rey);
            context.player1.clickPrompt('Deploy Rey');
            expect(context.player1.handSize).toBe(1);
        });
    });
});
