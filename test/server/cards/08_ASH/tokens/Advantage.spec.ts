describe('Advantage', function() {
    integration(function(contextRef) {
        describe('Basics', function() {
            it('is correctly created and attached in a test setup', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: [{
                            card: 'battlefield-marine',
                            upgrades: ['advantage']
                        }]
                    }
                });

                const { context } = contextRef;

                // Verify it gives the +1/+0 upgrade stats
                expect(context.battlefieldMarine.getPower()).toBe(4);
                expect(context.battlefieldMarine.getHp()).toBe(3);

                expect(context.battlefieldMarine).toHaveExactUpgradeNames(['advantage']);
            });
        });

        describe('Advantage\'s ability', function() {
            it('should be defeated at the end of the attached unit\'s attack', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: [{
                            card: 'battlefield-marine',
                            upgrades: ['advantage']
                        }]
                    },
                    player2: {
                        groundArena: ['trayus-acolyte']
                    }
                });

                const { context } = contextRef;

                // Battlefield Marine attacks Trayus Acolyte
                context.player1.clickCard(context.battlefieldMarine);
                context.player1.clickCard(context.trayusAcolyte);

                // Verify the attack went through and the Advantage token was defeated
                expect(context.battlefieldMarine).toHaveExactUpgradeNames([]);
                expect(context.advantage).toBeInZone('outsideTheGame');

                // Battlefield Marine took 2 damage, and Trayus Acolyte was defeated by the 4 damage
                expect(context.battlefieldMarine.damage).toBe(2);
                expect(context.trayusAcolyte).toBeInZone('discard');

                // Chat logs confirm order of events is correct
                expect(context.getChatLogs(3)).toEqual([
                    'player1 attacks Trayus Acolyte with Battlefield Marine',
                    'player2\'s Trayus Acolyte is defeated by player1 due to having no remaining HP',
                    'player1 uses Advantage to defeat Advantage',
                ]);
            });

            it('should be defeated at the end of an attack if the attached unit is the defender', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['trayus-acolyte']
                    },
                    player2: {
                        groundArena: [{
                            card: 'battlefield-marine',
                            upgrades: ['advantage']
                        }]
                    }
                });

                const { context } = contextRef;

                // Trayus Acolyte attacks Battlefield Marine
                context.player1.clickCard(context.trayusAcolyte);
                context.player1.clickCard(context.battlefieldMarine);

                // Verify the attack went through and the Advantage token was defeated
                expect(context.battlefieldMarine).toHaveExactUpgradeNames([]);
                expect(context.advantage).toBeInZone('outsideTheGame');

                // Battlefield Marine took 2 damage, and Trayus Acolyte was defeated by the 4 damage
                expect(context.battlefieldMarine.damage).toBe(2);
                expect(context.trayusAcolyte).toBeInZone('discard');

                // Chat logs confirm order of events is correct
                expect(context.getChatLogs(3)).toEqual([
                    'player1 attacks Battlefield Marine with Trayus Acolyte',
                    'player1\'s Trayus Acolyte is defeated by player2 due to having no remaining HP',
                    'player2 uses Advantage to defeat Advantage',
                ]);
            });

            it('when multiple copies are attached, they should all be defeated at the end of the attack', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['trayus-acolyte']
                    },
                    player2: {
                        groundArena: [{
                            card: 'battlefield-marine',
                            upgrades: ['advantage', 'advantage']
                        }]
                    }
                });

                const { context } = contextRef;

                const advantageTokens = context.player1.findCardsByName('advantage');

                // Trayus Acolyte attacks Battlefield Marine
                context.player1.clickCard(context.trayusAcolyte);
                context.player1.clickCard(context.battlefieldMarine);

                // Resolve simultaneous triggers
                expect(context.player2).toHavePrompt('You have multiple triggers to resolve. Choose which to resolve first:');
                expect(context.player2).toHaveExactPromptButtons(['Defeat Advantage token', 'Defeat Advantage token']);
                context.player2.clickPrompt('Defeat Advantage token');

                // Verify both Advantage tokens were defeated
                expect(context.battlefieldMarine).toHaveExactUpgradeNames([]);
                for (const advantageToken of advantageTokens) {
                    expect(advantageToken).toBeInZone('outsideTheGame');
                }

                // Battlefield Marine took 2 damage, and Trayus Acolyte was defeated
                expect(context.battlefieldMarine.damage).toBe(2);
                expect(context.trayusAcolyte).toBeInZone('discard');

                // Chat logs confirm order of events is correct
                expect(context.getChatLogs(4)).toEqual([
                    'player1 attacks Battlefield Marine with Trayus Acolyte',
                    'player1\'s Trayus Acolyte is defeated by player2 due to having no remaining HP',
                    'player2 uses Advantage to defeat Advantage',
                    'player2 uses Advantage to defeat Advantage',
                ]);
            });
        });
    });
});
