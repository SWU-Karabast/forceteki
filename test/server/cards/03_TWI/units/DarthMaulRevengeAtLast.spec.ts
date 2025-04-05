describe('Darth Maul, Revenge At Last', function() {
    integration(function(contextRef) {
        it('should not be prompted to select multiple targets when there are no enemy units', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['darth-maul#revenge-at-last'],
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.darthMaul);
            expect(context.player1).toBeAbleToSelectExactly([context.p2Base]);
            context.player1.clickCard(context.p2Base);
            expect(context.p2Base.damage).toBe(5);
        });

        it('should not be prompted to select multiple targets when there is only one enemy unit', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['darth-maul#revenge-at-last'],
                },
                player2: {
                    groundArena: ['wampa']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.darthMaul);
            context.player1.clickCard(context.wampa);
            expect(context.darthMaul.damage).toBe(4);
            expect(context.wampa).toBeInZone('discard');
        });

        it('should not be prompted to select multiple targets when there is only one enemy ground unit', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['darth-maul#revenge-at-last'],
                },
                player2: {
                    groundArena: ['wampa'],
                    spaceArena: ['cartel-turncoat']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.darthMaul);
            context.player1.clickCard(context.wampa);
            expect(context.darthMaul.damage).toBe(4);
            expect(context.wampa).toBeInZone('discard');
        });

        it('should be able to attack multiple units', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['darth-maul#revenge-at-last'],
                },
                player2: {
                    groundArena: ['moisture-farmer', 'wampa']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.darthMaul);
            expect(context.player1).not.toHaveEnabledPromptButton('Done');
            expect(context.player1).toBeAbleToSelectExactly([context.moistureFarmer, context.wampa, context.p2Base]);
            context.player1.clickCard(context.moistureFarmer);
            context.player1.clickCard(context.wampa);
            context.player1.clickPrompt('Done');

            expect(context.darthMaul.damage).toBe(4);
            expect(context.moistureFarmer).toBeInZone('discard');
            expect(context.wampa).toBeInZone('discard');
            expect(context.p2Base.damage).toBe(0);
        });
    });
});
