describe('Jedi In Hiding', () => {
    integration(function (contextRef) {
        it('Jedi In Hiding\'s when defeated ability may allow the player to use the force. If they do, opponent discards a card from their hand', async () => {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['jedi-in-hiding'],
                    hasForceToken: true
                },
                player2: {
                    hand: ['no-glory-only-results', 'takedown'],
                    hasInitiative: true,
                }
            });

            const { context } = contextRef;

            context.player2.clickCard(context.takedown);
            context.player2.clickCard(context.jediInHiding);

            expect(context.player1).toHavePassAbilityPrompt('Use the Force to make your opponent discards a card from their hand');
            context.player1.clickPrompt('Trigger');

            expect(context.player2).toBeAbleToSelectExactly([context.noGloryOnlyResults]);
            expect(context.player2).not.toHaveChooseNothingButton();
            expect(context.player2).not.toHavePassAbilityButton();

            context.player2.clickCard(context.noGloryOnlyResults);

            expect(context.player1).toBeActivePlayer();
            expect(context.player1.hasTheForce).toBeFalse();
            expect(context.noGloryOnlyResults).toBeInZone('discard', context.player2);
        });

        it('Jedi In Hiding\'s when defeated ability does not allow to discard a card from opponent\'s hand if player does not have the force', async () => {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['jedi-in-hiding'],
                    hasForceToken: false
                },
                player2: {
                    hand: ['no-glory-only-results', 'takedown'],
                    hasInitiative: true,
                }
            });

            const { context } = contextRef;

            context.player2.clickCard(context.takedown);
            context.player2.clickCard(context.jediInHiding);

            expect(context.player1).toBeActivePlayer();
            expect(context.noGloryOnlyResults).toBeInZone('hand', context.player2);
        });

        it('Jedi In Hiding\'s when defeated ability may allow the opponent to use the force because of No Glory Only Results. If they do, player discards a card from their hand', async () => {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['wampa', 'atst'],
                    groundArena: ['jedi-in-hiding'],
                    hasForceToken: false
                },
                player2: {
                    hand: ['no-glory-only-results', 'takedown'],
                    hasInitiative: true,
                    hasForceToken: true,
                }
            });

            const { context } = contextRef;

            context.player2.clickCard(context.noGloryOnlyResults);
            context.player2.clickCard(context.jediInHiding);

            expect(context.player2).toHavePassAbilityPrompt('Use the Force to make your opponent discards a card from their hand');
            context.player2.clickPrompt('Trigger');

            expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.atst]);
            expect(context.player1).not.toHaveChooseNothingButton();
            expect(context.player1).not.toHavePassAbilityButton();

            context.player1.clickCard(context.wampa);

            expect(context.player1).toBeActivePlayer();
            expect(context.player2.hasTheForce).toBeFalse();
            expect(context.wampa).toBeInZone('discard', context.player1);
        });
    });
});