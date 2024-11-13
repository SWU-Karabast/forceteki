describe('Hunter of the Haxion Brood', function () {
    integration(function (contextRef) {
        describe('Hunter of the Haxion Brood\'s ability', function () {
            it('should have Shield because opponent has a unit with bounty.', function () {
                const { context } = contextRef;

                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['hunter-of-the-haxion-brood'],
                    },
                    player2: {
                        groundArena: ['hylobon-enforcer']
                    }
                });

                context.player1.clickCard(context.hunterOfTheHaxionBrood);
                expect(context.hunterOfTheHaxionBrood).toHaveExactUpgradeNames(['shield']);
            });

            it('should not have Shield because opponent does not have a unit with bounty', function () {
                const { context } = contextRef;

                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['hunter-of-the-haxion-brood'],
                    }
                });

                context.player1.clickCard(context.hunterOfTheHaxionBrood);
                expect(context.hunterOfTheHaxionBrood.isUpgraded()).toBeFalse();
            });
        });
    });
});
