describe('At Attin Safety Droid', function () {
    integration(function (contextRef) {
        describe('its damage cap ability', function () {
            it('caps combat damage above 4 to exactly 4 on the controller\'s base', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['at-attin-safety-droid'],
                    },
                    player2: {
                        groundArena: ['atst'],  // 6 power
                        hasInitiative: true
                    }
                });

                const { context } = contextRef;

                // AT-ST (6 power) attacks p1Base — cap reduces 6 to 4
                context.player2.clickCard(context.atst);
                context.player2.clickCard(context.p1Base);

                expect(context.p1Base.damage).toBe(4);
                expect(context.getChatLogs(5)).toContain('player1 uses At Attin Safety Droid to prevent all but 4 damage to their base');
            });

            it('does not modify damage of exactly 4', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['at-attin-safety-droid'],
                    },
                    player2: {
                        groundArena: ['wampa'],  // 4 power
                        hasInitiative: true
                    }
                });

                const { context } = contextRef;

                // Wampa (4 power) attacks p1Base — exactly at cap, no cap should fire
                context.player2.clickCard(context.wampa);
                context.player2.clickCard(context.p1Base);

                expect(context.p1Base.damage).toBe(4);
                expect(context.getChatLogs(5)).not.toContain('player1 uses At Attin Safety Droid');
            });

            it('does not modify damage below 4', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['at-attin-safety-droid'],
                    },
                    player2: {
                        groundArena: ['battlefield-marine'],  // 3 power
                        hasInitiative: true
                    }
                });

                const { context } = contextRef;

                // Battlefield Marine (3 power) attacks p1Base — below cap, no prevention
                context.player2.clickCard(context.battlefieldMarine);
                context.player2.clickCard(context.p1Base);

                expect(context.p1Base.damage).toBe(3);
                expect(context.getChatLogs(5)).not.toContain('player1 uses At Attin Safety Droid');
            });

            it('does not cap damage dealt to the opponent\'s base', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['at-attin-safety-droid', 'atst'],  // AT-ST: 6 power
                    },
                    player2: {}
                });

                const { context } = contextRef;

                // p1's AT-ST (6 power) attacks p2Base — At Attin only protects p1's base
                context.player1.clickCard(context.atst);
                context.player1.clickCard(context.p2Base);

                expect(context.p2Base.damage).toBe(6);
                expect(context.getChatLogs(5)).not.toContain('player1 uses At Attin Safety Droid');
            });

            it('does not cap damage dealt to units', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['at-attin-safety-droid', 'atst'],  // AT-ST: 6 power / 7 HP target
                    },
                    player2: {
                        groundArena: ['wampa'],  // 4 power attacker
                        hasInitiative: true
                    }
                });

                const { context } = contextRef;

                // Wampa (4 power) attacks p1's AT-ST — ability only applies to bases
                context.player2.clickCard(context.wampa);
                context.player2.clickCard(context.atst);

                expect(context.atst.damage).toBe(4);
                expect(context.getChatLogs(5)).not.toContain('player1 uses At Attin Safety Droid');
            });

            it('does not reduce indirect damage', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['at-attin-safety-droid'],
                    },
                    player2: {
                        hand: ['torpedo-barrage'],
                        hasInitiative: true
                    }
                });

                const { context } = contextRef;

                // Torpedo Barrage deals 5 indirect (unpreventable) damage to p1
                context.player2.clickCard(context.torpedoBarrage);
                context.player2.clickPrompt('Deal indirect damage to opponent');

                // p1 distributes all indirect damage to their base
                context.player1.setDistributeIndirectDamagePromptState(new Map([
                    [context.p1Base, 5],
                ]));

                // Indirect damage is unpreventable — cap does not apply
                expect(context.p1Base.damage).toBe(5);
                expect(context.getChatLogs(5)).not.toContain('player1 uses At Attin Safety Droid to prevent all but 4 damage');
            });

            it('does not reduce unpreventable damage (such as from Gorian Shard\'s Corsair)', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['at-attin-safety-droid'],
                    },
                    player2: {
                        spaceArena: ['gorian-shards-corsair#pirate-warship'],  // 6 power, Underworld
                        hasInitiative: true
                    }
                });

                const { context } = contextRef;

                // Corsair (6 power, Underworld) attacks p1Base — combat damage is unpreventable
                context.player2.clickCard(context.gorianShardsCorsair);
                context.player2.clickCard(context.p1Base);

                // Skip the On Attack optional ability
                expect(context.player2).toHavePassAbilityButton();
                context.player2.clickPrompt('Pass');

                // Unpreventable damage bypasses the cap — base takes full 6 damage
                expect(context.p1Base.damage).toBe(6);
                expect(context.getChatLogs(5)).toContain('player1 uses At Attin Safety Droid to try to prevent damage but it cannot prevent unpreventable damage');
            });
        });
    });
});
