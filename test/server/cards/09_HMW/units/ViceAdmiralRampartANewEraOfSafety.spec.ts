describe('Vice Admiral Rampart, A New Era of Safety', function() {
    integration(function(contextRef) {
        describe('his replacement ability', function() {
            const replacementPromptTitle = 'Defeat this unit to prevent an upgrade on your base from being defeated';

            describe('when a single upgrade on the friendly base would be defeated', function() {
                beforeEach(async function() {
                    await contextRef.setupTestAsync({
                        phase: 'action',
                        player1: {
                            groundArena: ['vice-admiral-rampart#a-new-era-of-safety'],
                            base: { card: 'kestro-city', upgrades: ['sinister-war-memorial'] }
                        },
                        player2: {
                            hand: ['confiscate'],
                            hasInitiative: true
                        }
                    });
                });

                it('should defeat Rampart instead and save the base upgrade when accepted', function() {
                    const { context } = contextRef;

                    // P2 plays Confiscate targeting the base upgrade
                    context.player2.clickCard(context.confiscate);
                    context.player2.clickCard(context.sinisterWarMemorial);

                    // P1 accepts Rampart's replacement effect
                    expect(context.player1).toHavePassAbilityPrompt(replacementPromptTitle);
                    context.player1.clickPrompt('Trigger');

                    // Rampart is defeated instead, base upgrade survives
                    expect(context.viceAdmiralRampart).toBeInZone('discard');
                    expect(context.p1Base).toHaveExactUpgradeNames(['sinister-war-memorial']);
                });

                it('should allow the player to decline, letting the base upgrade be defeated normally', function() {
                    const { context } = contextRef;

                    // P2 plays Confiscate targeting the base upgrade
                    context.player2.clickCard(context.confiscate);
                    context.player2.clickCard(context.sinisterWarMemorial);

                    // P1 declines Rampart's replacement effect
                    expect(context.player1).toHavePassAbilityPrompt(replacementPromptTitle);
                    context.player1.clickPrompt('Pass');

                    // Base upgrade is defeated normally, Rampart remains in play
                    expect(context.sinisterWarMemorial).toBeInZone('discard');
                    expect(context.p1Base).toHaveExactUpgradeNames([]);
                    expect(context.viceAdmiralRampart).toBeInZone('groundArena');
                });
            });

            it('should not trigger when the defeated upgrade is attached to a unit rather than the base', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: [
                            'vice-admiral-rampart#a-new-era-of-safety',
                            { card: 'pyke-sentinel', upgrades: ['entrenched'] }
                        ],
                        base: { card: 'kestro-city', upgrades: ['sinister-war-memorial'] }
                    },
                    player2: {
                        hand: ['confiscate'],
                        hasInitiative: true
                    }
                });

                const { context } = contextRef;

                // P2 plays Confiscate, choosing the unit's upgrade instead of the base upgrade
                context.player2.clickCard(context.confiscate);
                expect(context.player2).toBeAbleToSelectExactly([context.entrenched, context.sinisterWarMemorial]);
                context.player2.clickCard(context.entrenched);

                // Rampart's ability does not trigger since the defeated upgrade was not on the base
                expect(context.entrenched).toBeInZone('discard');
                expect(context.pykeSentinel.isUpgraded()).toBe(false);
                expect(context.viceAdmiralRampart).toBeInZone('groundArena');
                expect(context.p1Base).toHaveExactUpgradeNames(['sinister-war-memorial']);
                expect(context.player1).toBeActivePlayer();
            });

            it('should not trigger when an upgrade on the enemy base is defeated', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['confiscate'],
                        groundArena: ['vice-admiral-rampart#a-new-era-of-safety']
                    },
                    player2: {
                        base: { card: 'echo-base', upgrades: ['sinister-war-memorial'] }
                    }
                });

                const { context } = contextRef;

                // P1 defeats the upgrade on the enemy base
                context.player1.clickCard(context.confiscate);
                context.player1.clickCard(context.sinisterWarMemorial);

                // Rampart's ability does not trigger since the defeated upgrade is on the enemy base, not Rampart's controller's base
                expect(context.sinisterWarMemorial).toBeInZone('discard');
                expect(context.p2Base).toHaveExactUpgradeNames([]);
                expect(context.viceAdmiralRampart).toBeInZone('groundArena');
                expect(context.player2).toBeActivePlayer();
            });

            it('should still resolve a base upgrade\'s "if you do" effect when Rampart replaces its self-defeat', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['vice-admiral-rampart#a-new-era-of-safety'],
                        base: { card: 'kestro-city', upgrades: ['trap-field'] }
                    },
                    player2: {
                        hand: ['wampa'],
                        hasInitiative: true
                    }
                });

                const { context } = contextRef;

                // P2 plays a ground unit, triggering Trap Field's "defeat this upgrade to deal 3 damage" ability
                context.player2.clickCard(context.wampa);
                expect(context.player1).toHavePassAbilityPrompt('Defeat this upgrade to deal 3 damage to Wampa');
                context.player1.clickPrompt('Trigger');

                // Trap Field would be defeated, so Rampart offers to be defeated in its place
                expect(context.player1).toHavePassAbilityPrompt(replacementPromptTitle);
                context.player1.clickPrompt('Trigger');

                // Rampart is defeated instead, Trap Field survives, and its "if you do" damage still resolves
                expect(context.viceAdmiralRampart).toBeInZone('discard');
                expect(context.p1Base).toHaveExactUpgradeNames(['trap-field']);
                expect(context.wampa.damage).toBe(3);
            });

            it('should only be able to save one base upgrade since Rampart is defeated the first time it is used', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['vice-admiral-rampart#a-new-era-of-safety'],
                        base: { card: 'kestro-city', upgrades: ['sinister-war-memorial', 'dark-sanctum'] }
                    },
                    player2: {
                        hand: ['confiscate', 'confiscate'],
                        hasInitiative: true
                    }
                });

                const { context } = contextRef;
                const confiscates = context.player2.findCardsByName('confiscate');

                // First Confiscate targets Sinister War Memorial; Rampart saves it
                context.player2.clickCard(confiscates[0]);
                expect(context.player2).toBeAbleToSelectExactly([context.sinisterWarMemorial, context.darkSanctum]);
                context.player2.clickCard(context.sinisterWarMemorial);

                // P1 accepts Rampart's replacement effect
                expect(context.player1).toHavePassAbilityPrompt(replacementPromptTitle);
                context.player1.clickPrompt('Trigger');

                // Rampart is defeated instead, base upgrade survives
                expect(context.viceAdmiralRampart).toBeInZone('discard');
                expect(context.p1Base).toHaveExactUpgradeNames(['sinister-war-memorial', 'dark-sanctum']);

                context.player1.passAction();

                // Second Confiscate: both base upgrades are still attached (Rampart never defeats the saved upgrade)
                context.player2.clickCard(confiscates[1]);
                expect(context.player2).toBeAbleToSelectExactly([context.sinisterWarMemorial, context.darkSanctum]);
                context.player2.clickCard(context.darkSanctum);

                // Dark Sanctum is defeated normally since Rampart already used its ability
                expect(context.darkSanctum).toBeInZone('discard');
                expect(context.p1Base).toHaveExactUpgradeNames(['sinister-war-memorial']);
            });
        });
    });
});
