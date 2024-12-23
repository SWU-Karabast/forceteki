describe('Hold-out Blaster', function() {
    integration(function(contextRef) {
        it('Hold-out Blaster\'s ability deals 1 domage to a ground unit when played', function () {
            contextRef.setupTest({
                phase: 'action',
                player1: {
                    hand: ['holdout-blaster'],
                    groundArena: ['battlefield-marine'],
                    spaceArena: ['green-squadron-awing']
                },
                player2: {
                    groundArena: ['r2d2#ignoring-protocol'],
                    spaceArena: ['alliance-xwing']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.holdoutBlaster);
            expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.r2d2IgnoringProtocol]);

            context.player1.clickCard(context.battlefieldMarine);
            expect(context.battlefieldMarine.getPower()).toBe(4);
            expect(context.battlefieldMarine.getHp()).toBe(3);
            expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.r2d2IgnoringProtocol]);
            expect(context.player1).toHaveChooseNoTargetButton();

            context.player1.clickCard(context.r2d2IgnoringProtocol);
            expect(context.r2d2IgnoringProtocol.damage).toBe(1);
            expect(context.battlefieldMarine.exhausted).toBe(false);
        });
    });
});
