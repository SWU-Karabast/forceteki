describe('Ravening Gundark', () => {
    integration(function (contextRef) {
        it('Ravening Gundark\'s when played ability deal 1 damage to a ground unit', async () => {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['ravening-gundark'],
                    groundArena: ['wampa']
                },
                player2: {
                    groundArena: ['atst'],
                    spaceArena: ['avenger#hunting-star-destroyer']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.raveningGundark);
            expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.atst, context.raveningGundark]);
            expect(context.player1).not.toHavePassAbilityButton();
            expect(context.player1).not.toHaveChooseNothingButton();

            context.player1.clickCard(context.atst);

            expect(context.player2).toBeActivePlayer();
            expect(context.atst.damage).toBe(1);
        });
    });
});