describe('Wat Tambor, Warped Warbling', function() {
    integration(function(contextRef) {
        describe('Wat Tambor\'s when played ability', function() {
            it('should initiate an attack with a friendly unit', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['wampa'],
                        spaceArena: ['awing'],
                        hand: ['wat-tambor#warped-warbling']
                    },
                    player2: {
                        groundArena: ['atst']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.watTambor);
                expect(context.player1).toBeAbleToSelectExactly([context.awing, context.wampa]);
                expect(context.player1).toHavePassAbilityButton();

                context.player1.clickCard(context.wampa);
                context.player1.clickCard(context.p2Base);

                expect(context.player2).toBeActivePlayer();
                expect(context.p2Base.damage).toBe(4);
            });

            it('should be able to attack with itself when played ready', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['wampa'],
                        hand: ['sneak-attack', 'wat-tambor#warped-warbling']
                    },
                    player2: {
                        groundArena: ['atst']
                    }
                });

                const { context } = contextRef;

                // Play Wat Tambor with Sneak Attack so he enters play ready
                context.player1.clickCard(context.sneakAttack);
                context.player1.clickCard(context.watTambor);

                expect(context.watTambor.exhausted).toBeFalse();

                expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.watTambor]);

                context.player1.clickCard(context.watTambor);
                context.player1.clickCard(context.p2Base);

                expect(context.p2Base.damage).toBe(4);
            });
        });
    });
});
