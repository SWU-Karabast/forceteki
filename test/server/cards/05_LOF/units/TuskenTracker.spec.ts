describe('Tusken Tracker', function() {
    integration(function(contextRef) {
        it('Tusken Tracker\'s when played ability should remove Hidden from all enemy units for the phase', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['tusken-tracker', 'ewok-warrior'],
                    groundArena: ['atst', 'rey#skywalker', 'porg']
                },
                player2: {
                    hand: ['village-tender', 'vulptex', 'dooku#it-is-too-late'],
                    groundArena: ['battlefield-marine', 'wampa']
                }
            });

            const { context } = contextRef;

            // play hidden unit
            context.player1.clickCard(context.ewokWarrior);
            context.player2.clickCard(context.villageTender);

            // hidden unit cannot be attacked
            context.player1.clickCard(context.porg);
            expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.wampa, context.p2Base]);
            context.player1.clickCard(context.p2Base);

            context.player2.clickCard(context.wampa);
            expect(context.player2).toBeAbleToSelectExactly([context.atst, context.rey, context.porg, context.p1Base]);
            context.player2.clickCard(context.p1Base);

            // play tusken tracker, enemy unit loose Hidden
            context.player1.clickCard(context.tuskenTracker);

            // friendly units do not loose Hidden
            context.player2.clickCard(context.battlefieldMarine);
            expect(context.player2).toBeAbleToSelectExactly([context.atst, context.rey, context.porg, context.tuskenTracker, context.p1Base]);
            context.player2.clickCard(context.p1Base);

            // Village Tender can be attacked
            context.player1.clickCard(context.atst);
            expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.wampa, context.villageTender, context.p2Base]);
            context.player1.clickCard(context.p2Base);

            context.moveToNextActionPhase();

            // Hidden has no more effect
            context.player1.clickCard(context.porg);
            expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.wampa, context.villageTender, context.p2Base]);
            context.player1.clickCard(context.p2Base);

            // Dooku "hide" friendly units with Hidden
            context.player2.clickCard(context.dooku);

            // Village Tender cannot be attacked
            context.player1.clickCard(context.rey);
            expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.wampa, context.p2Base]);
            context.player1.clickCard(context.p2Base);
        });
    });
});