describe('Relentless Rocket Droid', function () {
    integration(function (contextRef) {
        describe('Relentless Rocket Droid\'s ability', function () {
            it('should have +2/+0 when you control another trooper unit', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['specforce-soldier'],
                        groundArena: ['relentless-rocket-droid'],
                    },
                    player2: {
                        groundArena: ['consular-security-force'],
                    }
                });

                const { context } = contextRef;

                // Opponent Trooper must not increase relentless rocket droid power
                expect(context.relentlessRocketDroid.getPower()).toBe(3);
                expect(context.relentlessRocketDroid.getHp()).toBe(5);
                context.player1.clickCard(context.specforceSoldier);
                context.player1.clickCard(context.consularSecurityForce);

                // Specforce-Soldier must increase relentless rocket droid power by 2
                expect(context.relentlessRocketDroid.getPower()).toBe(5);
                expect(context.relentlessRocketDroid.getHp()).toBe(5);

                // And when Spec force Solider is defeated, it must go back to 3 power
                context.player2.clickCard(context.consularSecurityForce);
                context.player2.clickCard(context.specforceSoldier);
                expect(context.specforceSoldier).toBeInZone('discard');
                expect(context.consularSecurityForce.damage).toBe(2);
                expect(context.relentlessRocketDroid.getPower()).toBe(3);
                expect(context.relentlessRocketDroid.getHp()).toBe(5);
            });
        });
    });
});
