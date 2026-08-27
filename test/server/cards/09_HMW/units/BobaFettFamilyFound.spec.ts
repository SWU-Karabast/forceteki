describe('Boba Fett, Family Found', function() {
    integration(function(contextRef) {
        it('should give Raid 1 and Saboteur to a friendly unit with Ambush when it enters play', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['defenders-of-the-forest'],
                    groundArena: ['boba-fett#family-found']
                },
                player2: {
                    groundArena: ['consular-security-force', 'echo-base-defender']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.defendersOfTheForest);

            // Boba's triggered ability resolves first
            context.player1.clickPrompt('Give Raid 1 and Saboteur to Defenders of the Forest for this phase');

            expect(context.player1).toHavePassAbilityPrompt('Ambush');
            context.player1.clickPrompt('Trigger');

            expect(context.defendersOfTheForest.hasSomeKeyword('raid')).toBeTrue();
            expect(context.defendersOfTheForest.hasSomeKeyword('saboteur')).toBeTrue();

            expect(context.player1).toBeAbleToSelectExactly([context.consularSecurityForce, context.echoBaseDefender]);
            context.player1.clickCard(context.consularSecurityForce);

            expect(context.player2).toBeActivePlayer();
            expect(context.consularSecurityForce.damage).toBe(6);
        });

        it('should give Raid 1 and Saboteur to a friendly unit with Ambush when it enters play (token units)', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['drop-in'],
                    groundArena: ['boba-fett#family-found', 'darth-vader#useless-to-resist']
                },
                player2: {
                    groundArena: ['consular-security-force', 'echo-base-defender']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.dropIn);

            // Boba's triggered ability resolves first, give Raid 1 and Saboteur to both tokens
            context.player1.clickPrompt('Give it Raid 1 and Saboteur for this phase');
            context.player1.clickPrompt('Resolve all (2)');

            // Resolve Ambush for both tokens
            context.player1.clickPrompt('Resolve all (2)');
            expect(context.player1).toHavePassAbilityPrompt('Ambush');
            context.player1.clickPrompt('Trigger');

            expect(context.player1).toBeAbleToSelectExactly([context.consularSecurityForce, context.echoBaseDefender]);
            context.player1.clickCard(context.consularSecurityForce);

            expect(context.player1).toHavePassAbilityPrompt('Ambush');
            context.player1.clickPrompt('Trigger');

            expect(context.player1).toBeAbleToSelectExactly([context.consularSecurityForce, context.echoBaseDefender]);
            context.player1.clickCard(context.consularSecurityForce);

            expect(context.player2).toBeActivePlayer();
            expect(context.consularSecurityForce.damage).toBe(6);
        });

        it('should not give keywords to a friendly unit without Ambush', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['battlefield-marine'],
                    groundArena: ['boba-fett#family-found']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.battlefieldMarine);

            expect(context.battlefieldMarine.hasSomeKeyword('raid')).toBeFalse();
            expect(context.battlefieldMarine.hasSomeKeyword('saboteur')).toBeFalse();
        });
    });
});
