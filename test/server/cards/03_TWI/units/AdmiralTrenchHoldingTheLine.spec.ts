describe('Admiral Trench, Holding the Line', function () {
    integration(function (contextRef) {
        beforeEach(function () {
            contextRef.setupTest({
                phase: 'action',
                player1: {
                    base: 'spice-mines',
                    leader: 'qira#i-alone-survived',
                    hand: ['superlaser-blast', 'pillage'],
                    groundArena: ['wampa'],
                },
                player2: {
                    base: 'lair-of-grievous',
                    leader: 'darth-vader#dark-lord-of-the-sith',
                    hand: ['admiral-trench#holding-the-line', 'the-emperors-legion', 'death-star-stormtrooper'],
                    groundArena: ['first-legion-snowtrooper', 'maul#shadow-collective-visionary', { card: 'fifth-brother#fear-hunter', upgrades: ['fallen-lightsaber'] }],
                    spaceArena: ['imperial-interceptor'],
                    discard: ['open-fire', 'ruthless-raider']
                }
            });
        });

        it('should return up to 3 units defeated this phase to player hand from a discard pile', function () {
            const { context } = contextRef;

            context.player1.clickCard(context.superlaserBlast);
            expect(context.player2).toBeActivePlayer();

            context.player2.clickCard(context.admiralTrenchHoldingTheLine);
            expect(context.player2).toHavePrompt('Select 3 cards');
            expect(context.player2).toBeAbleToSelectExactly([context.firstLegionSnowtrooper, context.maul, context.fifthBrother, context.imperialInterceptor]);
            expect(context.player2).toHaveEnabledPromptButtons(['Done', 'Choose no target']);

            context.player2.clickCard(context.firstLegionSnowtrooper);
            context.player2.clickCard(context.maul);
            context.player2.clickCard(context.fifthBrother);
            context.player2.clickCardNonChecking(context.imperialInterceptor);
            context.player2.clickPrompt('Done');

            expect(context.player2.hand).toContain(context.firstLegionSnowtrooper);
            expect(context.player2.hand).toContain(context.maul);
            expect(context.player2.hand).toContain(context.fifthBrother);
            expect(context.player2.hand).not.toContain(context.imperialInterceptor);
            expect(context.imperialInterceptor).toBeInZone('discard', context.player2);
        });

        it('should return exploited unit since it was defeated this phase', function () {
            const { context } = contextRef;

            context.player1.passAction();

            context.player2.clickCard(context.admiralTrenchHoldingTheLine);
            context.player2.clickPrompt('Play Admiral Trench using Exploit');

            expect(context.player2).toHavePrompt('Select 1 cards to exploit');

            context.player2.clickCard(context.firstLegionSnowtrooper);
            context.player2.clickPrompt('Done');

            expect(context.player2).toHavePrompt('Select 3 cards');
            expect(context.player2).toBeAbleToSelectExactly([context.firstLegionSnowtrooper]);
            expect(context.player2).toHaveEnabledPromptButtons(['Done', 'Choose no target']);

            context.player2.clickCard(context.firstLegionSnowtrooper);
            context.player2.clickPrompt('Done');

            expect(context.player2.hand).toContain(context.firstLegionSnowtrooper);
        });

        it('should not return that was defeated this phase if it become a new copy of a unit', function () {
            const { context } = contextRef;

            context.player1.clickCard(context.wampa);
            context.player1.clickCard(context.firstLegionSnowtrooper);

            expect(context.firstLegionSnowtrooper).toBeInZone('discard', context.player2);

            context.player2.clickCard(context.theEmperorsLegion);

            expect(context.player2.hand).toContain(context.firstLegionSnowtrooper);

            context.player1.clickCard(context.pillage);
            context.player1.clickPrompt('Opponent');
            context.player2.clickCard(context.deathStarStormtrooper);
            context.player2.clickCard(context.firstLegionSnowtrooper);
            context.player2.clickPrompt('Done');

            expect(context.deathStarStormtrooper).toBeInZone('discard', context.player2);
            expect(context.firstLegionSnowtrooper).toBeInZone('discard', context.player2);

            context.player2.clickCard(context.admiralTrenchHoldingTheLine);
            context.player2.clickPrompt('Play Admiral Trench');

            // Should not be able to return any cards since First Legion Snowtrooper is a new copy and was not defeated this phase
            expect(context.player2).toHavePrompt('Select 3 cards');
            expect(context.player2).toBeAbleToSelectExactly([]);
            expect(context.player2).toHaveEnabledPromptButtons(['Done', 'Choose no target']);

            context.player2.clickPrompt('Choose no target');

            expect(context.player1).toBeActivePlayer();
        });
    });
});
