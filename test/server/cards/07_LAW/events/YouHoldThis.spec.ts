describe('You Hold This', function () {
    integration(function (contextRef) {
        describe('You Hold This\'s ability', function () {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['you-hold-this'],
                        groundArena: ['battlefield-marine', 'wampa'],
                        spaceArena: ['alliance-xwing']
                    },
                    player2: {
                        groundArena: ['pyke-sentinel'],
                        spaceArena: ['cartel-spacer']
                    }
                });
            });

            it('should transfer a ground unit and deal 4 damage to another ground unit', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.youHoldThis);

                // Can only select friendly non-leader units
                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.wampa, context.allianceXwing]);
                expect(context.player1).not.toHavePassAbilityButton();
                expect(context.player1).not.toHaveChooseNothingButton();

                context.player1.clickCard(context.battlefieldMarine);

                // Battlefield Marine should now be controlled by opponent
                expect(context.battlefieldMarine).toBeInZone('groundArena', context.player2);

                // Should prompt to deal 4 damage to ANOTHER unit in the same arena (ground)
                // The transferred unit is excluded since it says "another"
                expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.pykeSentinel]);

                context.player1.clickCard(context.wampa);

                expect(context.wampa.damage).toBe(4);
                expect(context.player2).toBeActivePlayer();
            });

            it('should defeat an enemy unit when dealing 4 damage', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.youHoldThis);
                context.player1.clickCard(context.battlefieldMarine);

                // Deal damage to the enemy unit
                context.player1.clickCard(context.pykeSentinel);

                expect(context.pykeSentinel).toBeInZone('discard'); // 3 HP
                expect(context.battlefieldMarine.controller).toBe(context.player2Object);
                expect(context.player2).toBeActivePlayer();
            });

            it('should transfer a space unit and deal 4 damage to another space unit', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.youHoldThis);
                context.player1.clickCard(context.allianceXwing);

                // Alliance X-Wing should now be controlled by opponent
                expect(context.allianceXwing.controller).toBe(context.player2Object);
                expect(context.allianceXwing).toBeInZone('spaceArena', context.player2);

                // Should prompt to deal 4 damage to another unit in the same arena (space)
                // The transferred unit is excluded since it says "another"
                expect(context.player1).toBeAbleToSelectExactly([context.cartelSpacer]);

                context.player1.clickCard(context.cartelSpacer);

                expect(context.cartelSpacer).toBeInZone('discard'); // 3 HP, takes 4 damage
                expect(context.player2).toBeActivePlayer();
            });

            it('should be able to deal damage to a friendly unit', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.youHoldThis);
                context.player1.clickCard(context.battlefieldMarine);

                // Target Wampa (friendly unit in the same arena)
                context.player1.clickCard(context.wampa);

                expect(context.wampa.damage).toBe(4);
                expect(context.player2).toBeActivePlayer();
            });
        });

        it('should skip damage step if no other units in the same arena', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['you-hold-this'],
                    groundArena: ['battlefield-marine']
                },
                player2: {
                    spaceArena: ['cartel-spacer']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.youHoldThis);
            context.player1.clickCard(context.battlefieldMarine);

            // No other units in ground arena (transferred unit excluded)
            // So the damage step should be skipped
            expect(context.battlefieldMarine.controller).toBe(context.player2Object);
            expect(context.player2).toBeActivePlayer();
        });
    });

    // TODO ADD TESTS WITH REY
});
