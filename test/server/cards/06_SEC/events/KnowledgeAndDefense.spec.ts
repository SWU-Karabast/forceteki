describe('Knowledge and Defense', function () {
    integration(function (contextRef) {
        it('Knowledge and Defense should give a unit -2/-2 for this phase and draw a card', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['knowledge-and-defense'],
                    groundArena: ['wampa'],
                    deck: ['atst']
                },
                player2: {
                    groundArena: ['battlefield-marine']
                }
            });

            const { context } = contextRef;

            const startingHand = context.player1.handSize;

            context.player1.clickCard(context.knowledgeAndDefense);

            // can select any unit (friendly or enemy)
            expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.battlefieldMarine]);
            context.player1.clickCard(context.wampa);

            // Hand size should be unchanged: -1 for event play, +1 for draw
            expect(context.player1.handSize).toBe(startingHand);

            // Wampa base 4/5 becomes 2/3 for this phase
            expect(context.wampa.getPower()).toBe(2);
            expect(context.wampa.getHp()).toBe(3);

            // Turn passes to opponent
            expect(context.player2).toBeActivePlayer();

            context.moveToNextActionPhase();

            expect(context.wampa.getPower()).toBe(4);
            expect(context.wampa.getHp()).toBe(5);
        });
    });
});
