describe('Morgan Elsbeth, Keeper of Many Secrets', function () {
    integration(function (contextRef) {
        describe('Morgan Elsbeth\'s ability', function () {
            it('should defeat another friendly unit and draw a card.', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['morgan-elsbeth#keeper-of-many-secrets', 'atst', 'wampa'],
                    },
                    player2: {
                        groundArena: ['battlefield-marine']
                    },

                    // IMPORTANT: this is here for backwards compatibility of older tests, don't use in new code
                    autoSingleTarget: true
                });

                const { context } = contextRef;

                context.player1.clickCard(context.morganElsbeth);
                context.player1.clickCard(context.p2Base);

                // choice between ability and restore 1
                context.player1.clickPrompt('Defeat another friendly unit. If you do, draw a card.');
                expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.atst]);
                expect(context.player1).toHavePassAbilityButton();
                context.player1.clickCard(context.wampa);

                // wampa should be defeated, and we should had draw a card
                expect(context.player2).toBeActivePlayer();
                expect(context.wampa).toBeInZone('discard');
                expect(context.player1.hand.length).toBe(1);

                context.readyCard(context.morganElsbeth);
                context.player2.passAction();

                context.player1.clickCard(context.morganElsbeth);
                context.player1.clickCard(context.p2Base);

                // choice between ability and restore 1
                context.player1.clickPrompt('Defeat another friendly unit. If you do, draw a card.');

                // can pass
                expect(context.player1).toHavePassAbilityPrompt('Defeat another friendly unit. If you do, draw a card.');
                context.player1.clickPrompt('Pass');

                // we pass, atst should be alive, and we should not have draw
                expect(context.player2).toBeActivePlayer();
                expect(context.atst).toBeInZone('groundArena');
                expect(context.player1.hand.length).toBe(1);
            });
        });
    });
});
