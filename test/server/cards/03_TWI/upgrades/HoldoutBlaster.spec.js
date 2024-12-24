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

            // TODO: test with Jango leader to confirm damage attribution
            const { context } = contextRef;

            context.player1.clickCard(context.holdoutBlaster);
            expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.r2d2IgnoringProtocol]);
            context.player1.clickCard(context.battlefieldMarine);
            expect(context.player1).toHavePassAbilityPrompt('You may have attached unit deal 1 damage to a ground unit.');
            context.player1.clickPrompt('You may have attached unit deal 1 damage to a ground unit.');
            expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.r2d2IgnoringProtocol]);
            context.player1.clickCard(context.r2d2IgnoringProtocol);
            expect(context.r2d2IgnoringProtocol.damage).toBe(1);
            expect(context.battlefieldMarine.exhausted).toBe(false);
        });
    });
});
