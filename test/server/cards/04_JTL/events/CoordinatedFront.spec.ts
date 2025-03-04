describe('Coordinated Front', function () {
    integration(function (contextRef) {
        it('Coordinated Front\'s ability should give +2/+2 to a ground and a space unit for the phase', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['coordinated-front'],
                    groundArena: ['super-battle-droid'],
                    spaceArena: ['tieln-fighter']
                },
                player2: {
                    groundArena: ['patrolling-aat'],
                    spaceArena: ['headhunter-squadron'],
                }
            });

            const { context } = contextRef;

            // Play Coordinated Front
            context.player1.clickCard(context.coordinatedFront);

            // Choose a ground unit
            expect(context.player1).toBeAbleToSelectExactly([context.superBattleDroid, context.patrollingAat]);
            expect(context.player1).toHaveChooseNoTargetButton();

            context.player1.clickCard(context.superBattleDroid);

            // Choose a space unit
            expect(context.player1).toBeAbleToSelectExactly([context.tielnFighter, context.headhunterSquadron]);
            expect(context.player1).toHaveChooseNoTargetButton();

            context.player1.clickCard(context.tielnFighter);

            expect(context.superBattleDroid.getPower()).toBe(6); // 4 base power + 2 from Coordinated Front ability
            expect(context.superBattleDroid.getHp()).toBe(5); // 3 base HP + 2 from Coordinated Front ability
            expect(context.tielnFighter.getPower()).toBe(4); // 2 Base power + 2 from Coordinated Front ability
            expect(context.tielnFighter.getHp()).toBe(3); // 1 Base HP + 2 from Coordinated Front ability

            // Move to the next action phase
            context.moveToNextActionPhase();

            expect(context.superBattleDroid.getPower()).toBe(4); // 4 base power
            expect(context.superBattleDroid.getHp()).toBe(3); // 3 base HP
            expect(context.tielnFighter.getPower()).toBe(2); // 2 Base power
            expect(context.tielnFighter.getHp()).toBe(1); // 1 Base HP
        });
    });
});
