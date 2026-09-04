describe('Krrsantan, Santo', function() {
    integration(function(contextRef) {
        describe('Krrsantan\'s When Played ability', function() {
            it('should deal damage equal to resources minus 3 to a ground unit (8 resources)', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['krrsantan#santo'],
                        resources: 8,
                        groundArena: ['wampa'],
                        spaceArena: ['awing']
                    },
                    player2: {
                        groundArena: ['giant-gorax']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.krrsantanSanto);

                expect(context.player1).toHavePrompt('Deal 5 damage to a ground unit');
                expect(context.player1).toHavePassAbilityButton();
                expect(context.player1).toBeAbleToSelectExactly([context.krrsantanSanto, context.wampa, context.giantGorax]);

                context.player1.clickCard(context.giantGorax);

                expect(context.giantGorax.damage).toBe(5);
                expect(context.player2).toBeActivePlayer();
            });

            it('should deal damage equal to resources minus 3 to a ground unit (4 resources)', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['krrsantan#santo'],
                        leader: 'saw-gerrera#bring-down-the-empire',
                        resources: 4,
                        groundArena: ['wampa'],
                        spaceArena: ['awing']
                    },
                    player2: {
                        groundArena: ['giant-gorax']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.krrsantanSanto);

                expect(context.player1).toHavePrompt('Deal 1 damage to a ground unit');
                expect(context.player1).toBeAbleToSelectExactly([context.krrsantanSanto, context.wampa, context.giantGorax]);
                expect(context.player1).toHavePassAbilityButton();

                context.player1.clickCard(context.giantGorax);

                expect(context.giantGorax.damage).toBe(1);
                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});
