describe('Dooku\'s Solar Sailer, Beautiful and Expensive', function() {
    integration(function(contextRef) {
        describe('Dooku\'s Solar Sailer\'s when played ability', function() {
            it('should give an Experience token to another Separatist unit if a base was healed this phase', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['dookus-solar-sailer#beautiful-and-expensive', 'repair'],
                        groundArena: ['battle-droid'],
                        base: { card: 'echo-base', damage: 5 },
                    },
                    player2: {
                        groundArena: ['wampa'],
                    }
                });
                const { context } = contextRef;

                // first heal a base using Repair
                context.player1.clickCard(context.repair);
                context.player1.clickCard(context.p1Base);
                expect(context.p1Base.damage).toBe(2);

                context.player2.passAction();

                // play Dooku's Solar Sailer — condition met (base healed this phase)
                context.player1.clickCard(context.dookusSolarSailer);
                const battleDroid = context.player1.findCardByName('battle-droid');
                expect(context.player1).toBeAbleToSelectExactly([battleDroid]);
                context.player1.clickCard(battleDroid);

                expect(context.player2).toBeActivePlayer();
                expect(battleDroid).toHaveExactUpgradeNames(['experience']);
            });

            it('should not give an Experience token if no base was healed this phase', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['dookus-solar-sailer#beautiful-and-expensive'],
                        groundArena: ['battle-droid'],
                    },
                    player2: {
                        groundArena: ['wampa'],
                    }
                });
                const { context } = contextRef;

                context.player1.clickCard(context.dookusSolarSailer);

                // condition not met — no base was healed, ability has no effect and skips target selection
                const battleDroid = context.player1.findCardByName('battle-droid');
                expect(context.player2).toBeActivePlayer();
                expect(battleDroid).toHaveExactUpgradeNames([]);
            });

            it('should not give an Experience token if base cannot be healed this phase', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['dookus-solar-sailer#beautiful-and-expensive'],
                        groundArena: ['yoda#old-master', 'rune-haako#scheming-second'],
                    },
                    player2: {
                        groundArena: ['wolffe#suspicious-veteran'],
                        hasInitiative: true,
                    }
                });
                const { context } = contextRef;

                context.player2.clickCard(context.wolffe);
                context.player2.clickCard(context.p1Base);

                context.player1.clickCard(context.yoda);
                context.player1.clickCard(context.p2Base);

                context.player2.passAction();

                context.player1.clickCard(context.dookusSolarSailer);

                expect(context.player2).toBeActivePlayer();
                expect(context.runeHaako).toHaveExactUpgradeNames([]);
            });
        });

        describe('Dooku\'s Solar Sailer\'s on attack ability', function() {
            it('should give an Experience token to another Separatist unit on attack if a base was healed this phase', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['repair'],
                        spaceArena: ['dookus-solar-sailer#beautiful-and-expensive'],
                        groundArena: ['battle-droid'],
                        base: { card: 'echo-base', damage: 5 },
                    },
                    player2: {
                        groundArena: ['wampa'],
                    }
                });
                const { context } = contextRef;

                // heal a base first
                context.player1.clickCard(context.repair);
                context.player1.clickCard(context.p1Base);

                context.player2.passAction();

                // attack with the Solar Sailer
                context.player1.clickCard(context.dookusSolarSailer);
                context.player1.clickCard(context.p2Base);

                const battleDroid = context.player1.findCardByName('battle-droid');
                expect(context.player1).toBeAbleToSelectExactly([battleDroid]);
                context.player1.clickCard(battleDroid);

                expect(context.player2).toBeActivePlayer();
                expect(battleDroid).toHaveExactUpgradeNames(['experience']);
            });

            it('should not give an Experience token on attack if no base was healed this phase', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        spaceArena: ['dookus-solar-sailer#beautiful-and-expensive'],
                        groundArena: ['battle-droid'],
                    },
                    player2: {
                        groundArena: ['wampa'],
                    }
                });
                const { context } = contextRef;

                // attack without any base healed
                context.player1.clickCard(context.dookusSolarSailer);
                context.player1.clickCard(context.p2Base);

                // condition not met — ability has no effect and skips target selection
                const battleDroid = context.player1.findCardByName('battle-droid');
                expect(context.player2).toBeActivePlayer();
                expect(battleDroid).toHaveExactUpgradeNames([]);
            });
        });
    });
});
