describe('Protector of the Throne', function() {
    integration(function(contextRef) {
        describe('Protector of the Throne\'s ability', function() {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        groundArena: [{ card: 'protector-of-the-throne', upgrades: ['shield'] }],
                    },
                    player2: {
                        groundArena: ['wampa', 'jedha-agitator'],
                    }
                });
            });

            it('should give it sentinel only as long as it is upgraded', function () {
                const { context } = contextRef;

                context.player1.passAction();

                context.player2.clickCard(context.wampa);
                // Protector of the Throne automatically selected due to sentinel

                expect(context.player1).toBeActivePlayer();
                // no damage because of shield
                expect(context.protectorOfTheThrone.damage).toBe(0);
                expect(context.protectorOfTheThrone.isUpgraded()).toBe(false);
                expect(context.wampa.damage).toBe(2);

                context.player1.passAction();

                context.player2.clickCard(context.jedhaAgitator);

                // player 2 should be able to select base and unit because Protector of the Throne is not sentinel anymore
                expect(context.player2).toBeAbleToSelectExactly([context.protectorOfTheThrone, context.p1Base]);
                context.player2.clickCard(context.p1Base);
            });
        });
    });
});
