describe('Corner The Prey', function () {
    integration(function (contextRef) {
        describe('Corner The Prey\'s ability -', function () {
            it('should attack with a unit getting +1 power for each damage on the defender before the attack', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['corner-the-prey'],
                        groundArena: [{ card: 'consular-security-force', upgrades: ['vambrace-flamethrower', 'resilient', 'resilient'] }],
                    },
                    player2: {
                        groundArena: [{ card: 'chewbacca#pykesbane', damage: 2, upgrades: ['resilient'] }],
                    }
                });

                const { context } = contextRef;

                // This helps doing the math
                expect(context.consularSecurityForce.getPower()).toBe(4);
                context.player1.clickCard(context.cornerThePrey);
                context.player1.clickCard(context.consularSecurityForce);
                context.player1.clickCard(context.chewbacca);

                // The Consular Security Force should have +2 power for this attack
                expect(context.consularSecurityForce.getPower()).toBe(6);
                context.player1.clickPrompt('Deal 3 damage divided as you choose among enemy ground units');

                // Deal 3 damage to Chewbacca before the attack resolution
                // They should not increase the power of the Consular Security Force for this attack
                context.player1.setDistributeDamagePromptState(new Map([
                    [context.chewbacca, 3],
                ]));

                expect(context.chewbacca.damage).toBe(11);
                expect(context.consularSecurityForce.getPower()).toBe(4);
                expect(context.consularSecurityForce.damage).toBe(9);
            });

            it('should attack with a unit getting +0/+0 while attacking a unit with 0 damage', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['corner-the-prey', 'corner-the-prey'],
                        groundArena: ['consular-security-force', 'battlefield-marine'],
                    },
                    player2: {
                        groundArena: ['chewbacca#pykesbane'],
                        base: { card: 'echo-base', damage: 6 },
                    }
                });

                const { context } = contextRef;

                // Attacking a unit with no damage should not increase the power of the Consular Security Force
                // and it should not crash
                const cornerThePreys = context.player1.findCardsByName('corner-the-prey');
                context.player1.clickCard(cornerThePreys[0]);
                context.player1.clickCard(context.consularSecurityForce);
                context.player1.clickCard(context.chewbacca);
                expect(context.chewbacca.damage).toBe(3);
                context.player2.passAction();

                // Attacking a base should not increase the power of the Battlefield Marine
                context.player1.clickCard(cornerThePreys[1]);
                context.player1.clickCard(context.battlefieldMarine);
                context.player1.clickCard(context.p2Base);
                expect(context.p2Base.damage).toBe(9);
            });
        });
    });
});
