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

            // P1 (opponent of P2) is prompted to see the revealed card
            expect(context.player1).toHaveExactViewableDisplayPromptCards([context.grogu]);
            context.player1.clickDone();

            expect(context.grogu).toBeInZone('hand');
            expect(context.getChatLog()).toEqual('player2 uses Owen Lars to reveal and draw Grogu and to move 4 cards to the bottom of their deck');
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

                // P2 (opponent of P1) is prompted to see the revealed card
                expect(context.player2).toHaveExactViewableDisplayPromptCards([context.grogu]);
                context.player2.clickDone();

                expect(context.grogu).toBeInZone('hand');
                expect(context.player1.hand).toContain(context.grogu);
                expect(context.getChatLog()).toContain('player1 uses Owen Lars to reveal and draw Grogu');
            });
        });
    });
});
