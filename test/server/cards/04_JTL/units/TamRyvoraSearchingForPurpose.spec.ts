describe('Tam Ryvora, Searching For Purpose', function() {
    integration(function(contextRef) {
        it('Tam Ryvora\'s piloting ability should give -1/-1 to an enemy unit in the same arena of attached unit', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['tam-ryvora#searching-for-purpose'],
                    groundArena: ['escort-skiff'],
                },
                player2: {
                    groundArena: ['wampa'],
                    spaceArena: ['green-squadron-awing']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.tamRyvora);
            context.player1.clickPrompt('Play Tam Ryvora with Piloting');
            context.player1.clickCard(context.escortSkiff);

            context.player2.passAction();

            context.player1.clickCard(context.escortSkiff);
            context.player1.clickCard(context.p2Base);

            expect(context.player1).toBeAbleToSelectExactly([context.wampa]);
            context.player1.clickCard(context.wampa);

            expect(context.player2).toBeActivePlayer();
            expect(context.wampa.getPower()).toBe(3);
            expect(context.wampa.getHp()).toBe(4);
        });
    });
});
