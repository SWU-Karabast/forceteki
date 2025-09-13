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

        it('should apply the +2/+2 buff when Jar Jar is played using Plot', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    leader: 'cal-kestis#i-cant-keep-hiding',
                    groundArena: ['battlefield-marine'],
                    resources: ['jar-jar-binks#mesa-propose', 'wampa', 'atst', 'superlaser-technician'],
                }
            });

            const { context } = contextRef;

            // Deploy leader to open Plot window
            context.player1.clickCard(context.calKestis);
            context.player1.clickPrompt('Deploy Cal Kestis');

            // Play Jar Jar using Plot from resources
            expect(context.player1).toHavePassAbilityPrompt('Play Jar Jar Binks using Plot');
            context.player1.clickPrompt('Trigger');

            // Choose Battlefield Marine to receive +2/+2 this phase
            expect(context.player1).toBeAbleToSelectAllOf([context.battlefieldMarine, context.calKestis]);
            context.player1.clickCard(context.battlefieldMarine);

            // Action should pass to Player 2 after resolving deployment and Plot
            expect(context.player2).toBeActivePlayer();
            context.player2.passAction();

            // Attack base with the buffed unit; Battlefield Marine printed power 3 -> expect 5 damage
            context.player1.clickCard(context.battlefieldMarine);
            context.player1.clickCard(context.p2Base);
            expect(context.p2Base.damage).toBe(5);

            // Buff should expire at the end of the phase
            context.moveToNextActionPhase();
            expect(context.battlefieldMarine.getPower()).toBe(3);
            expect(context.battlefieldMarine.getHp()).toBe(3);
        });
    });
});
