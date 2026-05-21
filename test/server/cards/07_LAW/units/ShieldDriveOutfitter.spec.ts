describe('Shield Drive Outfitter', function() {
    integration(function(contextRef) {
        describe('Shield Drive Outfitter\'s ability', function() {
            beforeEach(function() {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['shield-drive-outfitter'],
                        groundArena: ['wampa'],
                        base: 'colossus'
                    },
                    player2: {
                        groundArena: ['battlefield-marine'],
                        spaceArena: ['awing']
                    }
                });
            });

            it('should offer to pay 1 resource to give a Shield token to a unit', function() {
                const { context } = contextRef;

                context.player1.clickCard(context.shieldDriveOutfitter);
                expect(context.player1).toHavePassAbilityPrompt('Pay 1 resource to give a Shield token to a unit');
                context.player1.clickPrompt('Trigger');

                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.awing, context.wampa, context.shieldDriveOutfitter]);
                context.player1.clickCard(context.awing);

                expect(context.player2).toBeActivePlayer();
                expect(context.player1.exhaustedResourceCount).toBe(2);
                expect(context.awing).toHaveExactUpgradeNames(['shield']);
            });

            it('should be able to pass on the ability', function() {
                const { context } = contextRef;

                context.player1.clickCard(context.shieldDriveOutfitter);
                context.player1.clickPrompt('Pass');

                expect(context.player2).toBeActivePlayer();
                expect(context.player1.exhaustedResourceCount).toBe(1);
                expect(context.awing).toHaveExactUpgradeNames([]);
                expect(context.wampa).toHaveExactUpgradeNames([]);
                expect(context.battlefieldMarine).toHaveExactUpgradeNames([]);
                expect(context.shieldDriveOutfitter).toHaveExactUpgradeNames([]);
            });
        });
    });
});
