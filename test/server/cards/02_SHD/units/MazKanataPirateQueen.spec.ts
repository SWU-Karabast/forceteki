describe('Maz Kanata, Pirate Queen', function() {
    integration(function(contextRef) {
        describe('Maz Kanata\'s triggered ability', function() {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['battlefield-marine', 'maz-kanata#pirate-queen'],
                        leader: 'boba-fett#daimyo'
                    },
                    player2: {
                        hand: ['tieln-fighter']
                    }
                });
            });

            it('should give herself an Experience when another friendly unit is played', function () {
                const { context } = contextRef;

                // CASE 1: no upgrade when she is played
                context.player1.clickCard(context.mazKanata);
                expect(context.mazKanata.isUpgraded()).toBe(false);

                // CASE 2: opponent plays unit
                context.player2.clickCard(context.tielnFighter);
                expect(context.mazKanata.isUpgraded()).toBe(false);

                // CASE 3: we play unit
                context.player1.clickCard(context.battlefieldMarine);
                expect(context.mazKanata).toHaveExactUpgradeNames(['experience']);

                // CASE 4: we deploy a leader
                context.player2.passAction();
                context.player1.clickCard(context.bobaFett);
                expect(context.mazKanata).toHaveExactUpgradeNames(['experience']);
            });
        });
    });
});
