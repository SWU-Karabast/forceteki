describe('Director Krennic, Architect of Annihilation', function() {
    integration(function(contextRef) {
        it('should allow the controller to play a unit that costs 7 or less from hand for 2 resources less', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['atst', 'coastal-catamarans', 'reinforcement-walker', 'maximum-firepower'],
                    groundArena: ['director-krennic#architect-of-annihilation'],
                    resources: 8,
                },
            });
            const { context } = contextRef;

            context.player1.clickCard(context.directorKrennic);
            expect(context.player1).toHaveEnabledPromptButtons(['Play a unit that costs 7 or less from your hand. It costs 2 resources less', 'Attack']);

            context.player1.clickPrompt('Play a unit that costs 7 or less from your hand. It costs 2 resources less');
            expect(context.directorKrennic.exhausted).toBe(true);

            // AT-ST (6) and Coastal Catamarans (7) cost 7 or less; Reinforcement Walker costs 8 and Maximum Firepower is not a unit
            expect(context.player1).toBeAbleToSelectExactly([context.atst, context.coastalCatamarans]);
            context.player1.clickCard(context.atst);

            expect(context.atst).toBeInZone('groundArena');
            expect(context.player1.exhaustedResourceCount).toBe(4);
            expect(context.player2).toBeActivePlayer();
        });

        it('should reduce the cost to 0 for a unit that costs 2', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['snowtrooper-lieutenant'],
                    groundArena: ['director-krennic#architect-of-annihilation'],
                    resources: 4,
                },
            });
            const { context } = contextRef;

            context.player1.clickCard(context.directorKrennic);
            context.player1.clickPrompt('Play a unit that costs 7 or less from your hand. It costs 2 resources less');

            expect(context.player1).toBeAbleToSelectExactly([context.snowtrooperLieutenant]);
            context.player1.clickCard(context.snowtrooperLieutenant);

            expect(context.snowtrooperLieutenant).toBeInZone('groundArena');
            expect(context.player1.exhaustedResourceCount).toBe(0);
            expect(context.player2).toBeActivePlayer();
        });
    });
});
