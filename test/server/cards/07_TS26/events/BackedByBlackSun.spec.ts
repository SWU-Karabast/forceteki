describe('Backed by Black Sun', function() {
    integration(function(contextRef) {
        it('Backed by Black Sun\'s ability should deal 1 damage to an enemy unit and damage to a unit equal to the number of damaged enemy unit', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['backed-by-black-sun'],
                    groundArena: ['atst']
                },
                player2: {
                    groundArena: ['wampa', 'yoda#old-master']
                }
            });
            const { context } = contextRef;

            context.player1.clickCard(context.backedByBlackSun);
            expect(context.player1).toHavePrompt('Deal 1 damage to an enemy unit');
            expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.yoda]);
            expect(context.player1).not.toHaveChooseNothingButton();
            expect(context.player1).not.toHavePassAbilityButton();
            context.player1.clickCard(context.wampa);
            expect(context.wampa.damage).toBe(1);

            expect(context.player1).toHavePrompt('Deal 1 damage to a unit');
            expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.yoda, context.atst]);
            expect(context.player1).toHavePassAbilityButton();
            context.player1.clickCard(context.yoda);

            expect(context.player2).toBeActivePlayer();
            expect(context.wampa.damage).toBe(1);
            expect(context.yoda.damage).toBe(1);
        });

        it('Backed by Black Sun\'s ability should deal 1 damage to an enemy unit and damage to a unit equal to the number of damaged enemy unit (should not count damage from friendly unit)', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['backed-by-black-sun'],
                    groundArena: [{ card: 'atst', damage: 1 }]
                },
                player2: {
                    groundArena: ['wampa', { card: 'yoda#old-master', damage: 1 }, { card: 'battlefield-marine', damage: 1 }],
                    spaceArena: [{ card: 'awing', damage: 1 }]
                }
            });
            const { context } = contextRef;

            context.player1.clickCard(context.backedByBlackSun);
            expect(context.player1).toHavePrompt('Deal 1 damage to an enemy unit');
            expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.yoda, context.battlefieldMarine, context.awing]);
            expect(context.player1).not.toHaveChooseNothingButton();
            expect(context.player1).not.toHavePassAbilityButton();
            context.player1.clickCard(context.wampa);
            expect(context.wampa.damage).toBe(1);

            expect(context.player1).toHavePrompt('Deal 4 damage to a unit');
            expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.yoda, context.atst, context.battlefieldMarine, context.awing]);
            expect(context.player1).toHavePassAbilityButton();
            context.player1.clickCard(context.wampa);

            expect(context.player2).toBeActivePlayer();
            expect(context.wampa).toBeInZone('discard', context.player2);
        });

        it('Backed by Black Sun\'s ability should only deal first damage if no enemy unit alive after the first one', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['backed-by-black-sun'],
                    groundArena: ['atst']
                },
                player2: {
                    groundArena: ['outer-rim-constable']
                }
            });
            const { context } = contextRef;

            context.player1.clickCard(context.backedByBlackSun);
            context.player1.clickCard(context.outerRimConstable);
            expect(context.player2).toBeActivePlayer();
            expect(context.outerRimConstable).toBeInZone('discard', context.player2);
        });

        it('Backed by Black Sun\'s ability should only deal first damage if no damaged enemy unit after the first one', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['backed-by-black-sun'],
                    groundArena: ['atst']
                },
                player2: {
                    groundArena: ['outer-rim-constable', 'yoda#old-master']
                }
            });
            const { context } = contextRef;

            context.player1.clickCard(context.backedByBlackSun);
            context.player1.clickCard(context.outerRimConstable);
            expect(context.player2).toBeActivePlayer();
            expect(context.outerRimConstable).toBeInZone('discard', context.player2);
        });
    });
});
