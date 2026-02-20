describe('Cutthroat Podracer', function () {
    integration(function (contextRef) {
        it('Cutthroat Podracer\'s ability should allow dealing 2 damage to an exhausted ground unit when played', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['cutthroat-podracer'],
                    groundArena: ['battlefield-marine'],
                },
                player2: {
                    groundArena: [{ card: 'wampa', exhausted: true }, 'atst'],
                    spaceArena: [{ card: 'awing', exhausted: true }]
                }
            });
            const { context } = contextRef;

            context.player1.clickCard(context.cutthroatPodracer);

            // atst & awing not selectable
            expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.cutthroatPodracer]);
            expect(context.player1).toHavePassAbilityButton();
            context.player1.clickCard(context.wampa);

            expect(context.player2).toBeActivePlayer();
            expect(context.wampa.damage).toBe(2);
            expect(context.cutthroatPodracer.damage).toBe(0);
            expect(context.cutthroatPodracer).toBeInZone('groundArena');
        });
    });
});
