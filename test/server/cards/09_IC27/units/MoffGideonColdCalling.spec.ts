describe('Moff Gideon, Cold Calling', function() {
    integration(function(contextRef) {
        it('Moff Gideon should costs 2 resources less if a friendly unit was defeated this phase', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['moff-gideon#cold-calling'],
                    groundArena: ['wampa'],
                    leader: 'baylan-skoll#power-beyond-dream'
                },
                player2: {
                    hand: ['takedown'],
                    hasInitiative: true,
                }
            });
            const { context } = contextRef;

            context.player2.clickCard(context.takedown);
            context.player2.clickCard(context.wampa);

            context.player1.clickCard(context.moffGideon);

            expect(context.player2).toBeActivePlayer();
            expect(context.player1.exhaustedResourceCount).toBe(3);
        });

        it('Moff Gideon should not costs 2 resources less if a friendly unit was defeated a previous phase', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['moff-gideon#cold-calling'],
                    groundArena: ['wampa'],
                    leader: 'baylan-skoll#power-beyond-dream'
                },
                player2: {
                    hand: ['takedown'],
                    hasInitiative: true,
                }
            });
            const { context } = contextRef;

            context.player2.clickCard(context.takedown);
            context.player2.clickCard(context.wampa);

            context.moveToNextActionPhase();

            context.player2.passAction();

            context.player1.clickCard(context.moffGideon);

            expect(context.player2).toBeActivePlayer();
            expect(context.player1.exhaustedResourceCount).toBe(5);
        });

        it('Moff Gideon should costs 2 resources less if a stolen friendly unit was defeated this phase', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['moff-gideon#cold-calling'],
                    groundArena: ['wampa'],
                    leader: 'baylan-skoll#power-beyond-dream'
                },
                player2: {
                    hand: ['no-glory-only-results'],
                    hasInitiative: true,
                }
            });
            const { context } = contextRef;

            context.player2.clickCard(context.noGloryOnlyResults);
            context.player2.clickCard(context.wampa);

            context.player1.clickCard(context.moffGideon);

            expect(context.player2).toBeActivePlayer();
            expect(context.player1.exhaustedResourceCount).toBe(5);
        });

        it('Moff Gideon should costs 2 resources less if a stolen enemy unit was defeated this phase', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['moff-gideon#cold-calling', 'no-glory-only-results'],
                    leader: 'baylan-skoll#power-beyond-dream'
                },
                player2: {
                    groundArena: ['wampa'],
                }
            });
            const { context } = contextRef;

            context.player1.clickCard(context.noGloryOnlyResults);
            context.player1.clickCard(context.wampa);

            context.player2.passAction();

            context.player1.clickCard(context.moffGideon);

            expect(context.player2).toBeActivePlayer();
            expect(context.player1.exhaustedResourceCount).toBe(8);
        });
    });
});
