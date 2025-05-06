describe('Jedi Sentinel', function() {
    integration(function(contextRef) {
        it('Jedi Sentinel\'s ability should not have Sentinel keyword when the player does not have The Force', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hasForceToken: false,
                    groundArena: ['jedi-sentinel']
                },
                player2: {
                    hasInitiative: true,
                    groundArena: ['consular-security-force']
                },
            });
            const { context } = contextRef;

            // Check that the unit no longer has the Sentinel keyword
            expect(context.jediSentinel.hasSomeKeyword('sentinel')).toBe(false);
        });

        it('Jedi Sentinel\'s ability should force enemy units to attack a Sentinel when attacking the player', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hasForceToken: true,
                    groundArena: ['jedi-sentinel']
                },
                player2: {
                    hasInitiative: true,
                    groundArena: ['consular-security-force']
                },
            });
            const { context } = contextRef;
            expect(context.jediSentinel.hasSomeKeyword('sentinel')).toBe(true);

            // Player2 tries to attack with their unit
            context.player2.clickCard(context.consularSecurityForce);

            // They should only be able to select the Jedi Sentinel (not the base)
            expect(context.player2).toBeAbleToSelectExactly([context.jediSentinel]);

            // Complete the attack
            context.player2.clickCard(context.jediSentinel);

            // Verify damage was dealt
            expect(context.jediSentinel.damage).toBe(3);
            expect(context.consularSecurityForce.damage).toBe(5);
        });
    });
});