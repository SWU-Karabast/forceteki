describe('Hidden Hand Supplier', function() {
    integration(function(contextRef) {
        describe('Hidden Hand Supplier\'s ability', function() {
            beforeEach(function() {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['hidden-hand-supplier'],
                        groundArena: ['wampa']
                    },
                    player2: {
                        groundArena: ['battlefield-marine'],
                        spaceArena: ['awing']
                    }
                });
            });

            it('should be able to pass on the ability', function() {
                const { context } = contextRef;

                context.player1.clickCard(context.hiddenHandSupplier);
                expect(context.player1).toHavePassAbilityPrompt('Pay 1 resource to give an Experience token to another unit');
                context.player1.clickPrompt('Pass');

                expect(context.player1.exhaustedResourceCount).toBe(1);
                expect(context.hiddenHandSupplier).toHaveExactUpgradeNames([]);
                expect(context.wampa).toHaveExactUpgradeNames([]);
                expect(context.awing).toHaveExactUpgradeNames([]);
                expect(context.battlefieldMarine).toHaveExactUpgradeNames([]);
            });

            it('should be able to pay 1 resource and give an Experience token to another unit', function() {
                const { context } = contextRef;

                context.player1.clickCard(context.hiddenHandSupplier);
                expect(context.player1).toHavePassAbilityPrompt('Pay 1 resource to give an Experience token to another unit');
                context.player1.clickPrompt('Trigger');

                expect(context.player1).toHavePrompt('Give an Experience token to another unit');
                expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.battlefieldMarine, context.awing]);

                context.player1.clickCard(context.wampa);

                expect(context.player2).toBeActivePlayer();
                expect(context.player1.exhaustedResourceCount).toBe(2);
                expect(context.wampa).toHaveExactUpgradeNames(['experience']);
            });
        });
    });
});
