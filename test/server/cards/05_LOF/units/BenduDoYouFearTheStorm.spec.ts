describe('Bendu Do You Fear The Storm?', function () {
    integration(function (contextRef) {
        it('Bendu\'s ability should deal 3 damage to each other unit when it attacks', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['bendu#do-you-fear-the-storm', 'perimeter-atrt'],
                    spaceArena: ['bright-hope#the-last-transport'],
                    discard: ['yoda#old-master']
                },
                player2: {
                    groundArena: ['jango-fett#renowned-bounty-hunter'],
                    spaceArena: ['ig2000#assassins-aggressor']
                }
            });

            const { context } = contextRef;

            // Trigger Bendu's attack
            context.player1.clickCard(context.benduDoYouFearTheStorm);
            context.player1.clickCard(context.p2Base);

            expect(context.player2).toBeActivePlayer();

            // Verify damage to all other units
            expect(context.perimeterAtrt.damage).toBe(3);
            expect(context.jangoFett.damage).toBe(3);
            expect(context.brightHope.damage).toBe(3);
            expect(context.ig2000.damage).toBe(3);
            expect(context.bendu.damage).toBe(0);
        });
    });
});