describe('Desert Sharpshooter', function () {
    integration(function (contextRef) {
        describe('Desert Sharpshooter\'s ability', function () {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['desert-sharpshooter'],
                        groundArena: [{ card: 'battlefield-marine', upgrades: ['shield'] }, 'atst'],
                        spaceArena: ['alliance-xwing'],
                    },
                    player2: {
                        groundArena: [{ card: 'wampa', upgrades: ['advantage'] }],
                        spaceArena: [{ card: 'tieln-fighter', upgrades: ['shield'] }],
                    }
                });
            });

            it('should deal 2 damage to an upgraded ground unit', function () {
                const { context } = contextRef;

                // Player 1 play desert sharpshooter and select wampa as the target
                context.player1.clickCard(context.desertSharpshooter);
                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.wampa]);
                expect(context.player1).toHavePassAbilityButton();
                context.player1.clickCard(context.wampa);

                expect(context.wampa.damage).toBe(2);
                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});