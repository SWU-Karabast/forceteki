describe('Oppo Rancisis, Ancient Councilor', function() {
    integration(function(contextRef) {
        it('Oppo Rancisis should do nothing when he is the only unit', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['oppo-rancisis#ancient-councilor'],
                }
            });

            const { context } = contextRef;
            context.player1.clickCard(context.oppoRancisis);
            expect(context.player2).toBeActivePlayer();
        });

        it('Oppo Rancisis should gain Ambush when a friendly unit has Ambush', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['cloudrider'],
                    hand: ['oppo-rancisis#ancient-councilor'],
                },
                player2: {
                    groundArena: ['battlefield-marine']
                }
            });

            const { context } = contextRef;
            context.player1.clickCard(context.oppoRancisis);
            expect(context.player1).toHavePassAbilityPrompt('Ambush');
            context.player1.clickPrompt('Trigger');

            expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine]);
            context.player1.clickCard(context.battlefieldMarine);
            expect(context.battlefieldMarine).toBeInZone('discard');
            expect(context.oppoRancisis.damage).toBe(3);
            expect(context.player2).toBeActivePlayer();
        });

        it('Oppo Rancisis should gain Shielded when a friendly unit has Shielded', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['crafty-smuggler'],
                    hand: ['oppo-rancisis#ancient-councilor'],
                },
                player2: {
                    groundArena: ['battlefield-marine']
                }
            });

            const { context } = contextRef;
            context.player1.clickCard(context.oppoRancisis);
            expect(context.oppoRancisis).toHaveExactUpgradeNames(['shield']);
            expect(context.player2).toBeActivePlayer();
        });

        it('Oppo Rancisis should gain multiple keywords', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['crafty-smuggler', 'cloudrider'],
                    hand: ['oppo-rancisis#ancient-councilor'],
                },
                player2: {
                    groundArena: ['battlefield-marine']
                }
            });

            const { context } = contextRef;
            context.player1.clickCard(context.oppoRancisis);
            expect(context.player1).toHaveExactPromptButtons(['Ambush', 'Shielded']);
            context.player1.clickPrompt('Ambush');
            context.player1.clickPrompt('Trigger');

            expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine]);
            context.player1.clickCard(context.battlefieldMarine);
            expect(context.battlefieldMarine).toBeInZone('discard');
            expect(context.oppoRancisis.damage).toBe(3);

            expect(context.oppoRancisis).toHaveExactUpgradeNames(['shield']);
            expect(context.player2).toBeActivePlayer();
        });

        it('Oppo Rancisis should gain Grit when a friendly unit has Grit', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['scout-bike-pursuer', { card: 'oppo-rancisis#ancient-councilor', damage: 3 }]
                }
            });

            const { context } = contextRef;
            expect(context.oppoRancisis.getPower()).toBe(6);
        });

        it('Oppo Rancisis should gain Hidden while a friendly unit has Hidden', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['oppo-rancisis#ancient-councilor'],
                    groundArena: ['witch-of-the-mist']
                },
                player2: {
                    groundArena: ['battlefield-marine']
                }
            });

            const { context } = contextRef;
            context.player1.clickCard(context.oppoRancisis);

            // Check that P2 can't attack Oppo this phase
            context.player2.clickCard(context.battlefieldMarine);
            expect(context.player2).toBeAbleToSelectExactly([context.witchOfTheMist, context.p1Base]);
            context.player2.clickCard(context.p1Base);

            context.moveToNextActionPhase();

            // Check that P2 can now attack Oppo this phase
            context.player1.passAction();
            context.player2.clickCard(context.battlefieldMarine);
            expect(context.player2).toBeAbleToSelectExactly([context.witchOfTheMist, context.p1Base, context.oppoRancisis]);
            context.player2.clickCard(context.p1Base);
        });

        it('Oppo Rancisis should gain Sentinel when a friendly unit has Sentinel', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['oppo-rancisis#ancient-councilor', 'village-protectors']
                },
                player2: {
                    groundArena: ['battlefield-marine']
                }
            });

            const { context } = contextRef;
            context.player1.clickCard(context.oppoRancisis);

            // Check that P2 doesn't have to attack Oppo
            context.player2.clickCard(context.battlefieldMarine);
            expect(context.player2).toBeAbleToSelectExactly([context.oppoRancisis, context.p1Base]);
            context.player2.clickCard(context.p1Base);
            context.player1.clickCard(context.villageProtectors);

            context.moveToNextActionPhase();

            // Check that P2 can now only attack Sentinels
            context.player1.passAction();
            context.player2.clickCard(context.battlefieldMarine);
            expect(context.player2).toBeAbleToSelectExactly([context.villageProtectors, context.oppoRancisis]);
            context.player2.clickCard(context.villageProtectors);
        });

        it('Oppo Rancisis should gain Saboteur when a friendly unit has Saboteur', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['oppo-rancisis#ancient-councilor', 'rogue-operative'],
                },
                player2: {
                    groundArena: ['village-protectors']
                }
            });

            const { context } = contextRef;
            context.player1.clickCard(context.oppoRancisis);
            expect(context.player1).toBeAbleToSelectExactly([context.villageProtectors, context.p2Base]);
            context.player1.clickCard(context.p2Base);
        });

        it('Oppo Rancisis should gain Overwhelm when a friendly unit has Overwhelm', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['oppo-rancisis#ancient-councilor', 'wampa'],
                },
                player2: {
                    groundArena: ['jawa-scavenger']
                }
            });

            const { context } = contextRef;
            context.player1.clickCard(context.oppoRancisis);
            context.player1.clickCard(context.jawaScavenger);
            expect(context.p2Base.damage).toBe(2); // 2 Overwhelm
        });

        it('Oppo Rancisis should gain Raid 2 when a friendly unit has Raid', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['oppo-rancisis#ancient-councilor', 'rogue-operative'],
                }
            });

            const { context } = contextRef;
            context.player1.clickCard(context.oppoRancisis);
            context.player1.clickCard(context.p2Base);
            expect(context.p2Base.damage).toBe(5);
        });

        it('Oppo Rancisis should gain Restore 2 when a friendly unit has Restore', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    base: { card: 'echo-base', damage: 5 },
                    groundArena: ['oppo-rancisis#ancient-councilor', 'moisture-farmer'],
                }
            });

            const { context } = contextRef;
            context.player1.clickCard(context.oppoRancisis);
            context.player1.clickCard(context.p2Base);
            expect(context.p1Base.damage).toBe(3);
            expect(context.p2Base.damage).toBe(3);
        });

        it('Oppo Rancisis should not gain Restore 4 when 2 friendly units have Restore', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    base: { card: 'echo-base', damage: 5 },
                    groundArena: ['oppo-rancisis#ancient-councilor', 'moisture-farmer', 'yoda#old-master'],
                }
            });

            const { context } = contextRef;
            context.player1.clickCard(context.oppoRancisis);
            context.player1.clickCard(context.p2Base);
            expect(context.p1Base.damage).toBe(3);
            expect(context.p2Base.damage).toBe(3);
        });

        it('Oppo Rancisis should gain lose keywords when the friendly unit leaves play', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    base: { card: 'echo-base', damage: 5 },
                    groundArena: ['oppo-rancisis#ancient-councilor', 'moisture-farmer'],
                },
                player2: {
                    hand: ['takedown']
                }
            });

            const { context } = contextRef;
            context.player1.passAction();
            context.player2.clickCard(context.takedown);
            context.player2.clickCard(context.moistureFarmer);

            context.player1.clickCard(context.oppoRancisis);
            context.player1.clickCard(context.p2Base);

            expect(context.p1Base.damage).toBe(5);
            expect(context.p2Base.damage).toBe(3);
        });

        it('Oppo Rancisis should not gain keywords from enemy units', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['oppo-rancisis#ancient-councilor'],
                },
                player2: {
                    groundArena: ['crafty-smuggler', 'cloudrider']
                }
            });

            const { context } = contextRef;
            context.player1.clickCard(context.oppoRancisis);
            expect(context.oppoRancisis).not.toHaveExactUpgradeNames(['shield']);
            expect(context.player2).toBeActivePlayer();
        });
    });
});