describe('In Pursuit', function() {
    integration(function(contextRef) {
        describe('In Pursuit\'s ability', function() {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['in-pursuit'],
                        groundArena: ['battlefield-marine'],
                        spaceArena: ['green-squadron-awing']
                    },
                    player2: {
                        groundArena: ['pyke-sentinel'],
                        spaceArena: ['inferno-four#unforgetting']
                    }
                });
            });

            it('should exhaust an enemy unit if you exhaust a friendly unit', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.inPursuit);
                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.greenSquadronAwing]);
                expect(context.player1).toHavePassAbilityButton();

                context.player1.clickCard(context.battlefieldMarine);
                expect(context.player1).toBeAbleToSelectExactly([context.pykeSentinel, context.infernoFour]);

                context.player1.clickCard(context.infernoFour);
                expect(context.battlefieldMarine.exhausted).toBe(true);
                expect(context.infernoFour.exhausted).toBe(true);
            });
        });
    });
});