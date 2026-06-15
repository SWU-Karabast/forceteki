describe('Executioner\'s Arena', function() {
    integration(function(contextRef) {
        describe('Executioner\'s Arena\'s Epic Action', function() {
            it('should deal 2 damage to a unit for each friendly leader unit', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        base: 'executioners-arena',
                        leader: { card: 'darth-vader#dark-lord-of-the-sith', deployed: true },
                        groundArena: ['wampa'],
                        spaceArena: ['awing']
                    },
                    player2: {
                        groundArena: ['battlefield-marine'],
                        leader: { card: 'chewbacca#walking-carpet', deployed: true },
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.executionersArena);
                expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.battlefieldMarine, context.awing, context.darthVader, context.chewbacca]);
                expect(context.player1).toHaveChooseNothingButton();
                context.player1.clickCard(context.battlefieldMarine);

                expect(context.player2).toBeActivePlayer();
                expect(context.battlefieldMarine.damage).toBe(2);
                expect(context.executionersArena.epicActionSpent).toBeTrue();
            });

            it('should not deal damage when there are no friendly leader units', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        base: 'executioners-arena',
                        groundArena: ['wampa'],
                    },
                    player2: {
                        groundArena: ['battlefield-marine'],
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.executionersArena);
                context.player1.clickPrompt('Use it anyway');

                expect(context.player2).toBeActivePlayer();
                expect(context.executionersArena.epicActionSpent).toBeTrue();
            });
        });
    });
});
