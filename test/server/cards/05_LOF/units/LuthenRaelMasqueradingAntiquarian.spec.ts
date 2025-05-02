describe('Luthen Rael, Masquerading Antiquarian', function() {
    integration(function(contextRef) {
        it('Luthen Rael\'s ability search the top 5 of your deck for an item upgrade, reveal it, draw it', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    deck: ['jetpack', 'aggression', 'medal-ceremony', 'wampa', 'electrostaff', 'jedi-lightsaber'],
                    groundArena: ['luthen-rael#masquerading-antiquarian']
                },
            });

            const { context } = contextRef;

            context.player1.clickCard(context.luthenRael);
            context.player1.clickCard(context.p2Base);

            expect(context.player1).toHaveExactDisplayPromptCards({
                invalid: [context.aggression, context.medalCeremony, context.wampa],
                selectable: [context.jetpack, context.electrostaff]
            });
            expect(context.player1).toHaveEnabledPromptButton('Take nothing');

            context.player1.clickCardInDisplayCardPrompt(context.jetpack);
            expect(context.jetpack).toBeInZone('hand');
        });
    });
});