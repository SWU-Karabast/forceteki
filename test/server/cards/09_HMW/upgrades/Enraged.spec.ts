describe('Enraged', function() {
    integration(function(contextRef) {
        it('Enraged should give Raid 2 to the attached unit', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: [{ card: 'battlefield-marine', upgrades: ['enraged'] }]
                }
            });

            const { context } = contextRef;

            // Battlefield Marine: 3 power + 1 from Enraged = 4 while not attacking
            expect(context.battlefieldMarine.getPower()).toBe(4);
            expect(context.battlefieldMarine.getHp()).toBe(4);

            context.player1.clickCard(context.battlefieldMarine);
            context.player1.clickCard(context.p2Base);

            // Raid 2 gives +2/+0 while attacking: 4 + 2 = 6 damage
            expect(context.p2Base.damage).toBe(6);

            expect(context.battlefieldMarine.getPower()).toBe(4);
            expect(context.battlefieldMarine.getHp()).toBe(4);
        });
    });
});
