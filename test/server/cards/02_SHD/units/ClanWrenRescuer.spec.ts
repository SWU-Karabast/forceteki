describe('Clan Wren Rescuer', function() {
    integration(function(contextRef) {
        describe('Clan Wren Rescuer\'s when played ability', function() {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['clan-wren-rescuer'],
                        groundArena: ['wampa'],
                    },
                    player2: {
                        spaceArena: ['cartel-spacer']
                    }
                });
            });

            it('should give an experience token to a unit', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.clanWrenRescuer);
                expect(context.player1).not.toHavePassAbilityButton();
                expect(context.player1).toBeAbleToSelectExactly([context.clanWrenRescuer, context.wampa, context.cartelSpacer]);

                context.player1.clickCard(context.clanWrenRescuer);
                expect(context.clanWrenRescuer).toHaveExactUpgradeNames(['experience']);
            });
        });
    });
});
