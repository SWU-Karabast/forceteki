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
            context.player2.clickPrompt('Deploy Nala Se');
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

        it('should create 2 battle droid tokens each time one of two leaders deploys in Faux Suns', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                format: 'fauxSuns',
                player1: {
                    base: 'droid-manufactory',
                    leader: { card: 'rey#more-than-a-scavenger', deployed: false },
                    secondLeader: { card: 'nala-se#clone-engineer', deployed: false }
                },
                player2: {
                    leader: 'luke-skywalker#faithful-friend',
                    // actions to take between deploys (in Faux Suns you can't pass while claim tokens are unclaimed)
                    hand: ['battlefield-marine', 'wampa']
                }
            });

            const { context } = contextRef;

            // Deploy the first leader → 2 Battle Droids
            context.player1.clickCard(context.rey);
            context.player1.clickPrompt('Deploy Rey');
            expect(context.player1.findCardsByName('battle-droid').length).toBe(2);

            // Opponent takes an action
            context.player2.clickCard(context.battlefieldMarine);

            // Deploy the second leader → 2 more Battle Droids (4 total)
            context.player1.clickCard(context.nalaSe);
            context.player1.clickPrompt('Deploy Nala Se');
            expect(context.player1.findCardsByName('battle-droid').length).toBe(4);
        });
    });
});
