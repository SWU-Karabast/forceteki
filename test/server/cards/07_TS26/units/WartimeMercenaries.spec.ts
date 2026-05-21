describe('Wartime Mercenaries', function () {
    integration(function (contextRef) {
        describe('Wartime Mercenaries\'s When Defeated ability', function () {
            it('should prompt opponent to give an Experience token when defeated', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['wartime-mercenaries', 'yoda#old-master'],
                        spaceArena: ['awing']
                    },
                    player2: {
                        hand: ['vanquish'],
                        groundArena: ['atst'],
                        hasInitiative: true,
                    }
                });
                const { context } = contextRef;

                context.player2.clickCard(context.atst);
                context.player2.clickCard(context.wartimeMercenaries);

                expect(context.player2).toBeAbleToSelectExactly([context.atst, context.yoda, context.awing]);
                expect(context.player2).toHaveChooseNothingButton();
                context.player2.clickCard(context.atst);

                expect(context.player1).toBeActivePlayer();
                expect(context.atst).toHaveExactUpgradeNames(['experience']);
                expect(context.wartimeMercenaries).toBeInZone('discard', context.player1);
            });

            it('should allow opponent to pass on Experience token when defeated via No Glory Only Results', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['wartime-mercenaries', 'yoda#old-master'],
                    },
                    player2: {
                        hand: ['no-glory-only-results'],
                        groundArena: ['wampa'],
                        spaceArena: ['awing'],
                        hasInitiative: true
                    }
                });

                const { context } = contextRef;

                context.player2.clickCard(context.noGloryOnlyResults);
                context.player2.clickCard(context.wartimeMercenaries);

                expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.yoda, context.awing]);
                expect(context.player1).toHaveChooseNothingButton();
                context.player1.clickCard(context.yoda);

                expect(context.player1).toBeActivePlayer();
                expect(context.yoda).toHaveExactUpgradeNames(['experience']);
                expect(context.wartimeMercenaries).toBeInZone('discard', context.player1);
            });
        });
    });
});
