describe('The Ghost, Heart of the Family', () => {
    integration(function(contextRef) {
        describe('The Ghost\'s constant abilities', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['academy-training'],
                        spaceArena: ['the-ghost#heart-of-the-family']
                    },
                    player2: {
                        spaceArena: ['tieln-fighter']
                    }
                });
            });

            it('give it sentinel when it is upgraded', function() {
                const { context } = contextRef;

                context.player1.passAction();

                // Player 2 can attack base because Ghost is not a Sentinel
                context.player2.clickCard(context.tielnFighter);
                expect(context.player2).toBeAbleToSelectExactly([
                    context.theGhost,
                    context.p1Base
                ]);

                context.player2.clickCard(context.p1Base);

                // Play an upgrade on The Ghost
                context.player1.clickCard(context.academyTraining);
                context.player1.clickCard(context.theGhost);
                context.moveToNextActionPhase();
                context.player1.passAction();

                // Player 2 can't attack base because Ghost is a Sentinel
                context.player2.clickCard(context.tielnFighter);
                expect(context.player2).toBeAbleToSelectExactly([
                    context.theGhost
                ]);

                context.player2.clickCard(context.theGhost);
                expect(context.theGhost.damage).toBe(2);
            });
        });
    });
});