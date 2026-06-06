describe('Carson Teva, There\'s Something Going On', function() {
    integration(function(contextRef) {
        it('should work with support', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['carson-teva#theres-something-going-on'],
                    groundArena: ['wampa']
                },
                player2: {
                    groundArena: ['battlefield-marine'],
                    spaceArena: ['awing']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.carsonTeva);
            context.player1.clickCard(context.wampa);
            context.player1.clickCard(context.battlefieldMarine);

            expect(context.player2).toBeActivePlayer();
            expect(context.battlefieldMarine).toBeInZone('discard');
            expect(context.wampa.damage).toBe(0);
        });

        it('should prevent damage if he attacks and defeats a unit', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['wampa', 'carson-teva#theres-something-going-on']
                },
                player2: {
                    groundArena: ['porg'],
                    spaceArena: ['awing']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.carsonTeva);
            context.player1.clickCard(context.porg);

            expect(context.player2).toBeActivePlayer();
            expect(context.porg).toBeInZone('discard');
            expect(context.carsonTeva.damage).toBe(0);
        });
    });
});