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
    });
});