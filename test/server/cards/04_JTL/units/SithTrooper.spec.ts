describe('Sith Trooper', function() {
    integration(function(contextRef) {
        it('Sith Trooper\'s ability should give +1/+0 for this attack for each damage unit the defending player controls', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    spaceArena: ['red-five#running-the-trench'],
                    groundArena: [{ card: 'wampa', damage: 1 }, 'sith-trooper']
                },
                player2: {
                    groundArena: [{ card: 'atst', damage: 1 }, 'battlefield-marine'],
                    spaceArena: [{ card: 'restored-arc170', damage: 1 }],
                    hand: ['vanquish']
                }
            });

            const { context } = contextRef;

            // Attack with Sith Trooper and check if it gets +1/+0 for each damaged unit the defending player controls
            expect(context.sithTrooper.getPower()).toBe(3);
            context.player1.clickCard(context.sithTrooper);
            context.player1.clickCard(context.p2Base);

            expect(context.sithTrooper.getPower()).toBe(3);
            expect(context.p2Base.damage).toBe(5); // Only counts defending player's damaged units (3 Base power + 2 Damaged units)
            expect(context.player2).toBeActivePlayer();
            // Defeat a damage unit to validate Power adjusts correctly
            context.player2.clickCard(context.vanquish);
            context.player2.clickCard(context.atst);

            context.moveToNextActionPhase();

            context.player1.clickCard(context.sithTrooper);
            context.player1.clickCard(context.p2Base);

            expect(context.sithTrooper.getPower()).toBe(3);
            expect(context.p2Base.damage).toBe(9); // Only counts defending player's damaged units (3 Base power + 1 Damaged units) + 5 previous damage
            expect(context.player2).toBeActivePlayer();
        });
    });
});
