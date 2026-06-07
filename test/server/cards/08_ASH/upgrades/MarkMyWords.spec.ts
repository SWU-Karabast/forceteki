describe('Mark My Words', function() {
    integration(function(contextRef) {
        describe('Mark My Words\'s ability', function() {
            it('should attach to a damaged unit', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['mark-my-words'],
                        groundArena: [{ card: 'battlefield-marine', damage: 2 }, 'wampa'],
                        spaceArena: [{ card: 'awing', damage: 1 }]
                    },
                    player2: {
                        groundArena: [{ card: 'atst', damage: 1 }],
                    },
                });

                const { context } = contextRef;

                context.player1.clickCard(context.markMyWords);
                expect(context.player1).toBeAbleToSelectExactly([context.awing, context.atst, context.battlefieldMarine]);
                context.player1.clickCard(context.battlefieldMarine);

                expect(context.player2).toBeActivePlayer();
            });
        });

        it('should grant Overwhelm to the attached unit', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: [{ card: 'battlefield-marine', damage: 1, upgrades: ['mark-my-words'] }],
                },
                player2: {
                    groundArena: ['porg'],
                },
            });

            const { context } = contextRef;

            context.player1.clickCard(context.battlefieldMarine);
            context.player1.clickCard(context.porg);

            expect(context.player2).toBeActivePlayer();
            expect(context.p2Base.damage).toBe(4);
        });
    });
});
