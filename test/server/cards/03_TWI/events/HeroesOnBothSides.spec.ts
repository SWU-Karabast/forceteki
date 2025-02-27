describe('Heroes on Both Sides', function () {
    integration(function (contextRef) {
        it('Heroes on Both Sides\'s ability should give +2/+2 and Saboteur for the phase', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['heroes-on-both-sides'],
                    groundArena: ['super-battle-droid', 'clone-dive-trooper']
                },
                player2: {
                    groundArena: ['patrolling-aat'],
                    spaceArena: ['headhunter-squadron'],
                }
            });

            const { context } = contextRef;

            // P1: Play Heroes on Both Sides
            context.player1.clickCard(context.heroesOnBothSides);

            // Choose a Republic unit
            expect(context.player1).toBeAbleToSelectExactly([context.cloneDiveTrooper, context.headhunterSquadron]);
            expect(context.player1).toHaveChooseNoTargetButton();

            context.player1.clickCard(context.cloneDiveTrooper);

            // Choose a Separatist unit
            expect(context.player1).toBeAbleToSelectExactly([context.superBattleDroid, context.patrollingAat]);
            expect(context.player1).toHaveChooseNoTargetButton();

            context.player1.clickCard(context.superBattleDroid);

            expect(context.cloneDiveTrooper.getPower()).toBe(4);
            expect(context.cloneDiveTrooper.getHp()).toBe(3);
            expect(context.superBattleDroid.getPower()).toBe(6);
            expect(context.superBattleDroid.getHp()).toBe(5);

            // P2: Pass action
            context.player2.passAction();

            // P1: Attack with Clone Dive Trooper to confirm that it has Saboteur
            context.player1.clickCard(context.cloneDiveTrooper);
            expect(context.player1).toBeAbleToSelectExactly([context.patrollingAat, context.p2Base]);

            context.player1.clickCard(context.p2Base);
            expect(context.p2Base.damage).toBe(4);

            // P2: Pass action
            context.player2.passAction();

            // P1: Attack with Super Battle Droid to confirm that it has Saboteur
            context.player1.clickCard(context.superBattleDroid);
            expect(context.player1).toBeAbleToSelectExactly([context.patrollingAat, context.p2Base]);

            context.player1.clickCard(context.p2Base);
            expect(context.p2Base.damage).toBe(10);

            // Move to the next action phase
            context.moveToNextActionPhase();

            expect(context.cloneDiveTrooper.getPower()).toBe(2);
            expect(context.cloneDiveTrooper.getHp()).toBe(1);
            expect(context.superBattleDroid.getPower()).toBe(4);
            expect(context.superBattleDroid.getHp()).toBe(3);

            // P1: Attack with Clone Dive Trooper to confirm that the effect is gone
            context.player1.clickCard(context.cloneDiveTrooper);
            expect(context.player1).toBeAbleToSelectExactly([context.patrollingAat]);

            context.player1.clickCard(context.patrollingAat);
            expect(context.patrollingAat.damage).toBe(2);

            // P2: Pass action
            context.patrollingAat.damage = 0;
            context.player2.passAction();

            // P1: Attack with Super Battle Droid to confirm that the effect is gone
            context.player1.clickCard(context.superBattleDroid);
            expect(context.player1).toBeAbleToSelectExactly([context.patrollingAat]);

            context.player1.clickCard(context.patrollingAat);
            expect(context.patrollingAat.damage).toBe(4);
        });
    });
});
