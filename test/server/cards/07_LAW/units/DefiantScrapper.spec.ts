describe('Defiant Scrapper', function () {
    integration(function (contextRef) {
        it('should be able to defeat an enemy Credit token', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['defiant-scrapper'],
                    credits: 3,
                },
                player2: {
                    credits: 3,
                }
            });

            const { context } = contextRef;
            const p2Credits = context.player2.findCardsByName('credit');

            context.player1.clickCard(context.defiantScrapper);
            context.player1.clickPrompt('Pay costs without Credit tokens');

            expect(context.player1).toHavePassAbilityButton();
            expect(context.player1).toBeAbleToSelectExactly([...p2Credits]);
            context.player1.clickCard(p2Credits[0]);

            expect(context.player1.credits).toBe(3);
            expect(context.player2.credits).toBe(2);
            expect(context.player2).toBeActivePlayer();
        });

        it('should do nothing if enemy has no Credits', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['defiant-scrapper'],
                    credits: 3,
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.defiantScrapper);
            context.player1.clickPrompt('Pay costs without Credit tokens');

            expect(context.player2.credits).toBe(0);
            expect(context.player1.credits).toBe(3);

            expect(context.player2).toBeActivePlayer();
        });

        it('should be able to pass ability', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['defiant-scrapper'],
                    credits: 3,
                },
                player2: {
                    credits: 3,
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.defiantScrapper);
            context.player1.clickPrompt('Pay costs without Credit tokens');

            expect(context.player1).toHavePassAbilityButton();
            expect(context.player1).toHavePrompt('Defeat an enemy Credit token');
            context.player1.clickPrompt('Pass');

            expect(context.player2.credits).toBe(3);
            expect(context.player1.credits).toBe(3);

            expect(context.player2).toBeActivePlayer();
        });
    });
});