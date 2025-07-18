
describe('Darth Maul, Sith Revealed', function() {
    integration(function (contextRef) {
        describe('Darth Maul\'s Leader side ability', function () {
            it('exhausts itself and uses the Force to deal 1 damage to a unit and 1 damage to a different unit', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'darth-maul#sith-revealed',
                        hasForceToken: true,
                        groundArena: [
                            'guardian-of-the-whills',
                        ]
                    },
                    player2: {
                        groundArena: ['battlefield-marine', 'consular-security-force'],
                    }
                });

                const { context } = contextRef;

                // Ensure we have the Force to pay for Darth Maul's ability
                expect(context.player1.hasTheForce).toBe(true);

                // Use Darth Maul's ability
                context.player1.clickCard(context.darthMaul);
                expect(context.player1).toHaveExactPromptButtons([
                    'Deal 1 damage to a unit and 1 damage to a different unit',
                    'Deploy Darth Maul',
                    'Cancel'
                ]);

                context.player1.clickPrompt('Deal 1 damage to a unit and 1 damage to a different unit');
                expect(context.player1).toHavePrompt('Choose units to deal 1 damage to');
                expect(context.player1).toBeAbleToSelectExactly([
                    context.battlefieldMarine,
                    context.consularSecurityForce,
                    context.guardianOfTheWhills
                ]);

                context.player1.clickCard(context.battlefieldMarine);
                context.player1.clickCard(context.consularSecurityForce);
                context.player1.clickPrompt('Done');

                // Check that the costs were paid
                expect(context.darthMaul.exhausted).toBe(true);
                expect(context.player1.hasTheForce).toBe(false);

                // Check that the damage was dealt correctly
                expect(context.battlefieldMarine.damage).toBe(1);
                expect(context.consularSecurityForce.damage).toBe(1);
                expect(context.guardianOfTheWhills.damage).toBe(0);
            });

            it('must deal damage to 2 different units (including friendly) if there are at least 2 units in play', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'darth-maul#sith-revealed',
                        hasForceToken: true,
                        groundArena: [
                            'guardian-of-the-whills',
                        ]
                    },
                    player2: {
                        groundArena: ['battlefield-marine'],
                    }
                });

                const { context } = contextRef;

                // Ensure we have the Force to pay for Darth Maul's ability
                expect(context.player1.hasTheForce).toBe(true);

                // Use Darth Maul's ability
                context.player1.clickCard(context.darthMaul);
                expect(context.player1).toHaveExactPromptButtons([
                    'Deal 1 damage to a unit and 1 damage to a different unit',
                    'Deploy Darth Maul',
                    'Cancel'
                ]);

                context.player1.clickPrompt('Deal 1 damage to a unit and 1 damage to a different unit');
                expect(context.player1).toHavePrompt('Choose units to deal 1 damage to');
                expect(context.player1).toBeAbleToSelectExactly([
                    context.battlefieldMarine,
                    context.guardianOfTheWhills
                ]);

                context.player1.clickCard(context.battlefieldMarine);

                // We cannot click Done yet
                expect(context.player1).not.toHaveEnabledPromptButton('Done');

                // We must select a different unit
                context.player1.clickCard(context.guardianOfTheWhills);

                // Now we can click Done
                expect(context.player1).toHaveEnabledPromptButton('Done');
                context.player1.clickPrompt('Done');

                // Check that the damage was dealt correctly
                expect(context.battlefieldMarine.damage).toBe(1);
                expect(context.guardianOfTheWhills.damage).toBe(1);
            });

            it('can deal damage to a single unit if there is only 1 unit in play', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'darth-maul#sith-revealed',
                        hasForceToken: true,
                        groundArena: [
                            'guardian-of-the-whills',
                        ]
                    }
                });

                const { context } = contextRef;

                // Ensure we have the Force to pay for Darth Maul's ability
                expect(context.player1.hasTheForce).toBe(true);

                // Use Darth Maul's ability
                context.player1.clickCard(context.darthMaul);
                expect(context.player1).toHaveExactPromptButtons([
                    'Deal 1 damage to a unit and 1 damage to a different unit',
                    'Deploy Darth Maul',
                    'Cancel'
                ]);

                context.player1.clickPrompt('Deal 1 damage to a unit and 1 damage to a different unit');
                expect(context.player1).toHavePrompt('Choose units to deal 1 damage to');
                expect(context.player1).toBeAbleToSelectExactly([
                    context.guardianOfTheWhills
                ]);

                // We can only select the Guardian of the Whills
                context.player1.clickCard(context.guardianOfTheWhills);

                // Ability is resolved immediately in this case
                expect(context.guardianOfTheWhills.damage).toBe(1);
                expect(context.player2).toBeActivePlayer();
            });

            it('can be used to soft pass if there are no units in play', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'darth-maul#sith-revealed',
                        hasForceToken: true,
                    }
                });

                const { context } = contextRef;

                // Ensure we have the Force to pay for Darth Maul's ability
                expect(context.player1.hasTheForce).toBe(true);

                // Use Darth Maul's ability
                context.player1.clickCard(context.darthMaul);
                expect(context.player1).toHaveExactPromptButtons([
                    'Deal 1 damage to a unit and 1 damage to a different unit',
                    'Deploy Darth Maul',
                    'Cancel'
                ]);

                context.player1.clickPrompt('Deal 1 damage to a unit and 1 damage to a different unit');

                expect(context.darthMaul.exhausted).toBe(true);
                expect(context.player1.hasTheForce).toBe(false);
                expect(context.player2).toBeActivePlayer();
            });

            it('cannot be used if the player does not have the Force', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'darth-maul#sith-revealed',
                        base: 'shadowed-undercity'
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.darthMaul);
                context.player1.clickPrompt('Deploy Darth Maul');

                // Darth Maul is deployed because there is no other valid action
                expect(context.darthMaul).toBeInZone('groundArena');
            });
        });

        describe('Darth Maul\'s Unit side ability', function () {
            it('on attack, deals 1 damage to a unit and 1 damage to a different unit', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: { card: 'darth-maul#sith-revealed', deployed: true },
                    },
                    player2: {
                        groundArena: ['battlefield-marine', 'consular-security-force'],
                    }
                });

                const { context } = contextRef;

                // Attack with Darth Maul
                context.player1.clickCard(context.darthMaul);
                context.player1.clickCard(context.p2Base);

                // Darth Maul's ability should trigger
                expect(context.player1).toHavePrompt('Choose units to deal 1 damage to');
                expect(context.player1).toBeAbleToSelectExactly([
                    context.battlefieldMarine,
                    context.consularSecurityForce,
                    context.darthMaul
                ]);

                context.player1.clickCard(context.battlefieldMarine);
                context.player1.clickCard(context.consularSecurityForce);

                expect(context.player1).toHaveEnabledPromptButton('Done');
                context.player1.clickPrompt('Done');

                // Check that the damage was dealt correctly
                expect(context.battlefieldMarine.damage).toBe(1);
                expect(context.consularSecurityForce.damage).toBe(1);
                expect(context.darthMaul.damage).toBe(0);
            });

            it('must damage himself if there are no other units in play', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: { card: 'darth-maul#sith-revealed', deployed: true },
                    }
                });

                const { context } = contextRef;

                // Attack with Darth Maul
                context.player1.clickCard(context.darthMaul);
                context.player1.clickCard(context.p2Base);

                // Darth Maul's ability should trigger
                expect(context.player1).toHavePrompt('Choose units to deal 1 damage to');
                expect(context.player1).toBeAbleToSelectExactly([
                    context.darthMaul
                ]);

                context.player1.clickCard(context.darthMaul);

                // Ability is resolved immediately in this case
                expect(context.darthMaul.damage).toBe(1);
            });
        });
    });
});
