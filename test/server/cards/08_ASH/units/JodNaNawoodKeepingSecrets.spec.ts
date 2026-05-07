describe('Jod Na Nawood, Keeping Secrets', function() {
    integration(function(contextRef) {
        describe('Jod Na Nawood\'s ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['jod-na-nawood#keeping-secrets'],
                        groundArena: ['battlefield-marine'],
                        spaceArena: ['awing'],
                        base: 'jabbas-palace'
                    },
                    player2: {
                        groundArena: ['wampa', 'atst'],
                        spaceArena: ['tieln-fighter']
                    }
                });
            });

            it('should pay 4 resources to exhaust all units in an arena', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.jodNaNawoodKeepingSecrets);

                // Should have optional prompt
                expect(context.player1).toHavePassAbilityPrompt('Pay 4 resources to exhaust each unit in an arena');
                context.player1.clickPrompt('Trigger');

                // Choose arena
                expect(context.player1).toHavePrompt('Choose an arena');
                expect(context.player1).toHaveExactPromptButtons(['Space', 'Ground']);
                context.player1.clickPrompt('Ground');

                expect(context.player2).toBeActivePlayer();
                expect(context.player1.exhaustedResourceCount).toBe(7);

                // Check all ground units are exhausted
                expect(context.battlefieldMarine.exhausted).toBe(true);
                expect(context.wampa.exhausted).toBe(true);
                expect(context.atst.exhausted).toBe(true);
                expect(context.awing.exhausted).toBe(false);
                expect(context.tielnFighter.exhausted).toBe(false);
            });

            it('should be able to target Space arena', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.jodNaNawoodKeepingSecrets);

                context.player1.clickPrompt('Trigger');
                context.player1.clickPrompt('Space');

                expect(context.player2).toBeActivePlayer();
                expect(context.player1.exhaustedResourceCount).toBe(7);

                expect(context.awing.exhausted).toBe(true);
                expect(context.tielnFighter.exhausted).toBe(true);
                expect(context.battlefieldMarine.exhausted).toBe(false);
                expect(context.wampa.exhausted).toBe(false);
            });

            it('can be passed', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.jodNaNawoodKeepingSecrets);

                // Pass on the ability
                expect(context.player1).toHaveEnabledPromptButton('Pass');
                context.player1.clickPrompt('Pass');

                expect(context.player2).toBeActivePlayer();
                expect(context.player1.exhaustedResourceCount).toBe(3);

                expect(context.battlefieldMarine.exhausted).toBe(false);
                expect(context.wampa.exhausted).toBe(false);
                expect(context.awing.exhausted).toBe(false);
                expect(context.tielnFighter.exhausted).toBe(false);
            });
        });
    });
});
