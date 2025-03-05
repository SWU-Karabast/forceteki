
describe('Kazuda Ziono, Best Pilot in the Galaxy', function() {
    integration(function(contextRef) {
        describe('Kazuda\'s undeployed leader ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'kazuda-xiono#best-pilot-in-the-galaxy',
                        groundArena: ['contracted-hunter'],
                        spaceArena: ['fireball#an-explosion-with-wings']
                    },
                    player2: {
                        hand: ['superlaser-blast'],
                        groundArena: ['consular-security-force'],
                        spaceArena: ['tieln-fighter']
                    }
                });
            });

            // FYI: More extensive "lose all abilities" tests can be found in LoseAllAbilities.spec.ts

            it('removes all abilities from a friendly unit for the round, and allows the controller to take another action', function() {
                const { context } = contextRef;

                // Use Kazuda's ability on Contracted Hunter
                context.player1.clickCard(context.kazudaXiono);

                expect(context.player1).toHaveEnabledPromptButton('Select a friendly unit');
                context.player1.clickPrompt('Select a friendly unit');

                expect(context.player1).toBeAbleToSelectExactly([context.fireball, context.contractedHunter]);
                context.player1.clickCard(context.contractedHunter);

                expect(context.kazudaXiono.exhausted).toBeTrue();

                // Player 1 can take another action
                expect(context.player1).toBeActivePlayer();
                context.player1.clickCard(context.fireball);
                context.player1.clickCard(context.p2Base);

                // Begin regroup phase
                context.moveToRegroupPhase();

                // Contracted Hunter is still in play because his treiggered ability was removed
                expect(context.contractedHunter).toBeInZone('groundArena');

                // Move to the regroup phase of the next round
                context.nextPhase();
                context.moveToRegroupPhase();

                // Resolve simultaneous triggers
                expect(context.player1).toHaveExactPromptButtons([
                    'Defeat this unit',
                    'Deal 1 damage to this unit.',
                ]);
                context.player1.clickPrompt('Defeat this unit');

                // Contracted Hunter is defeated because his triggered ability is back
                expect(context.contractedHunter).toBeInZone('discard');
            });

            it('cannot soft pass if there is no friendly target because the controller must take another action', function() {
                const { context } = contextRef;

                context.player1.passAction();
                context.player2.clickCard(context.superlaserBlast);

                expect(context.player1.groundArena.length).toBe(0);
                expect(context.player1.spaceArena.length).toBe(0);

                // Use Kazuda's ability with no friendly units on board
                context.player1.clickCard(context.kazudaXiono);
                context.player1.clickPrompt('Select a friendly unit');

                // Kazuda is exhausted, but it is still Player 1's turn
                expect(context.kazudaXiono.exhausted).toBeTrue();
                expect(context.player1).toBeActivePlayer();

                // If both players pass, the phase ends as normal
                context.player1.passAction();
                context.player2.passAction();

                expect(context.game.currentPhase).toBe('regroup');
            });
        });

        describe('Kazuda\'s deployed unit ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: { card: 'kazuda-xiono#best-pilot-in-the-galaxy', deployed: true },
                        hand: ['heroic-sacrifice'],
                        groundArena: [
                            'contracted-hunter',
                            'k2so#cassians-counterpart'
                        ],
                        spaceArena: [
                            'fireball#an-explosion-with-wings',
                            'millennium-falcon#piece-of-junk'
                        ]
                    },
                    player2: {
                        hand: ['superlaser-blast'],
                        groundArena: ['consular-security-force'],
                        spaceArena: ['tieln-fighter']
                    }
                });
            });

            it('can select no units to lose abilities', function() {
                const { context } = contextRef;

                context.player1.clickCard(context.kazudaXiono);
                context.player1.clickCard(context.consularSecurityForce);

                expect(context.player1).toHaveEnabledPromptButton('Choose no target');

                context.player1.clickPrompt('Choose no target');
            });
        });
    });
});