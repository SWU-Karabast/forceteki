describe('Logray, Bright Tree Shaman', function () {
    integration(function (contextRef) {
        describe('Logray\'s ability', function () {
            it('should optionally deal 1 damage to an enemy unit when another friendly unit that costs 3 or less is dealt damage', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['daring-raid'],
                        groundArena: ['logray#bright-tree-shaman', 'yoda#old-master']
                    },
                    player2: {
                        groundArena: ['wampa']
                    }
                });
                const { context } = contextRef;

                context.player1.clickCard(context.daringRaid);
                context.player1.clickCard(context.yoda);

                expect(context.yoda.damage).toBe(2);
                expect(context.player1).toBeAbleToSelectExactly([context.wampa]);
                expect(context.player1).toHavePassAbilityButton();

                context.player1.clickCard(context.wampa);

                expect(context.wampa.damage).toBe(1);
                expect(context.player2).toBeActivePlayer();
            });

            it('should optionally deal 1 damage to an enemy unit when another friendly unit that costs 3 or less is dealt damage (even if the friendly unit is killed)', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['logray#bright-tree-shaman', 'battlefield-marine']
                    },
                    player2: {
                        groundArena: ['wampa'],
                        hasInitiative: true,
                    }
                });
                const { context } = contextRef;

                context.player2.clickCard(context.wampa);
                context.player2.clickCard(context.battlefieldMarine);

                expect(context.player1).toBeAbleToSelectExactly([context.wampa]);
                expect(context.player1).toHavePassAbilityButton();

                context.player1.clickCard(context.wampa);

                expect(context.wampa.damage).toBe(4);
                expect(context.player1).toBeActivePlayer();
            });

            it('should not trigger if no damage has been dealt to friendly units', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['logray#bright-tree-shaman', 'battlefield-marine']
                    },
                    player2: {
                        groundArena: ['doctor-pershing#experimenting-with-life'],
                        hasInitiative: true,
                    }
                });
                const { context } = contextRef;

                context.player2.clickCard(context.doctorPershing);
                context.player2.clickPrompt('Attack');
                context.player2.clickCard(context.battlefieldMarine);

                expect(context.player1).toBeActivePlayer();
            });

            it('should not trigger when the damaged friendly unit costs more than 3', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['daring-raid'],
                        groundArena: ['logray#bright-tree-shaman', 'wampa']
                    },
                    player2: {
                        groundArena: ['atst']
                    }
                });
                const { context } = contextRef;

                context.player1.clickCard(context.daringRaid);
                context.player1.clickCard(context.wampa);

                expect(context.wampa.damage).toBe(2);
                expect(context.atst.damage).toBe(0);
                expect(context.player2).toBeActivePlayer();
            });

            it('should not trigger when Logray itself is dealt damage', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['daring-raid'],
                        groundArena: ['logray#bright-tree-shaman']
                    },
                    player2: {
                        groundArena: ['wampa']
                    }
                });
                const { context } = contextRef;

                context.player1.clickCard(context.daringRaid);
                context.player1.clickCard(context.logray);

                expect(context.logray.damage).toBe(2);
                expect(context.wampa.damage).toBe(0);
                expect(context.player2).toBeActivePlayer();
            });

            it('should not trigger when an enemy unit is dealt damage', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['daring-raid'],
                        groundArena: ['logray#bright-tree-shaman']
                    },
                    player2: {
                        groundArena: ['yoda#old-master']
                    }
                });
                const { context } = contextRef;

                context.player1.clickCard(context.daringRaid);
                context.player1.clickCard(context.yoda);

                expect(context.yoda.damage).toBe(2);
                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});
