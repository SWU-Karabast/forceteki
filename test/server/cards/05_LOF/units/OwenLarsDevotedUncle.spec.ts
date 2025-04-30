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

            expect(context.player1).toHavePrompt('Select a card to reveal');
            expect(context.player1).toHaveExactDisplayPromptCards({
                selectable: [context.grogu, context.obiwanKenobi, context.wampa],
                invalid: [context.wampa, context.jediLightsaber, context.theForceIsWithMe],
            });
            expect(context.player1).toHaveEnabledPromptButton('Take nothing');

            context.player1.clickCardInDisplayCardPrompt(context.grogu);
            expect(context.grogu).toBeInZone('hand');
        });
    });
});