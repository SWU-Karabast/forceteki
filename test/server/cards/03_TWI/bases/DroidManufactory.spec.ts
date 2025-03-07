describe('Droid Manufactory', function () {
    integration(function (contextRef) {
        it('Droid Manufactory\'s ability should create 2 battle droid tokens when leader deploys', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['battlefield-marine'],
                    base: 'droid-manufactory',
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
            const battleDroidsP2 = context.player2.findCardsByName('battle-droid');
            expect(battleDroidsP2.length).toBe(0);

            context.player1.clickCard(context.battlefieldMarine);
            const battleDroidsP1 = context.player2.findCardsByName('battle-droid');
            expect(battleDroidsP1.length).toBe(0);

            context.player2.clickCard(context.pykeSentinel);
            const battleDroidsP22 = context.player2.findCardsByName('battle-droid');
            expect(battleDroidsP22.length).toBe(0);

            context.player1.clickCard(context.rey);
            context.player1.clickPrompt('Deploy Rey');
            const battleDroids = context.player1.findCardsByName('battle-droid');
            expect(battleDroids.length).toBe(2);
        });
    });
});
