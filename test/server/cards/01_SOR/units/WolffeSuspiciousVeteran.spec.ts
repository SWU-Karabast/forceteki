describe('Wolffe, Suspicious Veteran', function () {
    integration(function (contextRef) {
        describe('Wolffe\'s ability', function () {
            it('should cancel heal on bases', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['wolffe#suspicious-veteran'],
                        groundArena: ['admiral-ackbar#brilliant-strategist'],
                        base: { card: 'echo-base', damage: 5 }
                    },
                    player2: {
                        hand: ['smugglers-aid'],
                        groundArena: ['yoda#old-master'],
                        base: { card: 'capital-city', damage: 5 }
                    },

                    // IMPORTANT: this is here for backwards compatibility of older tests, don't use in new code
                    autoSingleTarget: true
                });

                const { context } = contextRef;

                function reset() {
                    context.setDamage(context.p1Base, 5);
                    context.setDamage(context.p2Base, 5);
                }

                // play wolffe, bases can't be healed for the phase
                context.player1.clickCard(context.wolffe);
                expect(context.player2).toBeActivePlayer();

                // nothing happen from this event
                context.player2.clickCard(context.smugglersAid);
                expect(context.p2Base.damage).toBe(5);

                // noting happen from restore on our base
                context.player1.clickCard(context.admiralAckbar);
                context.player1.clickCard(context.p2Base);
                expect(context.p1Base.damage).toBe(5);

                reset();
                context.moveToNextActionPhase();

                // effect stop at the end of phase, if opponent attack before wolffe, he can heal
                context.player1.passAction();
                context.player2.clickCard(context.yoda);
                context.player2.clickCard(context.p1Base);
                expect(context.p2Base.damage).toBe(3);

                // attack with wolffe, bases can't be healed for this phase
                context.player1.clickCard(context.wolffe);
                context.player1.clickCard(context.p2Base);

                // saboteur give him a prompt too
                context.player1.clickPrompt('Bases can\'t be healed');

                reset();
                context.player2.passAction();

                // nothing happen from restore
                context.player1.clickCard(context.admiralAckbar);
                context.player1.clickCard(context.p2Base);
                expect(context.p1Base.damage).toBe(5);
            });
        });
    });
});
