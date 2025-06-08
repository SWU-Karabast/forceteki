describe('In The Shadows', function () {
    integration(function (contextRef) {
        describe('In The Shadows\'s ability', function () {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['in-the-shadows'],
                        groundArena: ['grand-inquisitor#youre-right-to-be-afraid', 'fifth-brother#fear-hunter', 'eighth-brother#hunt-together'],
                        spaceArena: ['scythe#intimidating-silhouette']
                    },
                    player2: {
                        groundArena: ['village-tender'],
                    }
                });
            });

            it('should give experience token to up to 3 friendly hidden unit', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.inTheShadows);

                // should be able to select all friendly hidden
                expect(context.player1).toBeAbleToSelectExactly([context.grandInquisitorYoureRightToBeAfraid, context.fifthBrotherFearHunter, context.eighthBrotherHuntTogether, context.scytheIntimidatingSilhouette]);
                context.player1.clickCard(context.grandInquisitorYoureRightToBeAfraid);
                context.player1.clickCard(context.fifthBrotherFearHunter);
                context.player1.clickCard(context.eighthBrotherHuntTogether);

                context.player1.clickPrompt('Done');

                // check experience token
                expect(context.villageTender.isUpgraded()).toBeFalse();
                expect(context.scytheIntimidatingSilhouette.isUpgraded()).toBeFalse();
                expect(context.grandInquisitorYoureRightToBeAfraid).toHaveExactUpgradeNames(['experience']);
                expect(context.fifthBrotherFearHunter).toHaveExactUpgradeNames(['experience']);
                expect(context.eighthBrotherHuntTogether).toHaveExactUpgradeNames(['experience']);
            });

            it('should give experience token to up to 3 friendly Hidden unit (choose 2)', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.inTheShadows);

                // should be able to select all friendly hidden
                expect(context.player1).toBeAbleToSelectExactly([context.grandInquisitorYoureRightToBeAfraid, context.fifthBrotherFearHunter, context.eighthBrotherHuntTogether, context.scytheIntimidatingSilhouette]);
                context.player1.clickCard(context.grandInquisitorYoureRightToBeAfraid);
                context.player1.clickCard(context.fifthBrotherFearHunter);

                context.player1.clickPrompt('Done');

                // check experience token
                expect(context.villageTender.isUpgraded()).toBeFalse();
                expect(context.scytheIntimidatingSilhouette.isUpgraded()).toBeFalse();
                expect(context.eighthBrotherHuntTogether.isUpgraded()).toBeFalse();
                expect(context.grandInquisitorYoureRightToBeAfraid).toHaveExactUpgradeNames(['experience']);
                expect(context.fifthBrotherFearHunter).toHaveExactUpgradeNames(['experience']);
            });
        });
    });
});