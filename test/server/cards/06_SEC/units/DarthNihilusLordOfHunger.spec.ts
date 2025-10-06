describe('Darth Nihilus, Lord of Hunger', function () {
    integration(function (contextRef) {
        describe('Darth Nihilus\' when played ability', function () {
            it('should deal 3 damage to the unit with the least remaining HP among other units and give an Experience token if it\'s non-Vehicle', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['darth-nihilus#lord-of-hunger'],
                        groundArena: ['wampa']
                    },
                    player2: {
                        groundArena: ['scout-bike-pursuer', 'atst']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.darthNihilusLordOfHunger);

                expect(context.player1).toBeAbleToSelectExactly([context.scoutBikePursuer]);
                context.player1.clickCard(context.scoutBikePursuer);

                expect(context.scoutBikePursuer.damage).toBe(3);

                expect(context.darthNihilusLordOfHunger).toHaveExactUpgradeNames(['experience']);
            });

            it('should deal 3 damage to the unit with the least remaining HP among other units and give an Experience token if it\'s non-Vehicle (choose if tie and do not give experience if target is a vehicle unit)', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['darth-nihilus#lord-of-hunger'],
                        groundArena: ['wampa']
                    },
                    player2: {
                        groundArena: [{ card: 'atst', damage: 2 }]
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.darthNihilusLordOfHunger);

                expect(context.player1).toBeAbleToSelectExactly([context.atst, context.wampa]);
                context.player1.clickCard(context.atst);

                expect(context.atst.damage).toBe(5);

                expect(context.darthNihilusLordOfHunger).toHaveExactUpgradeNames([]);
            });

            it('should deal 3 damage to the unit with the least remaining HP among other units and give an Experience token if it\'s non-Vehicle (must choose our unit if opponent does not have one)', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['darth-nihilus#lord-of-hunger'],
                        groundArena: [{ card: 'atst', damage: 2 }]
                    },
                });

                const { context } = contextRef;

                context.player1.clickCard(context.darthNihilusLordOfHunger);

                expect(context.player1).toBeAbleToSelectExactly([context.atst]);
                expect(context.player1).not.toHavePassAbilityButton();
                expect(context.player1).not.toHaveChooseNothingButton();

                context.player1.clickCard(context.atst);

                expect(context.atst.damage).toBe(5);
                expect(context.darthNihilusLordOfHunger).toHaveExactUpgradeNames([]);
            });

            it('should deal 3 damage to the unit with the least remaining HP among other units and give an Experience token if it\'s non-Vehicle (should not deal to Nihilus if he is alone)', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['darth-nihilus#lord-of-hunger'],
                    },
                });

                const { context } = contextRef;

                context.player1.clickCard(context.darthNihilusLordOfHunger);
                expect(context.player2).toBeActivePlayer();
            });
        });

        describe('Darth Nihilus\' on attack ability', function () {
            it('should deal 3 damage to the unit with the least remaining HP among other units and give an Experience token if it\'s non-Vehicle', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['darth-nihilus#lord-of-hunger', 'wampa']
                    },
                    player2: {
                        groundArena: ['scout-bike-pursuer', 'atst']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.darthNihilusLordOfHunger);
                context.player1.clickCard(context.p2Base);

                expect(context.player1).toBeAbleToSelectExactly([context.scoutBikePursuer]);
                context.player1.clickCard(context.scoutBikePursuer);

                expect(context.scoutBikePursuer.damage).toBe(3);

                expect(context.darthNihilusLordOfHunger).toHaveExactUpgradeNames(['experience']);
            });

            it('should deal 3 damage to the unit with the least remaining HP among other units and give an Experience token if it\'s non-Vehicle (choose if tie and do not give experience if target is a vehicle unit)', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['darth-nihilus#lord-of-hunger', 'wampa']
                    },
                    player2: {
                        groundArena: [{ card: 'atst', damage: 2 }]
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.darthNihilusLordOfHunger);
                context.player1.clickCard(context.p2Base);

                expect(context.player1).toBeAbleToSelectExactly([context.atst, context.wampa]);
                context.player1.clickCard(context.atst);

                expect(context.atst.damage).toBe(5);

                expect(context.darthNihilusLordOfHunger).toHaveExactUpgradeNames([]);
            });

            it('should deal 3 damage to the unit with the least remaining HP among other units and give an Experience token if it\'s non-Vehicle (must choose our unit if opponent does not have one)', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: [],
                        groundArena: ['darth-nihilus#lord-of-hunger', { card: 'atst', damage: 2 }]
                    },
                });

                const { context } = contextRef;

                context.player1.clickCard(context.darthNihilusLordOfHunger);
                context.player1.clickCard(context.p2Base);

                expect(context.player1).toBeAbleToSelectExactly([context.atst]);
                expect(context.player1).not.toHavePassAbilityButton();
                expect(context.player1).not.toHaveChooseNothingButton();

                context.player1.clickCard(context.atst);

                expect(context.atst.damage).toBe(5);
                expect(context.darthNihilusLordOfHunger).toHaveExactUpgradeNames([]);
            });

            it('should deal 3 damage to the unit with the least remaining HP among other units and give an Experience token if it\'s non-Vehicle (should not deal to Nihilus if he is alone)', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['darth-nihilus#lord-of-hunger'],
                    },
                });

                const { context } = contextRef;

                context.player1.clickCard(context.darthNihilusLordOfHunger);
                context.player1.clickCard(context.p2Base);
                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});
