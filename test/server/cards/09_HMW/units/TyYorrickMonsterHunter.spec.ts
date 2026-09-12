describe('Ty Yorrick, Monster Hunter', function() {
    integration(function(contextRef) {
        it('Ty Yorrick, Monster Hunter\'s on-attack ability should deal 1 damage to a Creature unit when attacking', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['ty-yorrick#monster-hunter', 'porg'],
                },
                player2: {
                    groundArena: ['wampa', 'atst'],
                    spaceArena: ['mynock']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.tyYorrickMonsterHunter);
            context.player1.clickCard(context.p2Base);

            expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.porg, context.mynock]);
            expect(context.player1).toHavePassAbilityButton();
            context.player1.clickCard(context.wampa);

            // Constant ability triggering, pass it, will be tested in the damage modification test
            context.player1.clickPrompt('Pass');

            expect(context.player2).toBeActivePlayer();
            expect(context.wampa.damage).toBe(1);
        });

        describe('Ty Yorrick, Monster Hunter\'s damage modification', function() {
            it('should optionally increase friendly event ability damage by 1', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['ty-yorrick#monster-hunter'],
                        hand: ['daring-raid'],
                    },
                    player2: {
                        groundArena: ['wampa']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.daringRaid);
                context.player1.clickCard(context.wampa);

                expect(context.player1).toHavePassAbilityPrompt('If a friendly ability would deal damage, you may have that ability deal that much damage plus 1 instead');
                context.player1.clickPrompt('Trigger');

                expect(context.wampa.damage).toBe(3);
                expect(context.player2).toBeActivePlayer();
            });

            it('should increase friendly event ability dealing damage', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['ty-yorrick#monster-hunter'],
                        hand: ['daring-raid'],
                    },
                    player2: {
                        groundArena: ['wampa']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.daringRaid);
                context.player1.clickCard(context.tyYorrick);

                expect(context.player1).toHavePassAbilityPrompt('If a friendly ability would deal damage, you may have that ability deal that much damage plus 1 instead');
                context.player1.clickPrompt('Trigger');

                expect(context.tyYorrick.damage).toBe(3);
                expect(context.player2).toBeActivePlayer();
            });

            it('should not increase enemy event ability dealing damage', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['ty-yorrick#monster-hunter'],
                    },
                    player2: {
                        hand: ['daring-raid'],
                        groundArena: ['wampa'],
                        hasInitiative: true,
                    }
                });

                const { context } = contextRef;

                context.player2.clickCard(context.daringRaid);
                context.player2.clickCard(context.tyYorrick);

                expect(context.player1).toBeActivePlayer();
                expect(context.tyYorrick.damage).toBe(2);
            });

            it('should optionally increase friendly unit ability damage by 1', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['ty-yorrick#monster-hunter'],
                    },
                    player2: {
                        groundArena: ['wampa']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.tyYorrick);
                context.player1.clickCard(context.p2Base);
                context.player1.clickCard(context.wampa);

                expect(context.player1).toHavePassAbilityPrompt('If a friendly ability would deal damage, you may have that ability deal that much damage plus 1 instead');
                context.player1.clickPrompt('Trigger');

                expect(context.wampa.damage).toBe(2);
                expect(context.player2).toBeActivePlayer();
                expect(context.p2Base.damage).toBe(4);
            });

            it('should optionally increase friendly ability dealing indirect damage by 1', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['devastator#hunting-the-rebellion'],
                        groundArena: ['ty-yorrick#monster-hunter'],
                    },
                    player2: {
                        groundArena: ['wampa']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.devastator);
                context.player1.setDistributeIndirectDamagePromptState(new Map([
                    [context.p2Base, 3],
                    [context.wampa, 1],
                ]));

                expect(context.player1).toHavePassAbilityPrompt('If a friendly ability would deal damage, you may have that ability deal that much damage plus 1 instead');
                context.player1.clickPrompt('Trigger');

                expect(context.player2).toBeActivePlayer();
                expect(context.p2Base.damage).toBe(5);
            });

            it('should not increase friendly Overwhelm damage', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['ty-yorrick#monster-hunter', 'wampa'],
                    },
                    player2: {
                        groundArena: ['porg']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.wampa);
                context.player1.clickCard(context.porg);

                expect(context.player2).toBeActivePlayer();
                expect(context.p2Base.damage).toBe(3);
            });

            it('should optionally increase friendly ability damage by 1 (multiple time on a turn)', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['ty-yorrick#monster-hunter'],
                        hand: ['daring-raid']
                    },
                    player2: {
                        groundArena: ['mythosaur#folklore-awakened']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.daringRaid);
                context.player1.clickCard(context.mythosaur);

                expect(context.player1).toHavePassAbilityPrompt('If a friendly ability would deal damage, you may have that ability deal that much damage plus 1 instead');
                context.player1.clickPrompt('Trigger');

                expect(context.mythosaur.damage).toBe(3);

                context.player2.passAction();

                context.player1.clickCard(context.tyYorrick);
                context.player1.clickCard(context.p2Base);
                context.player1.clickCard(context.mythosaur);

                expect(context.player1).toHavePassAbilityPrompt('If a friendly ability would deal damage, you may have that ability deal that much damage plus 1 instead');
                context.player1.clickPrompt('Trigger');

                expect(context.player2).toBeActivePlayer();
                expect(context.mythosaur.damage).toBe(5);
            });

            it('may pass the damage increase', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['ty-yorrick#monster-hunter'],
                        hand: ['daring-raid'],
                    },
                    player2: {
                        groundArena: ['wampa']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.daringRaid);
                context.player1.clickCard(context.wampa);

                expect(context.player1).toHavePassAbilityPrompt('If a friendly ability would deal damage, you may have that ability deal that much damage plus 1 instead');
                context.player1.clickPrompt('Pass');

                expect(context.wampa.damage).toBe(2);
                expect(context.player2).toBeActivePlayer();
            });

            it('may pass the damage increase', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['ig2000#assassins-aggressor'],
                        groundArena: ['ty-yorrick#monster-hunter', 'yoda#old-master']
                    },
                    player2: {
                        groundArena: ['wampa', 'porg'],
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.ig2000);
                context.player1.clickCard(context.wampa);
                context.player1.clickCard(context.porg);
                context.player1.clickCard(context.yoda);
                context.player1.clickDone();

                expect(context.player1).toHavePrompt('Resolve "If a friendly ability would deal damage, you may have that ability deal that much damage plus 1 instead"');
                context.player1.clickPrompt('Resolve all (3)');
                context.player1.clickPrompt('Trigger');
                context.player1.clickPrompt('Trigger');
                context.player1.clickPrompt('Trigger');

                expect(context.wampa.damage).toBe(2);
                expect(context.yoda.damage).toBe(2);
                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});