describe('Retrofitted Airspeeder', function () {
    integration(function (contextRef) {
        beforeEach(function () {
            return contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['retrofitted-airspeeder'],
                },
                player2: {
                    groundArena: [{ card: 'cell-block-guard', upgrades: ['experience'] }, 'wampa'],
                    spaceArena: ['omicron-strike-craft', 'cartel-spacer'],
                }
            });
        });

        it('can attack ground units without getting -1/-0', function () {
            const { context } = contextRef;

            context.player1.clickCard(context.retrofittedAirspeeder);
            context.player1.clickPrompt('Trigger');

            expect(context.player1).toBeAbleToSelectExactly([context.cellBlockGuard, context.omicronStrikeCraft]);

            context.player1.clickCard(context.cellBlockGuard);

            expect(context.cellBlockGuard.damage).toBe(3);
            expect(context.retrofittedAirspeeder.damage).toBe(4);
        });

        it('can attack space units getting -1/-0', function () {
            const { context } = contextRef;

            context.player1.clickCard(context.retrofittedAirspeeder);
            context.player1.clickPrompt('Trigger');

            expect(context.player1).toBeAbleToSelectExactly([context.cellBlockGuard, context.omicronStrikeCraft]);

            context.player1.clickCard(context.omicronStrikeCraft);

            expect(context.omicronStrikeCraft.damage).toBe(2);
            expect(context.retrofittedAirspeeder.damage).toBe(2);
        });
    });
});
