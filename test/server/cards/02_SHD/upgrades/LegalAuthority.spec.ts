describe('Legal Authority', function () {
    integration(function (contextRef) {
        describe('Legal Authority\'s ability', function () {
            it('should make the attached unit capture a unit with less or equal power', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['legal-authority'],
                        groundArena: ['occupier-siege-tank'],
                        spaceArena: ['desperado-freighter']
                    },
                    player2: {
                        groundArena: ['wampa', 'atst']
                    },

                    // IMPORTANT: this is here for backwards compatibility of older tests, don't use in new code
                    autoSingleTarget: true
                });

                const { context } = contextRef;

                context.player1.clickCard(context.legalAuthority);

                // able to choose non-vehicle friendly unit
                expect(context.player1).toBeAbleToSelectExactly([context.occupierSiegeTank, context.desperadoFreighter]);
                context.player1.clickCard(context.occupierSiegeTank);

                // wampa is automatically choose
                expect(context.wampa).toBeCapturedBy(context.occupierSiegeTank);
                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});
