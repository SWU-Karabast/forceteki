describe('I\'ll Cover For You', function() {
    integration(function(contextRef) {
        describe('I\'ll Cover For You\'s ability', function() {
            it('should deal damage to 2 different units', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['ill-cover-for-you'],
                        groundArena: ['wampa'],
                    },
                    player2: {
                        groundArena: ['atst', 'darth-vader#twilight-of-the-apprentice'],
                        spaceArena: ['tie-bomber']
                    }
                });
                const { context } = contextRef;

                context.player1.clickCard(context.illCoverForYou);
                expect(context.player1).toBeAbleToSelectExactly([context.atst, context.darthVader, context.tieBomber]);

                context.player1.clickCard(context.atst);
                context.player1.clickCard(context.tieBomber);
                context.player1.clickDone();

                expect(context.player2).toBeActivePlayer();
                expect(context.atst.damage).toBe(1);
                expect(context.tieBomber.damage).toBe(1);
            });

            it('should deal damage to the only enemy unit', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['ill-cover-for-you'],
                        groundArena: ['wampa'],
                    },
                    player2: {
                        groundArena: ['atst']
                    }
                });
                const { context } = contextRef;

                context.player1.clickCard(context.illCoverForYou);
                expect(context.player1).toBeAbleToSelectExactly([context.atst]);

                context.player1.clickCard(context.atst);

                expect(context.player2).toBeActivePlayer();
                expect(context.atst.damage).toBe(1);
            });
        });
    });
});