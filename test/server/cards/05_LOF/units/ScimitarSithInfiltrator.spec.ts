describe('Scimitar, Sith Infiltrator', function() {
    integration(function(contextRef) {
        it('Scimitar\'s ability should get +3/+0 while damaged', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['daring-raid'],
                },
                player2: {
                    spaceArena: ['scimitar#sith-infiltrator'],
                }
            });

            const { context } = contextRef;

            expect(context.scimitar.getPower()).toBe(3);
            expect(context.scimitar.getHp()).toBe(4);

            context.player1.clickCard(context.daringRaid);
            context.player1.clickCard(context.scimitar);

            expect(context.scimitar.getPower()).toBe(6);
            expect(context.scimitar.remainingHp).toBe(2);
        });
    });
});