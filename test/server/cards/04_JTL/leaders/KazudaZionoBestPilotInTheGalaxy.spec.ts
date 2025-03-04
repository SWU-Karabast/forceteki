
describe('Kazuda Ziono, Best Pilot in the Galaxy', function() {
    integration(function(contextRef) {
        describe('leader ability', function() {
            it('should remove constant abilites from a friendly unit, and let the controller take an extra action', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: [
                            '97th-legion#keeping-the-peace-on-sullust'
                        ],
                        leader: 'kazuda-xiono#best-pilot-in-the-galaxy'
                    },
                    player2: {
                        groundArena: ['consular-security-force']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.kazudaXiono);
                context.player1.clickPrompt('Select a friendly unit');
                context.player1.clickCard(context._97thLegion);

                // 97th Legion is immediately defeated because it has 0 hp
                expect(context._97thLegion).toBeInZone('discard');

                // Player 1 should be able to take an extra action
                expect(context.player1).toBeActivePlayer();
                expect(context.kazudaXiono.exhausted).toBeTrue();
            });

            it('should remove triggered abilites from a friendly unit for the current round only', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: [
                            'contracted-hunter'
                        ],
                        leader: 'kazuda-xiono#best-pilot-in-the-galaxy'
                    },
                    player2: {
                        groundArena: ['consular-security-force']
                    }
                });

                const { context } = contextRef;

                // Use Kazuda's ability on Contracted Hunter
                context.player1.clickCard(context.kazudaXiono);
                context.player1.clickPrompt('Select a friendly unit');
                context.player1.clickCard(context.contractedHunter);

                context.player1.passAction();

                context.moveToNextActionPhase();

                // Contracted Hunter is still in play because his triggered ability was removed
                expect(context.contractedHunter).toBeInZone('groundArena');

                context.moveToNextActionPhase();

                // Contracted Hunter is defeated because his triggered ability is back
                expect(context.contractedHunter).toBeInZone('discard');
            });

            it('should remove action abilities from a friendly unit for the current round only', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['grogu#irresistible'],
                        leader: 'kazuda-xiono#best-pilot-in-the-galaxy'
                    },
                    player2: {
                        groundArena: ['consular-security-force']
                    }
                });

                const { context } = contextRef;

                // Use Kazuda's ability on Grogu
                context.player1.clickCard(context.kazudaXiono);
                context.player1.clickPrompt('Select a friendly unit');
                context.player1.clickCard(context.grogu);

                // Grogu no longer has an action ability
                context.player1.clickCard(context.grogu);

                expect(context.player1).not.toHaveEnabledPromptButton('Exhaust an enemy unit');
                expect(context.player1).toBeAbleToSelect(context.consularSecurityForce);

                context.player1.clickCard(context.consularSecurityForce);

                context.moveToNextActionPhase();

                // Grogu has his action ability back
                context.player1.clickCard(context.grogu);
                expect(context.player1).toHaveEnabledPromptButton('Exhaust an enemy unit');

                context.allowTestToEndWithOpenPrompt = true;
            });
        });
    });
});