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

                // A single Advantage token defeats without any prompting
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
        });

        describe('When multiple Advantage tokens are on one unit', function() {
            it('lets the player resolve them one at a time via the grouped-trigger modal', async function() {
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

                const advantageTokens = context.player2.findCardsByName('advantage');

                // Trayus Acolyte attacks Battlefield Marine
                context.player1.clickCard(context.trayusAcolyte);
                context.player1.clickCard(context.battlefieldMarine);

                // The two identical Advantage triggers are grouped into one modal; resolve them one at a time
                expect(context.player2).toHavePrompt('Resolve "Defeat Advantage token"');
                expect(context.player2).toHaveExactPromptButtons(['Resolve next', 'Resolve all (2)']);
                context.player2.clickPrompt('Resolve next');

                // The last remaining token resolves automatically without another prompt
                expect(context.battlefieldMarine).toHaveExactUpgradeNames([]);
                for (const advantageToken of advantageTokens) {
                    expect(advantageToken).toBeInZone('outsideTheGame');
                }

                // Battlefield Marine took 2 damage, and Trayus Acolyte was defeated
                expect(context.battlefieldMarine.damage).toBe(2);
                expect(context.trayusAcolyte).toBeInZone('discard');
            });

            it('lets the player resolve them all at once', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['trayus-acolyte']
                    },
                    player2: {
                        groundArena: [{
                            card: 'battlefield-marine',
                            upgrades: ['advantage', 'advantage', 'advantage']
                        }]
                    }
                });

                const { context } = contextRef;

                const advantageTokens = context.player2.findCardsByName('advantage');

                // Trayus Acolyte attacks Battlefield Marine
                context.player1.clickCard(context.trayusAcolyte);
                context.player1.clickCard(context.battlefieldMarine);

                // Choosing "Resolve all remaining" resolves every Advantage token without further prompts
                expect(context.player2).toHavePrompt('Resolve "Defeat Advantage token"');
                context.player2.clickPrompt('Resolve all (3)');

                // Verify all three Advantage tokens were defeated
                expect(context.battlefieldMarine).toHaveExactUpgradeNames([]);
                for (const advantageToken of advantageTokens) {
                    expect(advantageToken).toBeInZone('outsideTheGame');
                }
                expect(context.player2).toBeActivePlayer();
            });
        });

        describe('When a unit has both Advantage tokens and its own "When Attack Ends" ability', function() {
            beforeEach(async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: [{
                            card: 'zeb-orrelios#headstrong-warrior',
                            upgrades: ['advantage', 'advantage', 'advantage']
                        }]
                    },
                    player2: {
                        groundArena: ['battlefield-marine']
                    }
                });
            });

            it('resolves all Advantage tokens together when chosen, interleaved with the unit\'s own ability', function() {
                const { context } = contextRef;

                const advantageTokens = context.player1.findCardsByName('advantage');

                // Zeb attacks and defeats Battlefield Marine
                context.player1.clickCard(context.zebOrrelios);
                context.player1.clickCard(context.battlefieldMarine);
                expect(context.battlefieldMarine).toBeInZone('discard');

                // The grouped Advantage choice is presented alongside Zeb's own "When Attack Ends" ability
                expect(context.player1).toHavePrompt('You have multiple triggers to resolve. Choose which to resolve first:');
                expect(context.player1).toHaveExactPromptButtons([
                    'Defeat Advantage token',
                    'If the defender was defeated, you may deal 4 damage to a ground unit'
                ]);

                // Select the grouped Advantage trigger, then resolve all of them at once from the modal
                context.player1.clickPrompt('Defeat Advantage token');
                expect(context.player1).toHavePrompt('Resolve "Defeat Advantage token"');
                context.player1.clickPrompt('Resolve all (3)');

                // All three Advantage tokens are defeated
                expect(context.zebOrrelios).toHaveExactUpgradeNames([]);
                for (const advantageToken of advantageTokens) {
                    expect(advantageToken).toBeInZone('outsideTheGame');
                }

                // Zeb's ability still resolves afterwards
                expect(context.player1).toHavePrompt('If the defender was defeated, you may deal 4 damage to a ground unit');
                context.player1.clickPrompt('Pass');
                expect(context.player2).toBeActivePlayer();
            });

            it('lets the Advantage tokens be interleaved with the other trigger when resolved one at a time', function() {
                const { context } = contextRef;

                const advantageTokens = context.player1.findCardsByName('advantage');

                // Zeb attacks and defeats Battlefield Marine
                context.player1.clickCard(context.zebOrrelios);
                context.player1.clickCard(context.battlefieldMarine);

                // The grouped Advantage choice sits alongside Zeb's ability
                expect(context.player1).toHaveExactPromptButtons([
                    'Defeat Advantage token',
                    'If the defender was defeated, you may deal 4 damage to a ground unit'
                ]);

                // Resolve a single Advantage token, then return to the ordering prompt
                context.player1.clickPrompt('Defeat Advantage token');
                expect(context.player1).toHaveExactPromptButtons(['Resolve next', 'Resolve all (3)']);
                context.player1.clickPrompt('Resolve next');

                // Zeb's ability can be resolved in the middle of the Advantage token defeats
                expect(context.player1).toHaveExactPromptButtons([
                    'Defeat Advantage token',
                    'If the defender was defeated, you may deal 4 damage to a ground unit'
                ]);
                context.player1.clickPrompt('If the defender was defeated, you may deal 4 damage to a ground unit');
                context.player1.clickPrompt('Pass');

                // The remaining two Advantage tokens then resolve from the modal
                expect(context.player1).toHavePrompt('Resolve "Defeat Advantage token"');
                context.player1.clickPrompt('Resolve all (2)');

                expect(context.zebOrrelios).toHaveExactUpgradeNames([]);
                for (const advantageToken of advantageTokens) {
                    expect(advantageToken).toBeInZone('outsideTheGame');
                }
            });
        });

        describe('When both the attacker and defender have multiple Advantage tokens', function() {
            it('prompts each controlling player for their own grouped-trigger resolution', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: [{
                            card: 'consular-security-force',
                            upgrades: ['advantage', 'advantage']
                        }]
                    },
                    player2: {
                        groundArena: [{
                            card: 'outer-rim-mystic',
                            upgrades: ['advantage', 'advantage']
                        }]
                    }
                });

                const { context } = contextRef;
                const allAdvantageTokens = [
                    ...context.player1.findCardsByName('advantage'),
                    ...context.player2.findCardsByName('advantage')
                ];

                // Consular Security Force attacks Outer Rim Mystic; both survive so both keep their Advantage tokens through to attack end
                context.player1.clickCard(context.consularSecurityForce);
                context.player1.clickCard(context.outerRimMystic);

                // Active player chooses which player resolves their triggers first
                expect(context.player1).toHavePrompt('Both players have triggered abilities in response. Choose a player to resolve all of their abilities first:');
                context.player1.clickPrompt('You');

                // Player1's two Advantage tokens are their only triggers, so the grouped modal appears directly
                expect(context.player1).toHavePrompt('Resolve "Defeat Advantage token"');
                context.player1.clickPrompt('Resolve all (2)');

                // Player2 then resolves their own grouped Advantage tokens
                expect(context.player2).toHavePrompt('Resolve "Defeat Advantage token"');
                context.player2.clickPrompt('Resolve all (2)');

                // All Advantage tokens across both units are defeated
                expect(context.consularSecurityForce).toHaveExactUpgradeNames([]);
                expect(context.outerRimMystic).toHaveExactUpgradeNames([]);
                for (const advantageToken of allAdvantageTokens) {
                    expect(advantageToken).toBeInZone('outsideTheGame');
                }
            });
        });

        describe('When defeating the Advantage tokens triggers another ability', function() {
            beforeEach(async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: [
                            'zeb-orrelios#fists-work-every-time',
                            { card: 'wampa', upgrades: ['advantage', 'advantage', 'advantage'] }
                        ]
                    }
                });
            });

            it('fires the trigger once per token when resolved all at once', function() {
                const { context } = contextRef;

                // Wampa attacks the enemy base
                context.player1.clickCard(context.wampa);
                context.player1.clickCard(context.p2Base);

                // Resolve all Advantage tokens at once; each token is still a separate defeat so Zeb fires three times
                expect(context.player1).toHavePrompt('Resolve "Defeat Advantage token"');
                context.player1.clickPrompt('Resolve all (3)');

                // The three Zeb triggers fire (one per Advantage token defeated); use non-checking clicks as prompts are identical
                context.player1.clickCardNonChecking(context.p2Base);
                context.player1.clickCardNonChecking(context.p2Base);
                context.player1.clickCardNonChecking(context.p2Base);

                // 7 combat damage + 3 from Zeb's three triggers (one per Advantage token defeated)
                expect(context.wampa).toHaveExactUpgradeNames([]);
                expect(context.p2Base.damage).toBe(10);
                expect(context.player2).toBeActivePlayer();
            });

            it('fires the trigger once per token when resolved one at a time', function() {
                const { context } = contextRef;

                // Wampa attacks the enemy base
                context.player1.clickCard(context.wampa);
                context.player1.clickCard(context.p2Base);

                // Resolve the Advantage tokens one at a time from the modal
                expect(context.player1).toHavePrompt('Resolve "Defeat Advantage token"');
                context.player1.clickPrompt('Resolve next');

                // Token 1's defeat fires Zeb's trigger (non-checking — prompt is identical to next)
                context.player1.clickCardNonChecking(context.p2Base);

                // Token 2: choose to defeat it, then resolve Zeb's trigger
                expect(context.player1).toHavePrompt('Resolve "Defeat Advantage token"');
                context.player1.clickPrompt('Resolve next');
                context.player1.clickCardNonChecking(context.p2Base);

                // Token 3 auto-resolves as the last remaining trigger, then resolve Zeb's trigger
                context.player1.clickCardNonChecking(context.p2Base);

                // 7 combat damage + 3 from Zeb's three triggers (one per Advantage token defeated)
                expect(context.wampa).toHaveExactUpgradeNames([]);
                expect(context.p2Base.damage).toBe(10);
                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});
