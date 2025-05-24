describe('Kylo Ren, I Know Your Story', function() {
    integration(function(contextRef) {
        it('Kylo Ren\'s ability should trigger when I play an upgrade on him to make me use the force to draw a card', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hasForceToken: true,
                    hand: ['fallen-lightsaber', 'vaders-lightsaber'],
                    groundArena: ['kylo-ren#i-know-your-story'],
                    deck: ['porg', 'wampa']
                },
            });
            const { context } = contextRef;

            // play fallen lightsaber on kylo ren
            context.player1.clickCard(context.fallenLightsaber);
            context.player1.clickCard(context.kyloRen);

            // use the force to draw a card
            expect(context.player1).toHavePassAbilityPrompt('Use the Force. If you do, draw a card');
            context.player1.clickPrompt('Trigger');

            expect(context.player2).toBeActivePlayer();
            expect(context.porg).toBeInZone('hand', context.player1);
            expect(context.player1.handSize).toBe(2); // porg + vader's lightsaber

            context.player2.passAction();
            context.player1.setHasTheForce(true);

            // play another upgrade on kylo ren
            context.player1.clickCard(context.vadersLightsaber);
            context.player1.clickCard(context.kyloRen);

            expect(context.player1).toHaveExactPromptButtons(['Use the Force. If you do, draw a card', 'Deal 4 damage to a ground unit']);

            // use the force to draw a card
            context.player1.clickPrompt('Use the Force. If you do, draw a card');
            context.player1.clickPrompt('Trigger');

            expect(context.player2).toBeActivePlayer();
            expect(context.wampa).toBeInZone('hand', context.player1);

            // play another card, kylo should not trigger
            context.player2.passAction();
            context.player1.clickCard(context.wampa);

            expect(context.player2).toBeActivePlayer();
        });

        it('Kylo Ren\'s ability should trigger when I play an upgrade on him (without the force)', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hasForceToken: false,
                    hand: ['fallen-lightsaber', 'vaders-lightsaber'],
                    groundArena: ['kylo-ren#i-know-your-story'],
                    deck: ['porg', 'wampa']
                },
            });
            const { context } = contextRef;

            context.player1.clickCard(context.fallenLightsaber);
            context.player1.clickCard(context.kyloRen);

            expect(context.player2).toBeActivePlayer();
        });
    });
});