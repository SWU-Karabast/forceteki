describe('Bossk, Hunting his Prey', function () {
    integration(function (contextRef) {
        describe('Bossk\'s leader deployed ability', function () {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        leader: { card: 'bossk#hunting-his-prey', deployed: true },
                    },
                    player2: {
                        groundArena: ['hylobon-enforcer'],
                    },
                });
            });

            it('should be able to collect a Bounty twice', function () {
                const { context } = contextRef;

                // function reset() {
                //     context.asajjVentress.exhausted = false;
                //     context.setDamage(context.asajjVentress, 0);
                //     context.player2.passAction();
                // }

                context.player1.clickCard(context.bossk);
                context.player1.clickCard(context.hylobonEnforcer);

                expect(context.player1).toHavePassAbilityPrompt('Collect Bounty: Draw a card');
                context.player1.clickPrompt('Collect Bounty: Draw a card');
                expect(context.player1.handSize).toBe(1);
                expect(context.player2.handSize).toBe(0);

                expect(context.player1).toHavePassAbilityPrompt('Collect the Bounty again');
                context.player1.clickPrompt('Collect the Bounty again');
                expect(context.player1.handSize).toBe(2);
                expect(context.player2.handSize).toBe(0);
            });
        });
    });
});
