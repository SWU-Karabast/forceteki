describe('Maul, Collective Ambition', function() {
    integration(function(contextRef) {
        const abilityPrompt = 'Choose a unit. If it has more Keywords than Experience tokens, give it an Experience token and deal 1 damage to it';

        describe('Maul\'s undeployed leader ability', function() {
            it('should give an Experience token and deal 1 damage to an enemy unit with more keywords than experience tokens', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'maul#collective-ambition',
                        resources: 6,
                        groundArena: ['spy'],
                        spaceArena: ['xwing'],
                    },
                    player2: {
                        leader: { card: 'darth-vader#dark-lord-of-the-sith', deployed: true },
                        groundArena: ['hidden-hunters'],
                        spaceArena: ['tie-fighter'],
                    }
                });

                const { context } = contextRef;

                // Use Maul's action ability
                context.player1.clickCard(context.maul);

                // All units are valid targets, and we must choose one
                expect(context.player1).toHavePrompt(abilityPrompt);
                expect(context.player1).not.toHaveEnabledPromptButton('Choose nothing');
                expect(context.player1).toBeAbleToSelectExactly([
                    context.spy,
                    context.xwing,
                    context.hiddenHunters,
                    context.tieFighter,
                    context.darthVader
                ]);
                context.player1.clickCard(context.hiddenHunters);

                // Hidden Hunters gains an Experience token and takes 1 damage
                expect(context.maul.exhausted).toBeTrue();
                expect(context.hiddenHunters.damage).toBe(1);
                expect(context.hiddenHunters).toHaveExactUpgradeNames(['experience']);
                expect(context.player2).toBeActivePlayer();
            });

            it('should give an Experience token and deal 1 damage to a friendly unit with more keywords than experience tokens', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'maul#collective-ambition',
                        resources: 6,
                        groundArena: ['hidden-hunters'],
                    }
                });

                const { context } = contextRef;

                // Use Maul's action ability on friendly Hidden Hunters
                context.player1.clickCard(context.maul);

                // Hidden Hunters has 1 keyword (Hidden) and 0 experience tokens
                expect(context.player1).toHavePrompt(abilityPrompt);
                expect(context.player1).toBeAbleToSelectExactly([context.hiddenHunters]);
                context.player1.clickCard(context.hiddenHunters);

                // Hidden Hunters gains an Experience token and takes 1 damage
                expect(context.maul.exhausted).toBeTrue();
                expect(context.hiddenHunters.damage).toBe(1);
                expect(context.hiddenHunters).toHaveExactUpgradeNames(['experience']);
                expect(context.player2).toBeActivePlayer();
            });

            it('should give an Experience token and deal 1 damage to a unit with multiple keywords and some experience tokens', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'maul#collective-ambition',
                        resources: 6,
                        spaceArena: [{ card: 'mc30-assault-frigate', upgrades: ['experience'] }],
                    }
                });

                const { context } = contextRef;

                // Use Maul's action ability
                context.player1.clickCard(context.maul);

                // MC30 has 2 keywords (Overwhelm, Raid) and 1 experience token
                expect(context.player1).toHavePrompt(abilityPrompt);
                expect(context.player1).toBeAbleToSelectExactly([context.mc30AssaultFrigate]);
                context.player1.clickCard(context.mc30AssaultFrigate);

                // MC30 gains an Experience token and takes 1 damage
                expect(context.maul.exhausted).toBeTrue();
                expect(context.mc30AssaultFrigate.damage).toBe(1);
                expect(context.mc30AssaultFrigate).toHaveExactUpgradeNames(['experience', 'experience']);
                expect(context.player2).toBeActivePlayer();
            });

            it('should not give Experience or deal damage when the unit has no keywords', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'maul#collective-ambition',
                        resources: 6,
                        groundArena: ['rampaging-wampa'],
                    }
                });

                const { context } = contextRef;

                // Use Maul's action ability
                context.player1.clickCard(context.maul);

                // Rampaging Wampa has 0 keywords and 0 experience tokens
                expect(context.player1).toHavePrompt(abilityPrompt);
                expect(context.player1).toBeAbleToSelectExactly([context.rampagingWampa]);
                context.player1.clickCard(context.rampagingWampa);

                // Maul exhausts but Rampaging Wampa is unaffected
                expect(context.maul.exhausted).toBeTrue();
                expect(context.rampagingWampa.damage).toBe(0);
                expect(context.rampagingWampa.upgrades.length).toBe(0);
                expect(context.player2).toBeActivePlayer();
            });

            it('should not give Experience or deal damage when the unit has equal keywords and experience tokens', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'maul#collective-ambition',
                        resources: 6,
                        groundArena: [{ card: 'hidden-hunters', upgrades: ['experience'] }],
                    }
                });

                const { context } = contextRef;

                // Use Maul's action ability
                context.player1.clickCard(context.maul);

                // Hidden Hunters has 1 keyword (Hidden) and 1 experience token
                expect(context.player1).toHavePrompt(abilityPrompt);
                expect(context.player1).toBeAbleToSelectExactly([context.hiddenHunters]);
                context.player1.clickCard(context.hiddenHunters);

                // Maul exhausts but Hidden Hunters is unaffected
                expect(context.maul.exhausted).toBeTrue();
                expect(context.hiddenHunters.damage).toBe(0);
                expect(context.hiddenHunters).toHaveExactUpgradeNames(['experience']);
                expect(context.player2).toBeActivePlayer();
            });

            it('should not give Experience or deal damage when the unit has fewer keywords than experience tokens', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'maul#collective-ambition',
                        resources: 6,
                        groundArena: [{ card: 'hidden-hunters', upgrades: ['experience', 'experience'] }],
                    }
                });

                const { context } = contextRef;

                // Use Maul's action ability
                context.player1.clickCard(context.maul);

                // Hidden Hunters has 1 keyword (Hidden) and 2 experience tokens
                expect(context.player1).toHavePrompt(abilityPrompt);
                expect(context.player1).toBeAbleToSelectExactly([context.hiddenHunters]);
                context.player1.clickCard(context.hiddenHunters);

                // Maul exhausts but Hidden Hunters is unaffected
                expect(context.maul.exhausted).toBeTrue();
                expect(context.hiddenHunters.damage).toBe(0);
                expect(context.hiddenHunters).toHaveExactUpgradeNames(['experience', 'experience']);
                expect(context.player2).toBeActivePlayer();
            });

            it('should count stacking numerical keywords as a single keyword', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'maul#collective-ambition',
                        resources: 6,
                        spaceArena: [
                            { card: 'mc30-assault-frigate', upgrades: ['experience', 'experience'] },
                        ],
                        groundArena: ['hondo-ohnaka#you-better-hurry'],
                    }
                });

                const { context } = contextRef;

                // Use Maul's action ability
                context.player1.clickCard(context.maul);

                // MC30 gains Raid 1 from Hondo, stacking with printed Raid value, still 2 unique keywords
                expect(context.player1).toHavePrompt(abilityPrompt);
                expect(context.player1).toBeAbleToSelectExactly([context.mc30AssaultFrigate, context.hondoOhnaka]);
                context.player1.clickCard(context.mc30AssaultFrigate);

                // MC30 is unaffected (2 keywords, 2 experience tokens)
                expect(context.maul.exhausted).toBeTrue();
                expect(context.mc30AssaultFrigate.damage).toBe(0);
                expect(context.mc30AssaultFrigate).toHaveExactUpgradeNames(['experience', 'experience']);
                expect(context.player2).toBeActivePlayer();
            });

            it('should count keywords granted by upgrades', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'maul#collective-ambition',
                        resources: 6,
                        groundArena: [{ card: 'rampaging-wampa', upgrades: ['infiltrators-skill'] }],
                    }
                });

                const { context } = contextRef;

                // Use Maul's action ability
                context.player1.clickCard(context.maul);

                // Rampaging Wampa has 1 keyword (gained from the upgrade) and 0 experience tokens
                expect(context.player1).toHavePrompt(abilityPrompt);
                expect(context.player1).toBeAbleToSelectExactly([context.rampagingWampa]);
                context.player1.clickCard(context.rampagingWampa);

                // Rampaging Wampa gains an Experience token and takes 1 damage
                expect(context.maul.exhausted).toBeTrue();
                expect(context.rampagingWampa.damage).toBe(1);
                expect(context.rampagingWampa).toHaveExactUpgradeNames(['infiltrators-skill', 'experience']);
                expect(context.player2).toBeActivePlayer();
            });

            it('should exhaust Maul with no effect when there are no units in play', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'maul#collective-ambition',
                        resources: 6,
                    }
                });

                const { context } = contextRef;

                // No units in play - no valid targets
                context.player1.clickCard(context.maul);

                expect(context.player1).toHaveNoEffectAbilityPrompt('Give an Experience token and deal 1 damage to a unit with more Keywords than Experience tokens');
                context.player1.clickPrompt('Use it anyway');

                expect(context.maul.exhausted).toBeTrue();
                expect(context.player2).toBeActivePlayer();
            });

            // TODO: Targeting logic still makes us select a unit, even when none meet the criteria
            // it('should exhaust Maul to no effect when no units in play meet the criteria', async function() {
            //     await contextRef.setupTestAsync({
            //         phase: 'action',
            //         player1: {
            //             leader: 'maul#collective-ambition',
            //             resources: 6,
            //             groundArena: [{ card: 'hidden-hunters', upgrades: ['experience', 'experience'] }],
            //         }
            //     });

            //     const { context } = contextRef;

            //     // Use Maul's ability
            //     context.player1.clickCard(context.maul);

            //     // No units in play meet the condition, so ability is automatically skipped
            //     expect(context.player1).not.toHavePrompt(abilityPrompt);
            //     expect(context.maul.exhausted).toBeTrue();
            //     expect(context.player2).toBeActivePlayer();
            // });
        });

        describe('Maul\'s deployed leader ability', function() {
            it('should trigger on deploy and give an Experience token and deal 1 damage to a unit with more keywords than experience tokens', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'maul#collective-ambition',
                    },
                    player2: {
                        groundArena: ['hidden-hunters'],
                    }
                });

                const { context } = contextRef;

                // Deploy Maul
                context.player1.clickCard(context.maul);
                context.player1.clickPrompt('Deploy Maul');

                // Hidden Hunters has 1 keyword (Hidden) and 0 experience tokens; Maul is also selectable
                expect(context.player1).toHavePrompt(abilityPrompt);
                expect(context.player1).toBeAbleToSelectExactly([context.maul, context.hiddenHunters]);
                context.player1.clickCard(context.hiddenHunters);

                // Hidden Hunters gains an Experience token and takes 1 damage
                expect(context.hiddenHunters.damage).toBe(1);
                expect(context.hiddenHunters).toHaveExactUpgradeNames(['experience']);
                expect(context.player2).toBeActivePlayer();
            });

            it('should give an Experience token and deal 1 damage to a friendly unit with more keywords than experience tokens', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: { card: 'maul#collective-ambition', deployed: true },
                        groundArena: ['hidden-hunters'],
                    }
                });

                const { context } = contextRef;

                // Attack with Maul; ability triggers
                context.player1.clickCard(context.maul);
                context.player1.clickCard(context.p2Base);

                // Hidden Hunters has 1 keyword (Hidden) and 0 experience tokens
                expect(context.player1).toHavePrompt(abilityPrompt);
                expect(context.player1).toBeAbleToSelectExactly([context.maul, context.hiddenHunters]);
                context.player1.clickCard(context.hiddenHunters);

                // Hidden Hunters gains an Experience token and takes 1 damage
                expect(context.hiddenHunters.damage).toBe(1);
                expect(context.hiddenHunters).toHaveExactUpgradeNames(['experience']);
                expect(context.player2).toBeActivePlayer();
            });

            it('should not give Experience or deal damage when Maul himself is selected and has no keywords', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: { card: 'maul#collective-ambition', deployed: true },
                    }
                });

                const { context } = contextRef;

                // Attack with Maul; ability triggers with only Maul as a target
                context.player1.clickCard(context.maul);
                context.player1.clickCard(context.p2Base);

                // Maul has 0 keywords and 0 experience tokens
                expect(context.player1).toHavePrompt(abilityPrompt);
                expect(context.player1).toBeAbleToSelectExactly([context.maul]);
                context.player1.clickCard(context.maul);

                // Maul is unaffected
                expect(context.maul.damage).toBe(0);
                expect(context.maul.upgrades.length).toBe(0);
                expect(context.player2).toBeActivePlayer();
            });

            it('should not give Experience or deal damage when the unit has equal keywords and experience tokens', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: { card: 'maul#collective-ambition', deployed: true },
                        groundArena: [{ card: 'hidden-hunters', upgrades: ['experience'] }],
                    }
                });

                const { context } = contextRef;

                // Attack with Maul; ability triggers
                context.player1.clickCard(context.maul);
                context.player1.clickCard(context.p2Base);

                // Hidden Hunters has 1 keyword (Hidden) and 1 experience token
                expect(context.player1).toHavePrompt(abilityPrompt);
                expect(context.player1).toBeAbleToSelectExactly([context.maul, context.hiddenHunters]);
                context.player1.clickCard(context.hiddenHunters);

                // Hidden Hunters is unaffected
                expect(context.hiddenHunters.damage).toBe(0);
                expect(context.hiddenHunters).toHaveExactUpgradeNames(['experience']);
                expect(context.player2).toBeActivePlayer();
            });

            it('should not give Experience or deal damage when the unit has fewer keywords than experience tokens', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: { card: 'maul#collective-ambition', deployed: true },
                        groundArena: [{ card: 'hidden-hunters', upgrades: ['experience', 'experience'] }],
                    }
                });

                const { context } = contextRef;

                // Attack with Maul; ability triggers
                context.player1.clickCard(context.maul);
                context.player1.clickCard(context.p2Base);

                // Hidden Hunters has 1 keyword (Hidden) and 2 experience tokens
                expect(context.player1).toHavePrompt(abilityPrompt);
                expect(context.player1).toBeAbleToSelectExactly([context.maul, context.hiddenHunters]);
                context.player1.clickCard(context.hiddenHunters);

                // Hidden Hunters is unaffected
                expect(context.hiddenHunters.damage).toBe(0);
                expect(context.hiddenHunters).toHaveExactUpgradeNames(['experience', 'experience']);
                expect(context.player2).toBeActivePlayer();
            });

            it('should count stacking numerical keywords as a single keyword', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: { card: 'maul#collective-ambition', deployed: true },
                        spaceArena: [{ card: 'mc30-assault-frigate', upgrades: ['experience', 'experience'] }],
                        groundArena: ['hondo-ohnaka#you-better-hurry'],
                    }
                });

                const { context } = contextRef;

                // Attack with Maul; ability triggers
                context.player1.clickCard(context.maul);
                context.player1.clickCard(context.p2Base);

                // MC30 gains Raid 1 from Hondo, stacking with printed Raid value, still 2 unique keywords
                expect(context.player1).toHavePrompt(abilityPrompt);
                expect(context.player1).toBeAbleToSelectExactly([context.maul, context.hondoOhnaka, context.mc30AssaultFrigate]);
                context.player1.clickCard(context.mc30AssaultFrigate);

                // MC30 is unaffected (2 keywords, 2 experience tokens)
                expect(context.mc30AssaultFrigate.damage).toBe(0);
                expect(context.mc30AssaultFrigate).toHaveExactUpgradeNames(['experience', 'experience']);
                expect(context.player2).toBeActivePlayer();
            });

            it('should count keywords granted by upgrades', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: { card: 'maul#collective-ambition', deployed: true },
                        groundArena: [{ card: 'rampaging-wampa', upgrades: ['infiltrators-skill'] }],
                    }
                });

                const { context } = contextRef;

                // Attack with Maul; ability triggers
                context.player1.clickCard(context.maul);
                context.player1.clickCard(context.p2Base);

                // Rampaging Wampa has 1 keyword (gained from the upgrade) and 0 experience tokens
                expect(context.player1).toHavePrompt(abilityPrompt);
                expect(context.player1).toBeAbleToSelectExactly([context.maul, context.rampagingWampa]);
                context.player1.clickCard(context.rampagingWampa);

                // Rampaging Wampa gains an Experience token and takes 1 damage
                expect(context.rampagingWampa.damage).toBe(1);
                expect(context.rampagingWampa).toHaveExactUpgradeNames(['infiltrators-skill', 'experience']);
                expect(context.player2).toBeActivePlayer();
            });

            // Targeting logic still makes us select a unit, even when none meet the criteria
            // it('should automatically pass the ability when no units in play meet the condition', async function() {
            //     await contextRef.setupTestAsync({
            //         phase: 'action',
            //         player1: {
            //             leader: { card: 'maul#collective-ambition', deployed: true },
            //         },
            //         player2: {
            //             groundArena: [{ card: 'hidden-hunters', upgrades: ['experience', 'experience'] }],
            //         }
            //     });

            //     const { context } = contextRef;

            //     // Attack with Maul
            //     context.player1.clickCard(context.maul);
            //     context.player1.clickCard(context.p2Base);

            //     // No units in play meet the condition, so ability is automatically skipped
            //     expect(context.player1).not.toHavePrompt(abilityPrompt);
            //     expect(context.player2).toBeActivePlayer();
            // });
        });
    });
});
