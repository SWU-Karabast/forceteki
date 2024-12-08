describe('Savage Opress Monster', function () {
    integration(function (contextRef) {
        describe('Savage Opress Monster\'s ability', function () {
            it('should not trigger because there is the same number of unit', function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['savage-opress#monster'],
                    },
                    player2: {
                        groundArena: ['luke-skywalker#jedi-knight'],
                        hand: ['obiwan-kenobi#following-fate'],
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.savageOpress);
                expect(context.savageOpress.exhausted).toBe(true);
            });

            it('should trigger because opponent has more units', function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['savage-opress#monster'],
                    },
                    player2: {
                        groundArena: ['luke-skywalker#jedi-knight', 'obiwan-kenobi#following-fate'],
                    }
                });
                const { context } = contextRef;

                context.player1.clickCard(context.savageOpress);
                expect(context.savageOpress.exhausted).toBe(false);
            });
        });
    });
});
