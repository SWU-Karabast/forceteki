describe('The Marauder, A New Home', function() {
    integration(function(contextRef) {
        describe('The Marauder\'s cost adjustment ability', function() {
            it('can be played without choosing any units', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'hera-syndulla#spectre-two',
                        hand: ['the-marauder#a-new-home'],
                        groundArena: ['battlefield-marine', 'wampa'],
                        resources: 7
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.theMarauder);
                expect(context.player1).toHavePrompt('Choose any number of friendly units to deal 1 damage to');
                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.wampa]);
                expect(context.player1).toHaveExactPromptButtons(['Choose nothing', 'Cancel']);

                context.player1.clickPrompt('Choose nothing');

                expect(context.theMarauder).toBeInZone('spaceArena');
                expect(context.player1.exhaustedResourceCount).toBe(7);
                expect(context.battlefieldMarine.damage).toBe(0);
                expect(context.wampa.damage).toBe(0);
                expect(context.player2).toBeActivePlayer();
            });

            it('deals 1 damage to each chosen unit and costs 1 resource less for each of them', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'hera-syndulla#spectre-two',
                        hand: ['the-marauder#a-new-home'],
                        groundArena: ['battlefield-marine', 'wampa'],
                        resources: 7
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.theMarauder);
                context.player1.clickCard(context.battlefieldMarine);
                context.player1.clickCard(context.wampa);
                context.player1.clickPrompt('Done');

                expect(context.theMarauder).toBeInZone('spaceArena');
                expect(context.player1.exhaustedResourceCount).toBe(5);
                expect(context.battlefieldMarine.damage).toBe(1);
                expect(context.wampa.damage).toBe(1);
                expect(context.getChatLogs(3)).toContain('player1 deals 1 damage to Battlefield Marine and Wampa to pay 2 resources less for The Marauder');
                expect(context.player2).toBeActivePlayer();
            });

            it('requires choosing enough units to pay the remaining cost, but allows choosing more', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'hera-syndulla#spectre-two',
                        hand: ['the-marauder#a-new-home'],
                        groundArena: ['battlefield-marine', 'wampa', 'atst'],
                        resources: 5
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.theMarauder);
                expect(context.player1).toHavePrompt('Choose at least 2 friendly units to deal 1 damage to');
                expect(context.player1).toHaveExactPromptButtons(['Done', 'Cancel']);
                expect(context.player1).not.toHaveEnabledPromptButton('Done');

                context.player1.clickCard(context.battlefieldMarine);
                expect(context.player1).not.toHaveEnabledPromptButton('Done');
                context.player1.clickCard(context.wampa);
                expect(context.player1).toHaveEnabledPromptButton('Done');

                // a third unit can still be chosen even though it isn't needed to pay
                context.player1.clickCard(context.atst);
                context.player1.clickPrompt('Done');

                expect(context.theMarauder).toBeInZone('spaceArena');
                expect(context.player1.exhaustedResourceCount).toBe(4);
                expect(context.battlefieldMarine.damage).toBe(1);
                expect(context.wampa.damage).toBe(1);
                expect(context.atst.damage).toBe(1);
            });

            it('cannot be played if choosing every friendly unit would not reduce the cost enough', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'hera-syndulla#spectre-two',
                        hand: ['the-marauder#a-new-home'],
                        groundArena: ['battlefield-marine'],
                        resources: 5
                    }
                });

                const { context } = contextRef;

                expect(context.player1).not.toBeAbleToSelect(context.theMarauder);
            });

            it('still costs less for a chosen unit if the damage to it is prevented', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'hera-syndulla#spectre-two',
                        hand: ['the-marauder#a-new-home'],
                        groundArena: [{ card: 'battlefield-marine', upgrades: ['shield'] }],
                        resources: 6
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.theMarauder);
                context.player1.clickCard(context.battlefieldMarine);
                context.player1.clickPrompt('Done');

                expect(context.theMarauder).toBeInZone('spaceArena');
                expect(context.player1.exhaustedResourceCount).toBe(6);
                expect(context.battlefieldMarine.damage).toBe(0);
                expect(context.battlefieldMarine).toHaveExactUpgradeNames([]);
            });

            it('can defeat chosen units with the damage', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'hera-syndulla#spectre-two',
                        hand: ['the-marauder#a-new-home'],
                        groundArena: [{ card: 'battlefield-marine', damage: 2 }],
                        resources: 6
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.theMarauder);
                context.player1.clickCard(context.battlefieldMarine);
                context.player1.clickPrompt('Done');

                expect(context.theMarauder).toBeInZone('spaceArena');
                expect(context.battlefieldMarine).toBeInZone('discard');
                expect(context.player1.exhaustedResourceCount).toBe(6);
            });
        });

        describe('The Marauder\'s cost adjustment ability, with other cost adjustments in play', function() {
            it('can choose The Starhawk if it survives the damage, keeping its discount', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'hera-syndulla#spectre-two',
                        hand: ['the-marauder#a-new-home'],
                        spaceArena: ['the-starhawk#prototype-battleship'],
                        resources: 3
                    }
                });

                const { context } = contextRef;

                // 7 - 1 = 6, halved by The Starhawk to 3
                context.player1.clickCard(context.theMarauder);
                expect(context.player1).toHavePrompt('Choose 1 friendly unit to deal 1 damage to');
                expect(context.player1).toBeAbleToSelectExactly([context.theStarhawk]);
                context.player1.clickCard(context.theStarhawk);
                context.player1.clickPrompt('Done');

                expect(context.theMarauder).toBeInZone('spaceArena');
                expect(context.theStarhawk.damage).toBe(1);
                expect(context.player1.exhaustedResourceCount).toBe(3);
            });

            it('cannot choose The Starhawk if the damage would defeat it and its discount is needed to pay', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'hera-syndulla#spectre-two',
                        hand: ['the-marauder#a-new-home'],
                        groundArena: ['battlefield-marine'],
                        spaceArena: [{ card: 'the-starhawk#prototype-battleship', damage: 8 }],
                        resources: 3
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.theMarauder);
                expect(context.player1).toHavePrompt('Choose at least 1 friendly unit to deal 1 damage to');
                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine]);
                context.player1.clickCard(context.battlefieldMarine);
                context.player1.clickPrompt('Done');

                expect(context.theMarauder).toBeInZone('spaceArena');
                expect(context.theStarhawk.damage).toBe(8);
                expect(context.battlefieldMarine.damage).toBe(1);
                expect(context.player1.exhaustedResourceCount).toBe(3);
            });

            it('can choose a damaged Starhawk if a Shield would prevent the damage', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'hera-syndulla#spectre-two',
                        hand: ['the-marauder#a-new-home'],
                        groundArena: ['battlefield-marine'],
                        spaceArena: [{ card: 'the-starhawk#prototype-battleship', damage: 8, upgrades: ['shield'] }],
                        resources: 3
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.theMarauder);
                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.theStarhawk]);
                context.player1.clickCard(context.theStarhawk);
                context.player1.clickPrompt('Done');

                expect(context.theMarauder).toBeInZone('spaceArena');
                expect(context.theStarhawk).toBeInZone('spaceArena');
                expect(context.theStarhawk).toHaveExactUpgradeNames([]);
                expect(context.player1.exhaustedResourceCount).toBe(3);
            });

            it('cannot choose The Starhawk if Deadly Vulnerability would make the damage defeat it', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'hera-syndulla#spectre-two',
                        hand: ['the-marauder#a-new-home'],
                        groundArena: ['battlefield-marine'],
                        spaceArena: [{ card: 'the-starhawk#prototype-battleship', damage: 7, upgrades: ['deadly-vulnerability'] }],
                        resources: 3
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.theMarauder);
                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine]);
                context.player1.clickCard(context.battlefieldMarine);
                context.player1.clickPrompt('Done');

                expect(context.theMarauder).toBeInZone('spaceArena');
                expect(context.theStarhawk.damage).toBe(7);
                expect(context.player1.exhaustedResourceCount).toBe(3);
            });

            it('cannot choose Vuutun Palaa if the damage would defeat it and exhausting Droids is needed to pay', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'hera-syndulla#spectre-two',
                        hand: ['the-marauder#a-new-home'],
                        groundArena: ['super-battle-droid', 'r2d2#artooooooooo'],
                        spaceArena: [{ card: 'vuutun-palaa#droid-control-ship', damage: 6 }],
                        resources: 3
                    }
                });

                const { context } = contextRef;

                // 7 - 2 for choosing both Droids - 2 for exhausting them = 3. Defeating Vuutun Palaa would lose 2 to gain 1.
                context.player1.clickCard(context.theMarauder);
                expect(context.player1).toHavePrompt('Choose at least 2 friendly units to deal 1 damage to');
                expect(context.player1).toBeAbleToSelectExactly([context.superBattleDroid, context.r2d2]);
                context.player1.clickCard(context.superBattleDroid);
                context.player1.clickCard(context.r2d2);
                context.player1.clickPrompt('Done');

                expect(context.player1).toBeAbleToSelectExactly([context.superBattleDroid, context.r2d2]);
                context.player1.clickCard(context.superBattleDroid);
                context.player1.clickCard(context.r2d2);
                context.player1.clickPrompt('Done');

                expect(context.theMarauder).toBeInZone('spaceArena');
                expect(context.vuutunPalaa.damage).toBe(6);
                expect(context.superBattleDroid.damage).toBe(1);
                expect(context.superBattleDroid.exhausted).toBeTrue();
                expect(context.r2d2.exhausted).toBeTrue();
                expect(context.player1.exhaustedResourceCount).toBe(3);
            });

            it('removes a chosen Droid from Vuutun Palaa\'s options if the damage defeats it', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'hera-syndulla#spectre-two',
                        hand: ['the-marauder#a-new-home'],
                        groundArena: [{ card: 'super-battle-droid', damage: 2 }, 'battlefield-marine'],
                        spaceArena: ['vuutun-palaa#droid-control-ship'],
                        resources: 5
                    }
                });

                const { context } = contextRef;

                // choosing Super Battle Droid gains 1 but loses 1 from not being able to exhaust it, so it is still an option
                context.player1.clickCard(context.theMarauder);
                expect(context.player1).toBeAbleToSelectExactly([context.superBattleDroid, context.battlefieldMarine, context.vuutunPalaa]);
                context.player1.clickCard(context.superBattleDroid);
                context.player1.clickCard(context.battlefieldMarine);
                context.player1.clickPrompt('Done');

                expect(context.theMarauder).toBeInZone('spaceArena');
                expect(context.superBattleDroid).toBeInZone('discard');
                expect(context.player1.exhaustedResourceCount).toBe(5);
            });
        });

        describe('The Marauder\'s cost adjustment ability, with Ty Yorrick in play', function() {
            it('deals 1 additional damage to each chosen unit if Ty Yorrick\'s ability is used', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'hera-syndulla#spectre-two',
                        hand: ['the-marauder#a-new-home'],
                        groundArena: ['ty-yorrick#monster-hunter', 'battlefield-marine'],
                        resources: 7
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.theMarauder);
                expect(context.player1).toHavePassAbilityPrompt('Increase damage by 1');
                context.player1.clickPrompt('Trigger');

                context.player1.clickCard(context.battlefieldMarine);
                context.player1.clickPrompt('Done');

                expect(context.theMarauder).toBeInZone('spaceArena');
                expect(context.battlefieldMarine.damage).toBe(2);
                expect(context.player1.exhaustedResourceCount).toBe(6);
                expect(context.getChatLogs(3)).toContain('player1 deals 2 damage to Battlefield Marine to pay 1 resource less for The Marauder');
            });

            it('accounts for Ty Yorrick\'s extra damage when determining whether a unit would be defeated', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'hera-syndulla#spectre-two',
                        hand: ['the-marauder#a-new-home'],
                        groundArena: ['ty-yorrick#monster-hunter'],
                        spaceArena: [{ card: 'the-starhawk#prototype-battleship', damage: 7 }],
                        resources: 3
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.theMarauder);
                context.player1.clickPrompt('Trigger');

                // with 2 damage The Starhawk would be defeated, so only Ty Yorrick can be chosen
                expect(context.player1).toBeAbleToSelectExactly([context.tyYorrick]);
                context.player1.clickCard(context.tyYorrick);
                context.player1.clickPrompt('Done');

                expect(context.theMarauder).toBeInZone('spaceArena');
                expect(context.tyYorrick.damage).toBe(2);
                expect(context.theStarhawk.damage).toBe(7);
                expect(context.player1.exhaustedResourceCount).toBe(3);
            });

            it('can choose a unit that would only be defeated with Ty Yorrick\'s extra damage if the ability is not used', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'hera-syndulla#spectre-two',
                        hand: ['the-marauder#a-new-home'],
                        groundArena: ['ty-yorrick#monster-hunter'],
                        spaceArena: [{ card: 'the-starhawk#prototype-battleship', damage: 7 }],
                        resources: 3
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.theMarauder);
                context.player1.clickPrompt('Pass');

                expect(context.player1).toBeAbleToSelectExactly([context.tyYorrick, context.theStarhawk]);
                context.player1.clickCard(context.theStarhawk);
                context.player1.clickPrompt('Done');

                expect(context.theMarauder).toBeInZone('spaceArena');
                expect(context.theStarhawk.damage).toBe(8);
                expect(context.player1.exhaustedResourceCount).toBe(3);
            });
        });
    });
});
