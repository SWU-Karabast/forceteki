describe('Bestial Bond', function() {
    integration(function(contextRef) {
        it('should create a Beast token when attached to a Creature unit', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['bestial-bond'],
                    groundArena: ['wampa'],
                },
            });

            const { context } = contextRef;

            context.player1.clickCard(context.bestialBond);
            context.player1.clickCard(context.wampa);

            const beast = context.player1.findCardByName('beast');
            expect(beast).toBeInZone('groundArena', context.player1);
            expect(context.wampa).toHaveExactUpgradeNames(['bestial-bond']);
            expect(context.player2).toBeActivePlayer();
        });

        it('should create a Beast token when attached to a Force unit', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['bestial-bond'],
                    groundArena: ['adept-of-anger'],
                },
            });

            const { context } = contextRef;

            context.player1.clickCard(context.bestialBond);
            context.player1.clickCard(context.adeptOfAnger);

            const beast = context.player1.findCardByName('beast');
            expect(beast).toBeInZone('groundArena', context.player1);
            expect(context.adeptOfAnger).toHaveExactUpgradeNames(['bestial-bond']);
            expect(context.player2).toBeActivePlayer();
        });

        it('should not create a Beast token when attached to a non-Creature, non-Force unit', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['bestial-bond'],
                    groundArena: ['battlefield-marine'],
                },
                player2: {
                    groundArena: ['wampa', 'rey#skywalker']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.bestialBond);
            context.player1.clickCard(context.battlefieldMarine);

            expect(() => context.player1.findCardByName('beast')).toThrowError('Could not find any cards matching name beast');
            expect(context.battlefieldMarine).toHaveExactUpgradeNames(['bestial-bond']);
            expect(context.player2).toBeActivePlayer();
        });
    });
});
