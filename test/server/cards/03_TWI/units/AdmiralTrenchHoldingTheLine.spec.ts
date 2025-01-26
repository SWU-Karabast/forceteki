describe('Admiral Trench, Holding the Line', function () {
    integration(function (contextRef) {
        beforeEach(function () {
            contextRef.setupTest({
                phase: 'action',
                player1: {
                    base: 'maz-kanatas-castle',
                    leader: 'qira#i-alone-survived',
                    hand: ['superlaser-blast'],
                    groundArena: ['pyke-sentinel'],
                },
                player2: {
                    base: 'lair-of-grievous',
                    leader: 'general-grievous#general-of-the-droid-armies',
                    hand: ['admiral-trench#holding-the-line'],
                    groundArena: ['death-star-stormtrooper', 'maul#shadow-collective-visionary'],
                    discard: ['open-fire', 'zuckuss#bounty-hunter-for-hire', 'fallen-lightsaber']
                }
            });
        });

        it('should return up to 3 units defeated this phase to player hand from a discard pile', function () {
            const { context } = contextRef;

            context.player1.clickCard(context.superlaserBlast);
            expect(context.player2).toBeActivePlayer();

            context.player2.clickCard(context.admiralTrenchHoldingTheLine);
            expect(context.player2).toHavePrompt('Select 3 cards');
            expect(context.player2).toBeAbleToSelectExactly([context.deathStarStormtrooper, context.maul]);
            expect(context.player2).toHaveEnabledPromptButtons(['Done', 'Choose no target']);

            context.player2.clickCard(context.deathStarStormtrooper);
            context.player2.clickCard(context.maul);
            context.player2.clickPrompt('Done');

            expect(context.player2.hand).toContain(context.deathStarStormtrooper);
            expect(context.player2.hand).toContain(context.maul);
        });

        it('should return no units since none where defeated this phase', function () {
            const { context } = contextRef;

            context.player1.clickCard(context.pykeSentinel);
            context.player1.clickCard(context.p2Base);
            expect(context.player2).toBeActivePlayer();

            context.player2.clickCard(context.admiralTrenchHoldingTheLine);
            context.player2.clickPrompt('Play Admiral Trench');
            expect(context.player1).toBeActivePlayer();

            expect(context.player2.hand).toEqual([]);
        });
    });
});
