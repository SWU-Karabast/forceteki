describe('Adept of Anger', () => {
    integration(function (contextRef) {
        it('Adept of Anger\'s ability exhausts itself and uses the Force to exhaust a unit', async () => {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['adept-of-anger', 'wampa'],
                    hasForceToken: true
                },
                player2: {
                    groundArena: ['atst'],
                    spaceArena: ['green-squadron-awing']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.adeptOfAnger);
            expect(context.player1).toHaveExactPromptButtons(['Attack', 'Cancel', 'Exhaust a unit']);
            context.player1.clickPrompt('Exhaust a unit');

            expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.atst, context.greenSquadronAwing, context.adeptOfAnger]);

            expect(context.player1).not.toHavePassAbilityButton();
            expect(context.player1).not.toHaveChooseNothingButton();

            context.player1.clickCard(context.wampa);

            expect(context.player2).toBeActivePlayer();
            expect(context.wampa.exhausted).toBeTrue();
            expect(context.adeptOfAnger.exhausted).toBeTrue();
            expect(context.player1.hasTheForce).toBeFalse();
        });

        it('Adept of Anger\'s ability cannot exhaust a unit if controller does not have the force', async () => {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['adept-of-anger', 'wampa'],
                    hasForceToken: false
                },
                player2: {
                    groundArena: ['atst'],
                    spaceArena: ['green-squadron-awing']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.adeptOfAnger);

            expect(context.player1).toBeAbleToSelectExactly([context.atst, context.p2Base]);
            context.player1.clickCard(context.p2Base);

            expect(context.player2).toBeActivePlayer();
        });
    });
});