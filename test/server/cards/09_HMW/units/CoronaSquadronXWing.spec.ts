describe('Corona Squadron X-Wing', function() {
    integration(function(contextRef) {
        beforeEach(async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    spaceArena: ['corona-squadron-xwing'],
                    resources: {
                        readyCount: 5,
                        exhaustedCount: 1
                    }
                },
                player2: {
                    resources: {
                        readyCount: 5,
                        exhaustedCount: 1
                    }
                }
            });
        });

        it('should ready a resource on attack', function () {
            const { context } = contextRef;

            // Attack with Corona Squadron X-Wing
            context.player1.clickCard(context.coronaSquadronXwing);
            context.player1.clickCard(context.p2Base);

            // Ability triggers, choose self
            expect(context.player1).toHavePrompt('Choose a player to ready a resource');
            expect(context.player1).toHaveExactPromptButtons(['You', 'Opponent', 'Pass']);
            context.player1.clickPrompt('You');

            // Only player1's resource should be readied
            expect(context.player1.exhaustedResourceCount).toBe(0);
            expect(context.player2.exhaustedResourceCount).toBe(1);
        });

        it('should ready an enemy resource on attack', function () {
            const { context } = contextRef;

            // Attack with Corona Squadron X-Wing
            context.player1.clickCard(context.coronaSquadronXwing);
            context.player1.clickCard(context.p2Base);

            // Ability triggers, choose opponent
            context.player1.clickPrompt('Opponent');

            // Only player2's resource should be readied
            expect(context.player2.exhaustedResourceCount).toBe(0);
            expect(context.player1.exhaustedResourceCount).toBe(1);
        });

        it('should be able to be passed', function () {
            const { context } = contextRef;

            // Attack with Corona Squadron X-Wing
            context.player1.clickCard(context.coronaSquadronXwing);
            context.player1.clickCard(context.p2Base);

            // Ability triggers, choose to pass
            context.player1.clickPrompt('Pass');

            expect(context.player1.exhaustedResourceCount).toBe(1);
            expect(context.player2.exhaustedResourceCount).toBe(1);
        });
    });
});