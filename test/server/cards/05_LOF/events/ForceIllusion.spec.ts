describe('Force Illusion', function() {
    integration(function(contextRef) {
        it('Force Illusion\'s ability should exhaust an enemy unit and give a friendly unit Sentinel for the phase', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['force-illusion'],
                    groundArena: ['wampa'],
                    spaceArena: ['green-squadron-awing']
                },
                player2: {
                    groundArena: ['atst', 'isb-agent'],
                }
            });

            const { context } = contextRef;

            // Play Force Illusion
            context.player1.clickCard(context.forceIllusion);

            // Select an enemy unit to exhaust
            expect(context.player1).toBeAbleToSelectExactly([context.atst, context.isbAgent]);
            expect(context.player1).not.toHavePassAbilityButton();
            expect(context.player1).not.toHaveChooseNothingButton();
            context.player1.clickCard(context.atst);

            // Verify the enemy unit is exhausted
            expect(context.atst.exhausted).toBeTrue();

            // Select a friendly unit to gain Sentinel
            expect(context.player1).toBeAbleToSelectExactly([context.greenSquadronAwing, context.wampa]);
            expect(context.player1).not.toHavePassAbilityButton();
            expect(context.player1).not.toHaveChooseNothingButton();
            context.player1.clickCard(context.wampa);

            expect(context.player2).toBeActivePlayer();

            context.player2.clickCard(context.isbAgent);

            // ensure wampa is sentinel
            expect(context.player2).toBeAbleToSelectExactly([context.wampa]);
            context.player2.clickCard(context.wampa);

            context.moveToNextActionPhase();

            context.player1.passAction();

            // wampa is not sentinel anymore
            context.player2.clickCard(context.atst);
            expect(context.player2).toBeAbleToSelectExactly([context.wampa, context.p1Base]);
            context.player2.clickCard(context.p1Base);
        });

        it('Force Illusion\'s ability should exhaust an enemy unit and give a friendly unit Sentinel for the phase', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['force-illusion'],
                    groundArena: ['wampa'],
                    spaceArena: ['green-squadron-awing']
                },
            });

            const { context } = contextRef;

            // Play Force Illusion
            context.player1.clickCard(context.forceIllusion);

            // Select a friendly unit to gain Sentinel
            expect(context.player1).toBeAbleToSelectExactly([context.greenSquadronAwing, context.wampa]);
            expect(context.player1).not.toHavePassAbilityButton();
            expect(context.player1).not.toHaveChooseNothingButton();
            context.player1.clickCard(context.wampa);

            expect(context.player2).toBeActivePlayer();
        });

        it('Force Illusion\'s ability should exhaust an enemy unit and give a friendly unit Sentinel for the phase', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['force-illusion'],
                },
                player2: {
                    groundArena: ['atst', 'isb-agent'],
                }
            });

            const { context } = contextRef;

            // Play Force Illusion
            context.player1.clickCard(context.forceIllusion);

            // Select an enemy unit to exhaust
            expect(context.player1).toBeAbleToSelectExactly([context.atst, context.isbAgent]);
            expect(context.player1).not.toHavePassAbilityButton();
            expect(context.player1).not.toHaveChooseNothingButton();
            context.player1.clickCard(context.atst);

            // Verify the enemy unit is exhausted
            expect(context.atst.exhausted).toBeTrue();
            expect(context.player2).toBeActivePlayer();
        });
    });
});