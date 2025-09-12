describe('Jar Jar Binks, Mesa Propose', function () {
    integration(function (contextRef) {
        it('Jar Jar Binks\'s ability should give +2/+2 to a friendly unit for the phase', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['jar-jar-binks#mesa-propose'],
                    groundArena: ['battlefield-marine']
                },
            });
            const { context } = contextRef;

            // Play Jar Jar and choose Battlefield Marine to receive +2/+2 this phase
            context.player1.clickCard(context.jarJarBinksMesaPropose);
            expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine]);
            context.player1.clickCard(context.battlefieldMarine);

            context.player2.passAction();

            // Attack base with the buffed unit; Battlefield Marine printed power 3 -> expect 5 damage
            context.player1.clickCard(context.battlefieldMarine);
            context.player1.clickCard(context.p2Base);
            expect(context.p2Base.damage).toBe(5);

            context.moveToNextActionPhase();

            expect(context.battlefieldMarine.getPower()).toBe(3);
            expect(context.battlefieldMarine.getHp()).toBe(3);
        });
    });
});
