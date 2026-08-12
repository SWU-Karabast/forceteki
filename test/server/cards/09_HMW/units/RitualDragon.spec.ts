describe('Ritual Dragon', function() {
    integration(function(contextRef) {
        describe('Ritual Dragon\'s ability', function() {
            it('should enter play ready when you control a Tatooine base', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['ritual-dragon', 'porg', 'wampa'],
                        base: 'dune-sea'
                    },
                    player2: {
                        hand: ['atst'],
                        base: 'jabbas-palace'
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.ritualDragon);
                expect(context.ritualDragon.exhausted).toBeFalse();

                context.player2.clickCard(context.atst);
                expect(context.atst.exhausted).toBeTrue();

                context.player1.clickCard(context.porg);
                expect(context.porg.exhausted).toBeFalse();

                context.moveToNextActionPhase();

                context.player1.clickCard(context.wampa);
                expect(context.wampa.exhausted).toBeFalse();
            });

            it('should enter play ready when you control a Tatooine base', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['dryden-vos#offering-no-escape', 'discerning-veteran'],
                        groundArena: ['ritual-dragon'],
                        base: 'dune-sea'
                    },
                    player2: {
                        groundArena: ['atst'],
                        base: 'jabbas-palace'
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.discerningVeteran);
                context.player1.clickCard(context.atst);

                context.player2.passAction();

                context.player1.clickCard(context.drydenVos);
                context.player1.clickPrompt('Shielded');
                context.player1.clickCard(context.atst);

                expect(context.atst.exhausted).toBeFalse();
            });

            it('should not enter play ready when you do not control a Tatooine base', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['ritual-dragon'],
                        base: 'energy-conversion-lab'
                    },
                    player2: {
                        base: 'dune-sea'
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.ritualDragon);
                expect(context.ritualDragon.exhausted).toBeTrue();
            });
        });
    });
});
