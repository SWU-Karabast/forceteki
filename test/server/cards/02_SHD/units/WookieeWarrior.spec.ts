describe('Wookiee Warrior', function () {
    integration(function (contextRef) {
        describe('Wookiee Warrior\'s ability', function () {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['wookiee-warrior'],
                        groundArena: ['liberated-slaves'],
                    },
                    player2: {}
                });
            });

            it('should draw as we control another wookie', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.wookieeWarrior);
                expect(context.player1.hand.length).toBe(1);
                expect(context.player2).toBeActivePlayer();
            });
        });

        describe('Wookiee Warrior\'s ability', function () {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['wookiee-warrior'],
                    },
                    player2: {
                        groundArena: ['liberated-slaves'],
                    }
                });
            });

            it('should not draw as we do not control another wookie', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.wookieeWarrior);
                expect(context.player1.hand.length).toBe(0);
                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});
