describe('Royal Guard Attaché', function () {
    integration(function (contextRef) {
        describe('Royal Guard Attaché\'s ability', function () {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['royal-guard-attache'],
                    },
                    player2: {
                        groundArena: ['death-trooper'],
                    },
                });
            });

            it('should take 2 damages when played', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.royalGuardAttache);
                expect(context.royalGuardAttache.damage).toBe(2);
            });
        });
    });
});
