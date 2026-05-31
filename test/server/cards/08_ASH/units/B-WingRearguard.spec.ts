describe('B-Wing Rear Guard', function() {
    integration(function(contextRef) {
        it('should have Sentinel if there is a friendly ground unit', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['battlefield-marine'],
                    spaceArena: ['bwing-rearguard']
                },
                player2: {
                    spaceArena: ['awing'],
                    hasInitiative: true
                }
            });

            const { context } = contextRef;

            context.player2.clickCard(context.awing);
            expect(context.player2).toBeAbleToSelectExactly([context.bwingRearguard]);
            expect(context.bwingRearguard.hasSomeKeyword('sentinel')).toBe(true);
            context.player2.clickCard(context.bwingRearguard);
            expect(context.bwingRearguard.damage).toBe(2);
            expect(context.awing).toBeInZone('discard', context.player2);
        });

        it('should not have Sentinel if there is not a friendly ground unit', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    spaceArena: ['bwing-rearguard']
                },
                player2: {
                    groundArena: ['wampa'],
                    spaceArena: ['awing'],
                    hasInitiative: true
                }
            });

            const { context } = contextRef;

            context.player2.clickCard(context.awing);
            expect(context.player2).toBeAbleToSelectExactly([context.bwingRearguard, context.p1Base]);
            expect(context.bwingRearguard.hasSomeKeyword('sentinel')).toBe(false);
            context.player2.clickCard(context.p1Base);
            expect(context.p1Base.damage).toBe(2);
            expect(context.awing).toBeInZone('spaceArena', context.player2);
        });

        it('should have Sentinel if the current friendly ground unit changed control', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    spaceArena: ['bwing-rearguard'],
                    hand: ['change-of-heart']
                },
                player2: {
                    spaceArena: ['awing'],
                    groundArena: ['battlefield-marine'],
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.changeOfHeart);
            context.player1.clickCard(context.battlefieldMarine);

            context.player2.clickCard(context.awing);
            expect(context.player2).toBeAbleToSelectExactly([context.bwingRearguard]);
            expect(context.bwingRearguard.hasSomeKeyword('sentinel')).toBe(true);
            context.player2.clickCard(context.bwingRearguard);
            expect(context.bwingRearguard.damage).toBe(2);
            expect(context.awing).toBeInZone('discard', context.player2);
        });

        it('should not have Sentinel if the formerly friendly ground unit changed control', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    spaceArena: ['bwing-rearguard'],
                    groundArena: ['battlefield-marine'],
                },
                player2: {
                    spaceArena: ['awing'],
                    hand: ['change-of-heart'],
                    hasInitiative: true
                }
            });

            const { context } = contextRef;

            context.player2.clickCard(context.changeOfHeart);
            context.player2.clickCard(context.battlefieldMarine);

            context.player1.passAction();

            context.player2.clickCard(context.awing);
            expect(context.player2).toBeAbleToSelectExactly([context.bwingRearguard, context.p1Base]);
            expect(context.bwingRearguard.hasSomeKeyword('sentinel')).toBe(false);
            context.player2.clickCard(context.p1Base);
            expect(context.p1Base.damage).toBe(2);
            expect(context.awing).toBeInZone('spaceArena', context.player2);
        });

        it('should have Sentinel if the current friendly ground unit is Blue Leader after moving to ground', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    spaceArena: ['bwing-rearguard'],
                    hand: ['blue-leader#scarif-air-support']
                },
                player2: {
                    spaceArena: ['awing'],
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.blueLeader);
            context.player1.clickPrompt('Pay 2 resources to move this unit to the ground arena and give 2 Experience tokens to it');
            context.player1.clickPrompt('Trigger');

            context.player2.clickCard(context.awing);
            expect(context.player2).toBeAbleToSelectExactly([context.bwingRearguard]);
            expect(context.bwingRearguard.hasSomeKeyword('sentinel')).toBe(true);
            context.player2.clickCard(context.bwingRearguard);
            expect(context.bwingRearguard.damage).toBe(2);
            expect(context.awing).toBeInZone('discard', context.player2);
        });
    });
});