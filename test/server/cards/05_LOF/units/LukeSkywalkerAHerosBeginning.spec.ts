describe('Luke Skywalker, A Hero\'s Beginning', function() {
    integration(function(contextRef) {
        describe('Luke\'s triggered ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hasForceToken: true,
                        hand: ['battlefield-marine', 'yoda#old-master'],
                        groundArena: ['luke-skywalker#a-heros-beginning']
                    },
                    player2: {
                        hand: ['toro-calican#ambitious-upstart'],
                    }
                });
            });

            it('should not trigger when non-unique unit is played', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.battlefieldMarine);
                expect(context.player2).toBeActivePlayer();
            });

            it('should not trigger when opponent plays unique unit', function () {
                const { context } = contextRef;

                context.player1.passAction();
                context.player2.clickCard(context.toroCalican);
                expect(context.player1).toBeActivePlayer();
            });

            it('should not trigger when opponent plays unique unit', function () {
                const { context } = contextRef;

                context.player1.passAction();
                context.player2.clickCard(context.toroCalican);
                expect(context.player1).toBeActivePlayer();
            });

            it('should trigger when player plays a unique unit', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.yoda);

                expect(context.player1).toHavePassAbilityPrompt('Use the Force');
                context.player1.clickPrompt('Trigger');

                expect(context.player2).toBeActivePlayer();
                expect(context.player1.hasTheForce).toBeFalse();
                expect(context.lukeSkywalker).toHaveExactUpgradeNames(['shield', 'experience']);
            });

            it('should not trigger if player does not have the Force', function () {
                const { context } = contextRef;

                context.player1.setHasTheForce(false);
                context.player1.clickCard(context.yoda);
                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});