describe('Shoot First', function () {
    integration(function (contextRef) {
        describe('Shoot First Ability', function () {
            const { context } = contextRef;

            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['shoot-first'],
                        groundArena: ['pyke-sentinel', 'battlefield-marine'],
                    },
                    player2: {
                        groundArena: ['r2d2#ignoring-protocol'],
                    }
                });
            });

            it('should initiate attack with +1/+0 and while attacking deal damage before the defender', function () {
                const { context } = contextRef;
                context.player1.clickCard(context.shootFirst);
                expect(context.player1).toBeAbleToSelectExactly([context.pykeSentinel, context.battlefieldMarine]);
                context.player1.clickCard(context.battlefieldMarine);
                context.player1.clickCard(context.r2d2);

                // check game state
                expect(context.r2d2.location).toBe('discard');
                expect(context.battlefieldMarine.damage).toBe(0);
                expect(context.shootFirst.location).toBe('discard');
            });
        });
    });
});
