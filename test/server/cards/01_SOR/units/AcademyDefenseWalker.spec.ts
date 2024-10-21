describe('Academy Defense Walker', function () {
    integration(function (contextRef) {
        describe('Academy Defense Walker\'s ability', function () {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['academy-defense-walker'],
                        groundArena: ['battlefield-marine', { card: 'scout-bike-pursuer', damage: 1 }],
                        spaceArena: ['red-three#unstoppable', { card: 'inferno-four#unforgetting', damage: 2 }]
                    },
                    player2: {
                        groundArena: [{ card: 'rugged-survivors', damage: 1 }, 'cargo-juggernaut']
                    }
                });
            });

            it('should give an Experience to all damaged friendly unit', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.academyDefenseWalker);
                expect(context.player2).toBeActivePlayer();
                expect(context.academyDefenseWalker.isUpgraded()).toBeFalse();
                expect(context.battlefieldMarine.isUpgraded()).toBeFalse();
                expect(context.redThree.isUpgraded()).toBeFalse();
                expect(context.ruggedSurvivors.isUpgraded()).toBeFalse();
                expect(context.cargoJuggernaut.isUpgraded()).toBeFalse();
                expect(context.scoutBikePursuer).toHaveExactUpgradeNames(['experience']);
                expect(context.infernoFour).toHaveExactUpgradeNames(['experience']);
            });
        });
    });
});
