describe('Avenger Hunting The Rebels', function() {
    integration(function(contextRef) {
        it('Avenger\'s ability should deal 1 damage to each other unit when played', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['avenger#hunting-the-rebels'],
                    groundArena: ['wampa'],
                    spaceArena: ['tie-bomber']
                },
                player2: {
                    groundArena: ['sundari-peacekeeper'],
                    spaceArena: ['cartel-spacer']
                }
            });

            const { context } = contextRef;

            // Record initial damage values
            const wampaDamage = context.wampa.damage;
            const tieBomberDamage = context.tieBomber.damage;
            const sundariPeacekeeperDamage = context.sundariPeacekeeper.damage;
            const cartelSpacerDamage = context.cartelSpacer.damage;

            // Play Avenger Hunting The Rebels
            context.player1.clickCard(context.avengerHuntingTheRebels);
            expect(context.avengerHuntingTheRebels).toBeInZone('spaceArena');

            // Verify each other unit took 1 damage
            expect(context.wampa.damage).toBe(wampaDamage + 1);
            expect(context.tieBomber.damage).toBe(tieBomberDamage + 1);
            expect(context.sundariPeacekeeper.damage).toBe(sundariPeacekeeperDamage + 1);
            expect(context.cartelSpacer.damage).toBe(cartelSpacerDamage + 1);

            // Verify Avenger itself didn't take damage
            expect(context.avengerHuntingTheRebels.damage).toBe(0);
        });
    });
});