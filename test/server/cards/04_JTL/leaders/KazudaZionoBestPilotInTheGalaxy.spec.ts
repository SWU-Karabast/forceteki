
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

            it('can select a friendly unit to lose all abilities for the round, and allows the controller to take another action', function() {
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

        describe('Kazuda\'s deployed unit on-attack ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: { card: 'kazuda-xiono#best-pilot-in-the-galaxy', deployed: true },
                        base: { card: 'dagobah-swamp', damage: 10 },
                        hand: ['heroic-sacrifice', 'devotion'],
                        groundArena: [
                            'contracted-hunter',
                            'k2so#cassians-counterpart'
                        ],
                        spaceArena: [
                            'fireball#an-explosion-with-wings',
                            'frontline-shuttle'
                        ]
                    },
                    player2: {
                        hand: ['takedown'],
                        groundArena: ['consular-security-force'],
                        spaceArena: ['tieln-fighter']
                    }
                });
            });

            it('can select multiple units to lose all abilities for the round', function() {
                const { context } = contextRef;

                // Initiate an attack with Kazuda
                context.player1.clickCard(context.kazudaXiono);
                context.player1.clickCard(context.consularSecurityForce);

                expect(context.player1).toHavePrompt('Choose friendly units that will lose all abilities for this round');
                expect(context.player1).toHaveExactPromptButtons(['Done', 'Choose no target']);
                expect(context.player1).toBeAbleToSelectExactly([
                    context.contractedHunter,
                    context.k2so,
                    context.kazudaXiono,
                    context.fireball,
                    context.frontlineShuttle
                ]);

                // Select Contracted Hunter and Fireball
                context.player1.clickCard(context.contractedHunter);
                context.player1.clickCard(context.fireball);
                context.player1.clickPrompt('Done');

                // Trigger K2SO's ability to ensure it is still active
                context.player2.clickCard(context.takedown);
                context.player2.clickCard(context.k2so);

                expect(context.player1).toHaveExactPromptButtons([
                    'Deal 3 damage to opponent\'s base',
                    'The opponent discards a card'
                ]);
                context.player1.clickPrompt('Deal 3 damage to opponent\'s base');

                // Move to the regroup phase
                context.moveToRegroupPhase();

                // Check that Contracted Hunter and Fireball's triggers did not fire
                expect(context.contractedHunter).toBeInZone('groundArena');
                expect(context.fireball.damage).toBe(0);

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
                expect(context.fireball.damage).toBe(1);
            });

            it('can select himself to remove his own abilities for the round', function() {
                const { context } = contextRef;

                // Play Devotion on Kazuda to give him Restore 2
                context.player1.clickCard(context.devotion);
                context.player1.clickCard(context.kazudaXiono);

                context.player2.passAction();

                // Initiate an attack
                context.player1.clickCard(context.kazudaXiono);
                context.player1.clickCard(context.p2Base);

                // Choose trigger order
                expect(context.player1).toHaveExactPromptButtons([
                    'Choose any number of friendly units',
                    'Restore 2'
                ]);

                // Resolve his ability first
                context.player1.clickPrompt('Choose any number of friendly units');
                expect(context.player1).toHavePrompt('Choose friendly units that will lose all abilities for this round');

                // Remove his own abilities (among others)
                context.player1.clickCard(context.kazudaXiono);
                context.player1.clickCard(context.contractedHunter);
                context.player1.clickCard(context.fireball);
                context.player1.clickPrompt('Done');

                // No damage was restored because Kazuda lost his abilities
                expect(context.p1Base.damage).toBe(10);

                context.player2.passAction();

                // Use Frontline Shuttle's ability to attack with Kazuda again
                context.player1.clickCard(context.frontlineShuttle);
                context.player1.clickPrompt('Attack with a unit, even if it’s exhausted. It can’t attack bases for this attack.');
                context.player1.clickCard(context.kazudaXiono);
                context.player1.clickCard(context.consularSecurityForce);

                // No on-attack trigger, and still no restore
                expect(context.player1).not.toHaveExactPromptButtons([
                    'Choose any number of friendly units',
                    'Restore 2'
                ]);

                expect(context.p1Base.damage).toBe(10);

                // Move to next action phase
                context.moveToNextActionPhase();

                // Attack with Kazuda, and all his abilities are back
                context.player1.clickCard(context.kazudaXiono);
                context.player1.clickCard(context.p2Base);

                expect(context.player1).toHaveExactPromptButtons([
                    'Choose any number of friendly units',
                    'Restore 2'
                ]);
                context.player1.clickPrompt('Restore 2');
                context.player1.clickPrompt('Done');

                // Base HP is restored by 2
                expect(context.p1Base.damage).toBe(8);
            });

            it('can select no units to lose abilities', function() {
                const { context } = contextRef;

                context.player1.clickCard(context.kazudaXiono);
                context.player1.clickCard(context.consularSecurityForce);

                expect(context.player1).toHaveEnabledPromptButton('Choose no target');

                context.player1.clickPrompt('Choose no target');
            });
        });

        describe('Kazuda\'s deployed pilot on-attack ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'kazuda-xiono#best-pilot-in-the-galaxy',
                        base: { card: 'dagobah-swamp', damage: 10 },
                        hand: ['heroic-sacrifice', 'devotion'],
                        groundArena: [
                            'contracted-hunter',
                            'k2so#cassians-counterpart'
                        ],
                        spaceArena: [
                            'fireball#an-explosion-with-wings',
                            'frontline-shuttle'
                        ]
                    },
                    player2: {
                        hand: ['takedown'],
                        groundArena: ['consular-security-force'],
                        spaceArena: ['tieln-fighter']
                    }
                });
            });

            it('can select multiple units to lose all abilities for the round', function() {
                const { context } = contextRef;

                // Deploy Kazuda as a Pilot on Fireball
                context.player1.clickCard(context.kazudaXiono);
                expect(context.player1).toHaveExactPromptButtons([
                    'Deploy Kazuda Xiono as a Pilot',
                    'Select a friendly unit',
                    'Deploy Kazuda Xiono',
                    'Cancel'
                ]);

                context.player1.clickPrompt('Deploy Kazuda Xiono as a pilot');
                context.player1.clickCard(context.fireball);

                expect(context.kazudaXiono.deployed).toBe(true);
                expect(context.kazudaXiono).toBeInZone('spaceArena');
                expect(context.fireball.getPower()).toBe(6);
                expect(context.fireball.getHp()).toBe(6);
                expect(context.fireball).toHaveExactUpgradeNames(['kazuda-xiono#best-pilot-in-the-galaxy']);

                context.player2.passAction();

                // Initiate an attack with Fireball, triggering Kazuda's ability
                context.player1.clickCard(context.fireball);
                context.player1.clickCard(context.p2Base);

                expect(context.player1).toHavePrompt('Choose friendly units that will lose all abilities for this round');
                expect(context.player1).toHaveExactPromptButtons(['Done', 'Choose no target']);
                expect(context.player1).toBeAbleToSelectExactly([
                    context.contractedHunter,
                    context.k2so,
                    context.fireball,
                    context.frontlineShuttle
                ]);

                // Select Contracted Hunter and Fireball
                context.player1.clickCard(context.contractedHunter);
                context.player1.clickCard(context.fireball);
                context.player1.clickPrompt('Done');

                // Move to the regroup phase
                context.moveToRegroupPhase();

                // Check that Contracted Hunter and Fireball's triggers did not fire
                expect(context.contractedHunter).toBeInZone('groundArena');
                expect(context.fireball.damage).toBe(0);

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
                expect(context.fireball.damage).toBe(1);
            });
        });
    });
});