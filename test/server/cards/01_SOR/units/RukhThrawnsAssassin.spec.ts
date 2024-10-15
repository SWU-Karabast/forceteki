describe('Rukh, Thrawn\'s Assassin', function() {
    integration(function(contextRef) {
        describe('Rukh\'s triggered ability', function() {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        groundArena: ['rukh#thrawns-assassin'],
                    },
                    player2: {
                        groundArena: ['wampa', { card: 'battlefield-marine', upgrades: ['shield'] }],
                    }
                });
            });

            it('will defeat a unit if he deals combat damage to it while attacking', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.rukh);
                context.player1.clickCard(context.wampa);
                expect(context.wampa).toBeInLocation('discard');
            });
        });
    });
});
