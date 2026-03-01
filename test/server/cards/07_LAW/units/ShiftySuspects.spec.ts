describe('Shifty Suspects', function () {
    integration(function (contextRef) {
        describe('Shifty Suspects\' ability', function () {
            it('should cancel heal on bases', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['shifty-suspects', 'admiral-ackbar#brilliant-strategist'],
                        base: { card: 'echo-base', damage: 5 }
                    },
                    player2: {
                        hand: ['smugglers-aid'],
                        groundArena: ['yoda#old-master'],
                        base: { card: 'capital-city', damage: 5 }
                    },
                });

                const { context } = contextRef;

                function reset() {
                    context.setDamage(context.p1Base, 5);
                    context.setDamage(context.p2Base, 5);
                }

                // Attack with Shifty Suspects, bases can't be healed for the phase
                context.player1.clickCard(context.shiftySuspects);
                context.player1.clickCard(context.p2Base);

                expect(context.player2).toBeActivePlayer();
                expect(context.getChatLogs(1)).toContain('player1 uses Shifty Suspects to prevent their base and player2\'s base from being healed for this phase');

                // Nothing happen from this event
                context.player2.clickCard(context.smugglersAid);
                expect(context.p2Base.damage).toBe(9); // 5 base damage + 4 from shifty suspects

                // Nothing happen from restore on our base
                context.player1.clickCard(context.admiralAckbar);
                context.player1.clickCard(context.p2Base);
                expect(context.p1Base.damage).toBe(5);

                reset();
                context.moveToNextActionPhase();

                // Effect stop at the end of phase, if opponent attack before Shifty Suspects, he can heal
                context.player1.passAction();
                context.player2.clickCard(context.yoda);
                context.player2.clickCard(context.p1Base);
                expect(context.p2Base.damage).toBe(3);

                // Attack with Shifty Suspects, bases can't be healed for this phase
                context.player1.clickCard(context.shiftySuspects);
                context.player1.clickCard(context.p2Base);

                reset();
                context.player2.passAction();

                // Nothing happen from restore
                context.player1.clickCard(context.admiralAckbar);
                context.player1.clickCard(context.p2Base);
                expect(context.p1Base.damage).toBe(5);
            });
        });
    });
});
