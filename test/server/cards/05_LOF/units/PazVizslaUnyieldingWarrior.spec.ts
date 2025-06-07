describe('Paz Vizsla, Unyielding Warrior', function () {
    integration(function (contextRef) {
        it('Paz Vizsla\'s ability should give this unit gets +2/+0 for each damage on it', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['paz-vizsla#unyielding-warrior']
                },
                player2: {
                    groundArena: ['crafty-smuggler']
                }
            });

            const { context } = contextRef;

            expect(context.pazVizslaUnyieldingWarrior.damage).toBe(0);
            expect(context.pazVizslaUnyieldingWarrior.getPower()).toBe(3);

            context.player1.clickCard(context.pazVizslaUnyieldingWarrior);
            context.player1.clickCard(context.craftySmuggler);

            expect(context.player2).toBeActivePlayer();
            expect(context.pazVizslaUnyieldingWarrior.damage).toBe(2);
            expect(context.pazVizslaUnyieldingWarrior.getPower()).toBe(7);
        });
    });
});