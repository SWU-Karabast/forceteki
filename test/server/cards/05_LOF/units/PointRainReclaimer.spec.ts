describe('Point Rain Reclaimer', function() {
    integration(function(contextRef) {
        describe('Point Rain Reclaimer\'s ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['point-rain-reclaimer'],
                        groundArena: ['jedi-knight'],
                    },
                    player2: {
                        groundArena: ['wampa'],
                        spaceArena: ['green-squadron-awing']
                    }
                });
            });

            it('should give experience because we control a Jedi unit.', function () {
                const { context } = contextRef;
                context.player1.clickCard(context.pointRainReclaimer);

                expect(context.player1).toHavePassAbilityButton();
                context.player1.clickPrompt('Trigger');
                expect(context.pointRainReclaimer).toHaveExactUpgradeNames(['experience']);
                expect(context.player2).toBeActivePlayer();
            });

            it('should be able to be passed.', function () {
                const { context } = contextRef;
                context.player1.clickCard(context.pointRainReclaimer);

                expect(context.player1).toHavePassAbilityButton();
                context.player1.clickPrompt('Pass');
                expect(context.pointRainReclaimer.isUpgraded()).toBeFalse();
                expect(context.player2).toBeActivePlayer();
            });
        });

        describe('Point Rain Reclaimer\'s ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['point-rain-reclaimer'],
                        groundArena: ['battlefield-marine'],
                    },
                    player2: {
                        groundArena: ['wampa', 'jedi-knight']
                    }
                });
            });

            it('should not give experience to unit because we do not control a Jedi unit.', function () {
                const { context } = contextRef;
                context.player1.clickCard(context.pointRainReclaimer);
                expect(context.pointRainReclaimer.isUpgraded()).toBeFalse();
                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});