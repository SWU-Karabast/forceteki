describe('IG11 I Cannot be captured', function () {
    integration(function (contextRef) {
        describe('IG11 I Cannot be captured\'s ability', function () {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        groundArena: ['kintan-intimidator', 'ig11#i-cannot-be-captured']
                    },
                    player2: {
                        groundArena: ['battlefield-marine', 'pyke-sentinel', 'wampa'],
                        hand: ['take-captive']
                    }
                });
            });

            it('IG should not be captured, when he does, he is defeated and does 3 damage to opponents ground units', function () {
                const { context } = contextRef;

                context.player1.passAction();
                context.player2.clickCard(context.takeCaptive);
                context.player2.clickCard(context.pykeSentinel);
                context.player2.clickCard(context.IG11);
                expect(context.IG11).toBeInZone('discard');
            });
        });
    });
});