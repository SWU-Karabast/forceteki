describe('Hold-out Blaster', function() {
    integration(function(contextRef) {
        it('Hold-out Blaster\'s ability deals 1 domage to a ground unit when played', function () {
            contextRef.setupTest({
                phase: 'action',
                player1: {
                    hand: ['holdout-blaster'],
                    groundArena: ['battlefield-marine'],
                    spaceArena: ['green-squadron-awing'],
                    leader: 'jango-fett#concealing-the-conspiracy'
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
            expect(context.player1).toHavePassAbilityButton();
            expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.r2d2IgnoringProtocol]);

            // Deal damage to R2-D2
            context.player1.clickCard(context.r2d2IgnoringProtocol);

            // Resolve Jango's ability
            expect(context.player1).toHavePassAbilityPrompt('Exhaust this leader');
            context.player1.clickPrompt('Exhaust this leader');

            expect(context.r2d2IgnoringProtocol.damage).toBe(1);
            expect(context.r2d2IgnoringProtocol.exhausted).toBeTrue();
            expect(context.battlefieldMarine.exhausted).toBe(false);
        });
    });
});
