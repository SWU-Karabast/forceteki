describe('Let\'s Call It War', function() {
    integration(function(contextRef) {
        it('Let\'s Call It War\'s ability should deal 3 damage to an enemy unit, then allow dealing 2 damage to another unit in the same arena when played with initiative', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hasInitiative: true,
                    hand: ['lets-call-it-war'],
                },
                player2: {
                    groundArena: ['wampa', 'atst'],
                    spaceArena: ['tieln-fighter']
                },
            });

            const { context } = contextRef;
            context.player1.clickCard(context.letsCallItWar);

            expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.atst, context.tielnFighter]);
            expect(context.player1).not.toHaveChooseNothingButton();
            context.player1.clickCard(context.wampa);

            expect(context.player1).toBeAbleToSelectExactly([context.atst]);
            expect(context.player1).toHaveChooseNothingButton();
            context.player1.clickCard(context.atst);

            expect(context.player2).toBeActivePlayer();
            expect(context.atst.damage).toBe(2);
            expect(context.wampa.damage).toBe(3);
        });

        it('Let\'s Call It War\'s ability should deal 3 damage to an enemy unit, but not allow dealing 2 damage to another unit when played without initiative', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['lets-call-it-war'],
                },
                player2: {
                    hasInitiative: true,
                    groundArena: ['wampa', 'atst'],
                    spaceArena: ['tieln-fighter']
                },
            });

            const { context } = contextRef;

            context.player2.passAction();
            context.player1.clickCard(context.letsCallItWar);

            expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.atst, context.tielnFighter]);
            expect(context.player1).not.toHaveChooseNothingButton();
            context.player1.clickCard(context.wampa);

            expect(context.player2).toBeActivePlayer();
            expect(context.atst.damage).toBe(0);
            expect(context.tielnFighter.damage).toBe(0);
            expect(context.wampa.damage).toBe(3);
        });
        it('Let\'s Call It War\'s ability should deal 3 damage to a friendly unit, but not allow dealing 2 damage to another unit when played without initiative', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['lets-call-it-war'],
                    groundArena: ['wampa'],
                },
                player2: {
                    hasInitiative: true,
                    groundArena: ['atst'],
                    spaceArena: ['tieln-fighter']
                },
            });

            const { context } = contextRef;

            context.player2.passAction();
            context.player1.clickCard(context.letsCallItWar);

            expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.atst, context.tielnFighter]);
            expect(context.player1).not.toHaveChooseNothingButton();
            context.player1.clickCard(context.wampa);

            expect(context.player2).toBeActivePlayer();
            expect(context.atst.damage).toBe(0);
            expect(context.tielnFighter.damage).toBe(0);
            expect(context.wampa.damage).toBe(3);
        });

        it('Let\'s Call It War\'s ability should deal 3 damage to a friendly unit, and allow dealing 2 damage to another friendly unit when played with initiative', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['lets-call-it-war'],
                    hasInitiative: true,
                    groundArena: ['wampa', 'atst'],
                    spaceArena: ['tieln-fighter']
                },
            });

            const { context } = contextRef;

            context.player1.clickCard(context.letsCallItWar);

            expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.atst, context.tielnFighter]);
            expect(context.player1).not.toHaveChooseNothingButton();
            context.player1.clickCard(context.wampa);

            expect(context.player1).toBeAbleToSelectExactly([context.atst]);
            expect(context.player1).toHaveChooseNothingButton();
            context.player1.clickCard(context.atst);

            expect(context.player2).toBeActivePlayer();
            expect(context.atst.damage).toBe(2);
            expect(context.wampa.damage).toBe(3);
        });

        it('Let\'s Call It War\'s ability should deal 3 damage to a friendly unit, and allow dealing 2 damage to an enemy unit when played with initiative', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hasInitiative: true,
                    hand: ['lets-call-it-war'],
                    groundArena: ['wampa'],
                },
                player2: {
                    groundArena: ['atst'],
                    spaceArena: ['tieln-fighter']
                },
            });

            const { context } = contextRef;

            context.player1.clickCard(context.letsCallItWar);

            expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.atst, context.tielnFighter]);
            expect(context.player1).not.toHaveChooseNothingButton();
            context.player1.clickCard(context.wampa);

            expect(context.player1).toBeAbleToSelectExactly([context.atst]);
            expect(context.player1).toHaveChooseNothingButton();
            context.player1.clickCard(context.atst);

            expect(context.player2).toBeActivePlayer();
            expect(context.atst.damage).toBe(2);
            expect(context.wampa.damage).toBe(3);
        });

        it('Let\'s Call It War\'s ability should deal 3 damage to an enemy space unit, and allow dealing 2 damage to another unit when played with initiative', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['lets-call-it-war'],
                    hasInitiative: true,
                    groundArena: ['wampa', 'atst'],
                    spaceArena: ['gladiator-star-destroyer']
                },
                player2: {
                    spaceArena: ['strafing-gunship']
                },
            });

            const { context } = contextRef;

            context.player1.clickCard(context.letsCallItWar);

            expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.atst, context.gladiatorStarDestroyer, context.strafingGunship]);
            expect(context.player1).not.toHaveChooseNothingButton();
            context.player1.clickCard(context.strafingGunship);

            expect(context.player1).toBeAbleToSelectExactly([context.gladiatorStarDestroyer]);
            expect(context.player1).toHaveChooseNothingButton();
            context.player1.clickCard(context.gladiatorStarDestroyer);

            expect(context.player2).toBeActivePlayer();
            expect(context.gladiatorStarDestroyer.damage).toBe(2);
            expect(context.strafingGunship.damage).toBe(3);
        });
    });
});