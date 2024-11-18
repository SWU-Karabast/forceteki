describe('4-LOM, Bounty Hunter for Hire', function () {
    integration(function (contextRef) {
        describe('4-LOM\'s ability', function () {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['zuckuss#bounty-hunter-for-hire', 'battlefield-marine'],
                        groundArena: ['4lom#bounty-hunter-for-hire'],
                    },
                    player2: {
                        groundArena: ['bendu#the-one-in-the-middle', 'consular-security-force']
                    }
                });
            });

            it('should give +1/+1 and ambush to friendly unit named Zuckuss', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.zuckuss);

                // should have ambush from 4-lom
                context.player1.clickPrompt('Ambush');

                // should have saboteur from himself
                expect(context.player1).toBeAbleToSelectExactly([context.bendu, context.consularSecurityForce]);
                context.player1.clickCard(context.consularSecurityForce);

                expect(context.player2).toBeActivePlayer();
                expect(context.zuckuss.damage).toBe(3);

                // consular security force should be killed as zuckuss have +1/+1
                expect(context.consularSecurityForce.zoneName).toBe('discard');
                expect(context.zuckuss.getPower()).toBe(7);
                expect(context.zuckuss.getHp()).toBe(7);

                context.player2.passAction();
                context.player1.clickCard(context.battlefieldMarine);
                expect(context.player2).toBeActivePlayer();
            });
        });

        describe('4-LOM\'s ability', function () {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        groundArena: ['4lom#bounty-hunter-for-hire'],
                    },
                    player2: {
                        hand: ['zuckuss#bounty-hunter-for-hire'],
                    }
                });
            });

            it('should not give +1/+1 and ambush to enemy unit named Zuckuss', function () {
                const { context } = contextRef;

                context.player1.passAction();
                context.player2.clickCard(context.zuckuss);

                expect(context.player1).toBeActivePlayer();
                expect(context.zuckuss.getPower()).toBe(6);
                expect(context.zuckuss.getHp()).toBe(6);
            });
        });
    });
});
