describe('Plo Koon, I Don\'t Believe in Chance', function() {
    integration(function(contextRef) {
        it('Plo Koon\'s ability should give him Grit while the force if with you', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    base: 'shadowed-undercity',
                    groundArena: [{ card: 'plo-koon#i-dont-believe-in-chance', damage: 1 }],
                },
                player2: {
                    base: 'jedi-temple',
                    hasForceToken: true,
                }
            });

            const { context } = contextRef;

            expect(context.ploKoon.hasSomeKeyword('grit')).toBeFalse();

            context.player1.clickCard(context.ploKoon);
            context.player1.clickCard(context.p2Base);

            expect(context.ploKoon.hasSomeKeyword('grit')).toBeTrue();
            expect(context.p2Base.damage).toBe(7);
        });
    });
});