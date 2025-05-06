describe('Owen Lars, Devoted Uncle', function() {
    integration(function(contextRef) {
        it('Owen Lars\'s ability search the top 5 of your deck for a Force unit, reveal it, draw it', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['battlefield-marine'],
                },
                player2: {
                    deck: ['grogu#irresistible', 'obiwan-kenobi#following-fate', 'the-force-is-with-me', 'wampa', 'jedi-lightsaber', 'electrostaff'],
                    groundArena: ['owen-lars#devoted-uncle'],
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.battlefieldMarine);
            context.player1.clickCard(context.owenLars);

            expect(context.player2).toHaveExactDisplayPromptCards({
                selectable: [context.grogu, context.obiwanKenobi],
                invalid: [context.wampa, context.jediLightsaber, context.theForceIsWithMe],
            });
            expect(context.player2).toHaveEnabledPromptButton('Take nothing');

            context.player2.clickCardInDisplayCardPrompt(context.grogu);
            expect(context.grogu).toBeInZone('hand');
            expect(context.getChatLog(0)).toBe('player2 takes Grogu');
        });

        describe('Owen Lars\' when defeated ability with No Glory Only Results', () => {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['no-glory-only-results'],
                        deck: ['grogu#irresistible', 'obiwan-kenobi#following-fate', 'the-force-is-with-me', 'wampa', 'jedi-lightsaber', 'electrostaff'],
                    },
                    player2: {
                        groundArena: ['owen-lars#devoted-uncle'],
                    }
                });
            });

            it('allows player1 to search the top 5 of their deck for a Force unit when Owen Lars is defeated', () => {
                const { context } = contextRef;

                // Player 1 plays No Glory, Only Results
                context.player1.clickCard(context.noGloryOnlyResults);
                context.player1.clickCard(context.owenLars);

                // Player 1 should be prompted to search for a Force unit
                expect(context.player1).toHaveExactDisplayPromptCards({
                    selectable: [context.grogu, context.obiwanKenobi],
                    invalid: [context.wampa, context.jediLightsaber, context.theForceIsWithMe],
                });
                expect(context.player1).toHaveEnabledPromptButton('Take nothing');

                // Player 1 selects a Force unit
                context.player1.clickCardInDisplayCardPrompt(context.grogu);
                expect(context.grogu).toBeInZone('hand');
                expect(context.player1.hand).toContain(context.grogu);
                expect(context.getChatLog(0)).toBe('player1 takes Grogu');
            });
        });
    });
});
