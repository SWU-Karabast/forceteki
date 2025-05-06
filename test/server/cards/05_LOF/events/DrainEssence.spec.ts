describe('Drain Essence', function () {
    integration(function (contextRef) {
        it('deals 2 damage to a unit, and gives the player The Force token', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['drain-essence']
                },
                player2: {
                    groundArena: ['consular-security-force']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.drainEssence);
            expect(context.player1).toBeAbleToSelectExactly([context.consularSecurityForce]);
            context.player1.clickCard(context.consularSecurityForce);

            expect(context.consularSecurityForce.damage).toBe(2);
            expect(context.player1.hasTheForce).toBe(true);
        });

        it('can damage a friendly unit', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['drain-essence'],
                    groundArena: ['hylobon-enforcer']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.drainEssence);

            expect(context.player1).toBeAbleToSelectExactly([context.hylobonEnforcer]);
            context.player1.clickCard(context.hylobonEnforcer);

            expect(context.hylobonEnforcer.damage).toBe(2);
            expect(context.player1.hasTheForce).toBe(true);
        });

        it('will still deal damage if the player already has The Force token', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['drain-essence'],
                    hasForceToken: true
                },
                player2: {
                    groundArena: ['consular-security-force']
                }
            });

            const { context } = contextRef;

            // Player 1 has The Force token
            expect(context.player1.hasTheForce).toBe(true);

            context.player1.clickCard(context.drainEssence);
            expect(context.player1).toBeAbleToSelectExactly([context.consularSecurityForce]);
            context.player1.clickCard(context.consularSecurityForce);

            expect(context.consularSecurityForce.damage).toBe(2);
            expect(context.player1.hasTheForce).toBe(true);
        });

        it('will still gain the force if there are no units to deal damage to', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['drain-essence']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.drainEssence);

            expect(context.player1.hasTheForce).toBe(true);
            expect(context.player2).toBeActivePlayer();
        });

        it('will deal damage to a friendly unit if there are no enemy units', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['drain-essence'],
                    groundArena: ['consular-security-force']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.drainEssence);
            expect(context.player1).toBeAbleToSelectExactly([context.consularSecurityForce]);
            context.player1.clickCard(context.consularSecurityForce);

            expect(context.consularSecurityForce.damage).toBe(2);
            expect(context.player1.hasTheForce).toBe(true);
        });

        it('will do nothing if there are no units to deal damage to and the player already has The Force token', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['drain-essence'],
                    hasForceToken: true
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.drainEssence);

            expect(context.player1.hasTheForce).toBe(true);
            expect(context.player2).toBeActivePlayer();
        });
    });
});