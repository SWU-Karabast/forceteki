describe('Zuckuss, Bounty Hunter for Hire', function() {
    integration(function(contextRef) {
        describe('Zuckuss\'s ability', function() {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['4lom#bounty-hunter-for-hire'],
                        groundArena: ['zuckuss#bounty-hunter-for-hire'],
                    },
                    player2: {
                        groundArena: ['bendu#the-one-in-the-middle', 'vigilant-honor-guards']
                    }
                });
            });

            it('should give +1/+1 and saboteur to friendly unit named 4-LOM', function () {
                const { context } = contextRef;

                context.player1.clickCard(context._4lom);

                // ambush from himself
                context.player1.clickPrompt('Ambush');

                // should have saboteur from zuckuss
                expect(context.player1).toBeAbleToSelectExactly([context.bendu, context.vigilantHonorGuards]);
                context.player1.clickCard(context.vigilantHonorGuards);

                expect(context.player2).toBeActivePlayer();
                expect(context._4lom.damage).toBe(4);

                // should be 5 as 4-lom gets +1+1 from zuckuss
                expect(context.vigilantHonorGuards.damage).toBe(5);
                expect(context._4lom.getPower()).toBe(5);
                expect(context._4lom.getHp()).toBe(5);
            });
        });

        describe('Zuckuss\'s ability', function() {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        groundArena: ['zuckuss#bounty-hunter-for-hire', 'pyke-sentinel'],
                    },
                    player2: {
                        hand: ['4lom#bounty-hunter-for-hire'],
                    }
                });
            });

            it('should not give +1/+1 and saboteur to enemy unit named 4-LOM', function () {
                const { context } = contextRef;

                context.player1.passAction();
                context.player2.clickCard(context._4lom);
                context.player2.clickPrompt('Ambush');
                // pyke sentinel is automatically choose

                expect(context.player1).toBeActivePlayer();
                expect(context._4lom.getPower()).toBe(4);
                expect(context._4lom.getHp()).toBe(4);
            });
        });
    });
});
