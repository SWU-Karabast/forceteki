describe('Chain Code Collector', function () {
    integration(function (contextRef) {
        describe('Chain Code Collector\'s on attack ability', function () {
            it('should give -4/-0 on unit who have bounty', function () {
                const { context } = contextRef;
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        groundArena: ['chain-code-collector'],
                    },
                    player2: {
                        groundArena: [{ card: 'hylobon-enforcer', damage: 3 }, 'battlefield-marine']
                    }
                });

                // kill hylobon enforcer
                context.player1.clickCard(context.chainCodeCollector);
                context.player1.clickCard(context.hylobonEnforcer);

                // pass bounty from hylobon enforcer
                context.player1.clickPrompt('Pass');

                // chain code collector did not take damage (hylobon gets -4/-0)
                expect(context.chainCodeCollector.damage).toBe(0);

                expect(context.player2).toBeActivePlayer();
                context.chainCodeCollector.exhausted = false;
                context.player2.passAction();

                // attack battlefield marine, no bounty on it, nothing happens
                context.player1.clickCard(context.chainCodeCollector);
                context.player1.clickCard(context.battlefieldMarine);

                expect(context.chainCodeCollector.location).toBe('discard');
                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});
