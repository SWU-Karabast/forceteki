describe('Heavy Missile Gunship', () => {
    integration(function (contextRef) {
        it('Heavy Missile Gunship\'s ability should exhaust itself to deal 2 damage to a ground unit', async () => {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    spaceArena: ['heavy-missile-gunship'],
                    groundArena: ['atst']
                },
                player2: {
                    groundArena: ['wampa'],
                    spaceArena: ['green-squadron-awing']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.heavyMissileGunship);
            expect(context.player1).toHaveExactPromptButtons(['Attack', 'Cancel', 'Deal 2 damage to a ground unit']);
            context.player1.clickPrompt('Deal 2 damage to a ground unit');

            expect(context.player1).toBeAbleToSelectExactly([context.atst, context.wampa]);
            expect(context.player1).not.toHavePassAbilityButton();
            expect(context.player1).not.toHaveChooseNothingButton();

            context.player1.clickCard(context.wampa);

            expect(context.player2).toBeActivePlayer();
            expect(context.wampa.damage).toBe(2);
            expect(context.heavyMissileGunship.exhausted).toBeTrue();
        });
    });
});