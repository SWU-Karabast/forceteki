describe('Moff Jerjerrod, We Shall Redouble Our Efforts', function () {
    integration(function (contextRef) {
        describe('his ability', function () {
            it('should double TIE Fighter token creation', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['executor#might-of-the-empire'],
                        groundArena: ['moff-jerjerrod#we-shall-redouble-our-efforts'],
                    },
                });

                const { context } = contextRef;

                // Play Executor — When Played fires, creating 3 TIE Fighter tokens
                context.player1.clickCard(context.executor);

                // Jerjerrod's replacement ability triggers with the correct doubled count
                expect(context.player1).toHavePassAbilityPrompt('Defeat Moff Jerjerrod to create 6 TIE Fighter tokens instead');
                context.player1.clickPrompt('Trigger');

                // Jerjerrod is defeated and 6 TIE Fighters are created instead of 3
                expect(context.moffJerjerrod).toBeInZone('discard');
                const tieFighters = context.player1.findCardsByName('tie-fighter', 'spaceArena');
                expect(tieFighters.length).toBe(6);
                expect(tieFighters).toAllBeInZone('spaceArena');

                // Chat log accurately reflects the ability trigger and result
                expect(context.getChatLogs(3)).toEqual([
                    'player1 uses Executor to create 3 TIE Fighter tokens',
                    'player1 uses Moff Jerjerrod to defeat Moff Jerjerrod',
                    'player1 uses Moff Jerjerrod to create 6 TIE Fighter tokens instead',
                ]);
            });

            it('should double Shield token creation', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['moment-of-peace'],
                        groundArena: ['moff-jerjerrod#we-shall-redouble-our-efforts', 'wampa'],
                    },
                });

                const { context } = contextRef;

                // Play Moment of Peace on Wampa — gives 1 Shield token
                context.player1.clickCard(context.momentOfPeace);
                context.player1.clickCard(context.wampa);

                // Jerjerrod triggers — 1 shield doubled to 2
                expect(context.player1).toHavePassAbilityPrompt('Defeat Moff Jerjerrod to create 2 Shield tokens instead');
                context.player1.clickPrompt('Trigger');

                // Jerjerrod is defeated and Wampa has 2 shields instead of 1
                expect(context.moffJerjerrod).toBeInZone('discard');
                expect(context.wampa).toHaveExactUpgradeNames(['shield', 'shield']);
            });

            it('should double Experience token creation', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['uwing-lander'],
                        groundArena: ['moff-jerjerrod#we-shall-redouble-our-efforts'],
                    },
                });

                const { context } = contextRef;

                // Play U-Wing Lander — When Played gives 3 Experience tokens to itself
                context.player1.clickCard(context.uwingLander);

                // Jerjerrod triggers — 3 experience tokens doubled to 6
                expect(context.player1).toHavePassAbilityPrompt('Defeat Moff Jerjerrod to create 6 Experience tokens instead');
                context.player1.clickPrompt('Trigger');

                // Jerjerrod is defeated and U-Wing Lander has 6 experience tokens instead of 3
                expect(context.moffJerjerrod).toBeInZone('discard');
                expect(context.uwingLander).toHaveExactUpgradeNames([
                    'experience', 'experience', 'experience',
                    'experience', 'experience', 'experience'
                ]);
            });

            it('should double Credit token creation', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['windfall'],
                        groundArena: ['moff-jerjerrod#we-shall-redouble-our-efforts'],
                    },
                });

                const { context } = contextRef;

                // Play Windfall — creates 3 Credit tokens
                context.player1.clickCard(context.windfall);

                // Jerjerrod triggers — 3 credits doubled to 6
                expect(context.player1).toHavePassAbilityPrompt('Defeat Moff Jerjerrod to create 6 Credit tokens instead');
                context.player1.clickPrompt('Trigger');

                // Jerjerrod is defeated and player has 6 credits instead of 3
                expect(context.moffJerjerrod).toBeInZone('discard');
                expect(context.player1.credits).toBe(6);
            });

            it('should not trigger when Force tokens are created', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['youngling-padawan'],
                        groundArena: ['moff-jerjerrod#we-shall-redouble-our-efforts'],
                    },
                });

                const { context } = contextRef;

                // Play Youngling Padawan — grants The Force to the player
                context.player1.clickCard(context.younglingPadawan);

                // Jerjerrod's ability is short-circuited for Force tokens — no prompt appears
                expect(context.player2).toBeActivePlayer();
                expect(context.moffJerjerrod).toBeInZone('groundArena');

                // Player still receives The Force token normally
                expect(context.player1.hasTheForce).toBe(true);
                const forceToken = context.player1.findCardByName('the-force');
                expect(forceToken).toBeInZone('base', context.player1);
            });

            it('should not create doubled tokens when the ability is declined', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['executor#might-of-the-empire'],
                        groundArena: ['moff-jerjerrod#we-shall-redouble-our-efforts'],
                    },
                });

                const { context } = contextRef;

                // Play Executor — When Played fires, creating 3 TIE Fighter tokens
                context.player1.clickCard(context.executor);

                // Jerjerrod's replacement ability triggers
                expect(context.player1).toHavePassAbilityPrompt('Defeat Moff Jerjerrod to create 6 TIE Fighter tokens instead');

                // Decline the ability
                context.player1.clickPrompt('Pass');

                // Jerjerrod survives and only 3 TIE Fighters are created (no doubling)
                expect(context.moffJerjerrod).toBeInZone('groundArena');
                expect(context.player1.findCardsByName('tie-fighter', 'spaceArena').length).toBe(3);
            });

            it('should not trigger when an opponent creates tokens', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['moff-jerjerrod#we-shall-redouble-our-efforts'],
                    },
                    player2: {
                        hand: ['executor#might-of-the-empire'],
                        hasInitiative: true,
                    }
                });

                const { context } = contextRef;

                // Player 2 plays Executor — When Played creates 3 TIE Fighters for player2
                context.player2.clickCard(context.executor);

                // Jerjerrod only reacts to tokens created by his own controller — no prompt for player1
                expect(context.player1).toBeActivePlayer();
                expect(context.moffJerjerrod).toBeInZone('groundArena');
                expect(context.player2.findCardsByName('tie-fighter', 'spaceArena').length).toBe(3);
                expect(context.player1.findCardsByName('tie-fighter', 'spaceArena').length).toBe(0);
            });

            it('should double Shield tokens given to an enemy unit', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['moff-jerjerrod#we-shall-redouble-our-efforts', 'val#its-been-a-ride-babe'],
                    },
                    player2: {
                        groundArena: ['wampa'],
                        hasInitiative: true,
                    }
                });

                const { context } = contextRef;

                // Player2 attacks Val with Wampa, defeating her
                context.player2.clickCard(context.wampa);
                context.player2.clickCard(context.valItsBeenARideBabe);

                // Val's When Defeated fires — player1 selects an enemy unit to give the Shield to
                expect(context.player1).toHavePrompt('Give a Shield token to an enemy unit');
                context.player1.clickCard(context.wampa);

                // Jerjerrod's replacement triggers even though the target is an enemy unit —
                // the relevant check is who is creating the tokens, not who receives them
                expect(context.player1).toHavePassAbilityPrompt('Defeat Moff Jerjerrod to create 2 Shield tokens instead');
                context.player1.clickPrompt('Trigger');

                // Jerjerrod is defeated and Wampa receives 2 shields instead of 1
                expect(context.moffJerjerrod).toBeInZone('discard');
                expect(context.wampa).toHaveExactUpgradeNames(['shield', 'shield']);
            });

            it('should double the entire token creation event when tokens are given to multiple units simultaneously (single defeat doubles all)', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['crucible#centuries-of-wisdom'],
                        groundArena: [
                            'moff-jerjerrod#we-shall-redouble-our-efforts',
                            'wampa',
                            'battlefield-marine'
                        ],
                        spaceArena: ['xwing']
                    },
                });

                const { context } = contextRef;

                // Play Crucible, giving an experience token to each other friendly unit
                context.player1.clickCard(context.crucible);

                // A single replacement prompt should double the whole event
                expect(context.player1).toHavePassAbilityPrompt('Defeat Moff Jerjerrod to create 2 Experience tokens instead');
                context.player1.clickPrompt('Trigger');

                // Jerjerrod is defeated once and every other friendly unit receives 2 experience tokens instead of 1
                expect(context.moffJerjerrod).toBeInZone('discard');
                expect(context.wampa).toHaveExactUpgradeNames(['experience', 'experience']);
                expect(context.battlefieldMarine).toHaveExactUpgradeNames(['experience', 'experience']);
                expect(context.xwing).toHaveExactUpgradeNames(['experience', 'experience']);
            });

            it('should not trigger when a friendly effect causes an opponent to create tokens', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['jesse#hardfighting-patriot'],
                        groundArena: ['moff-jerjerrod#we-shall-redouble-our-efforts'],
                    },
                });

                const { context } = contextRef;

                // Play Jesse — his When Played causes the opponent (player2) to create 2 Battle Droids
                context.player1.clickCard(context.jesse);

                // Jerjerrod only reacts when his controller is the one creating the tokens;
                // "an opponent creates" means player2 is the creator, so no prompt for player1
                expect(context.player2).toBeActivePlayer();
                expect(context.moffJerjerrod).toBeInZone('groundArena');
                expect(context.player2.findCardsByName('battle-droid', 'groundArena').length).toBe(2);
            });

            it('should handle simultaneous creation of multiple token types', async function () {
                // TODO: This is incorrect. Per FFG clarification, a single defeat should double the entire creation
                // event, so all token types should be doubled here. The multi-target case (e.g. Crucible) is fixed
                // by batching a single GiveTokenUpgradeSystem call into one OnTokensCreated event, but Three Lessons
                // creates the Experience and Shield via two separate systems (two events), so they still trigger Jerjerrod
                // independently
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['three-lessons', 'wampa'],
                        groundArena: ['moff-jerjerrod#we-shall-redouble-our-efforts'],
                    },
                });

                const { context } = contextRef;

                // Play Three Lessons — plays a unit from hand and gives it 1 Experience + 1 Shield
                context.player1.clickCard(context.threeLessons);
                context.player1.clickCard(context.wampa);

                // Both token types trigger Jerjerrod simultaneously and are grouped — resolve them via the modal
                context.player1.clickPrompt('Resolve all (2)');

                // Accept the Experience replacement — Jerjerrod is defeated and 2 XP tokens are created
                expect(context.player1).toHavePassAbilityPrompt('Defeat Moff Jerjerrod to create 2 Experience tokens instead: Wampa');
                context.player1.clickPrompt('Trigger');

                // Result: 2 Experience tokens (doubled) + 1 Shield (not doubled, Jerjerrod already gone)
                expect(context.moffJerjerrod).toBeInZone('discard');
                expect(context.wampa).toHaveExactUpgradeNames(['experience', 'experience', 'shield']);
            });

            it('should not trigger a second time after being defeated by its own ability', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['battle-droid-escort'],
                        groundArena: ['moff-jerjerrod#we-shall-redouble-our-efforts'],
                    },
                    player2: {
                        groundArena: ['wampa'],
                    }
                });

                const { context } = contextRef;

                // Player1 plays Battle Droid Escort — When Played creates 1 Battle Droid
                context.player1.clickCard(context.battleDroidEscort);

                // Accept Jerjerrod's ability — he is defeated and 2 Battle Droids are created
                expect(context.player1).toHavePassAbilityPrompt('Defeat Moff Jerjerrod to create 2 Battle Droid tokens instead');
                context.player1.clickPrompt('Trigger');

                expect(context.moffJerjerrod).toBeInZone('discard');
                expect(context.player1.findCardsByName('battle-droid', 'groundArena').length).toBe(2);

                // Player2 attacks and defeats Battle Droid Escort
                context.player2.clickCard(context.wampa);
                context.player2.clickCard(context.battleDroidEscort);

                // Battle Droid Escort's When Defeated fires — creates 1 more Battle Droid
                // Jerjerrod is already defeated, so his ability does not trigger again
                expect(context.battleDroidEscort).toBeInZone('discard');
                expect(context.player1.findCardsByName('battle-droid', 'groundArena').length).toBe(3);
            });
        });
    });
});
