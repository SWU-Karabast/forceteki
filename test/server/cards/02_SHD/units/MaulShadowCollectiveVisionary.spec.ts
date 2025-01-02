describe('Maul, Shadow Collective Visionary', function() {
    integration(function(contextRef) {
        describe('Maul\'s on attack ability', function() {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        groundArena: ['maul#shadow-collective-visionary', 'pirate-battle-tank'],
                        spaceArena: ['tieln-fighter', 'cartel-spacer']
                    },
                    player2: {
                        groundArena: ['chewbacca#pykesbane', 'syndicate-lackeys']
                    }
                });
            });

            it('should give an experience token to a unit', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.maul);

                // attack target selection
                expect(context.player1).toBeAbleToSelectExactly([context.chewbacca, context.syndicateLackeys, context.p2Base]);
                context.player1.clickCard(context.chewbacca);

                // damage redirect target selection
                expect(context.player1).toBeAbleToSelectExactly([context.pirateBattleTank, context.cartelSpacer]);
                expect(context.player1).toHavePassAbilityButton();
                context.player1.clickCard(context.pirateBattleTank);

                expect(context.maul.damage).toBe(0);
                expect(context.chewbacca.damage).toBe(7);
                expect(context.pirateBattleTank.damage).toBe(4);
            });
        });
    });

    // TODO: test with Jango leader for attribution
});
