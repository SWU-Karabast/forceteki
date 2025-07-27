describe('General Veers Leading The Assault', function() {
    integration(function(contextRef) {
        it('General Veers\'s ability with a Vigilance unit should deal 2 damage to enemy base and heal 2 damage from your base when played with a Vigilance unit', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['general-veers#leading-the-assault'],
                    groundArena: ['consular-security-force'], // Assuming this is a Vigilance unit
                    base: { card: 'echo-base', damage: 2 } // Set initial damage on player's base
                },
                player2: {
                    base: { card: 'jabbas-palace', damage: 0 } // Set initial damage on opponent's base
                }
            });

            const { context } = contextRef;

            // Record initial base damage values
            const player1BaseDamage = context.player1.base.damage;
            const player2BaseDamage = context.player2.base.damage;

            // Play General Veers
            context.player1.clickCard(context.generalVeersLeadingTheAssault);

            expect(context.player2).toBeActivePlayer();

            // Verify enemy base took 2 damage
            expect(context.player2.base.damage).toBe(player2BaseDamage + 2);

            // Verify player's base was healed by 2
            expect(context.player1.base.damage).toBe(player1BaseDamage - 2);
        });

        it('General Veers\'s ability without a Vigilance unit should not affect bases when played without a Vigilance unit', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['general-veers#leading-the-assault'],
                    groundArena: ['wampa'], // Assuming this is NOT a Vigilance unit
                    base: { card: 'echo-base', damage: 2 } // Set initial damage on player's base
                },
                player2: {
                    groundArena: ['consular-security-force'], // Assuming this is a Vigilance unit
                    base: { card: 'jabbas-palace', damage: 0 } // Set initial damage on opponent's base
                }
            });

            const { context } = contextRef;

            // Record initial base damage values
            const player1BaseDamage = context.player1.base.damage;
            const player2BaseDamage = context.player2.base.damage;

            // Play General Veers
            context.player1.clickCard(context.generalVeersLeadingTheAssault);

            expect(context.player2).toBeActivePlayer();

            // Verify no change to base damage values
            expect(context.player2.base.damage).toBe(player2BaseDamage);
            expect(context.player1.base.damage).toBe(player1BaseDamage);
        });
    });
});