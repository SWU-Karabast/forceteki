describe('Low Altitude Combat', function () {
    integration(function (contextRef) {
        it('moves a friendly space unit to the ground arena, then may attack with a ground unit that gets +2/+0', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['low-altitude-combat'],
                    spaceArena: ['alliance-xwing', 'awing'],
                    groundArena: ['battlefield-marine']
                },
                player2: {
                    spaceArena: ['green-squadron-awing']
                }
            });

            const { context } = contextRef;
            const lowAltitudeCombat = context.player1.findCardByName('low-altitude-combat');

            context.player1.clickCard(lowAltitudeCombat);

            // Choose a space unit to move
            expect(context.player1).toBeAbleToSelectExactly([context.allianceXwing, context.awing]);
            context.player1.clickCard(context.allianceXwing);

            // The space unit is now in the ground arena
            expect(context.allianceXwing).toBeInZone('groundArena');

            // If you do attack prompt: select a ground attacker or pass
            expect(context.player1).toHavePrompt('Attack with a ground unit. It gets +2/+0 for this attack.');
            expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.allianceXwing]);
            context.player1.clickCard(context.allianceXwing);

            // Attack the enemy base
            context.player1.clickCard(context.p2Base);

            expect(context.allianceXwing).toBeInZone('groundArena');
            expect(context.allianceXwing.exhausted).toBeTrue();
            expect(context.p2Base.damage).toBe(4);
        });
    });
});
