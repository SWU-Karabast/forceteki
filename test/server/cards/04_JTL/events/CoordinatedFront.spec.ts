describe('Coordinated Front', function () {
    integration(function (contextRef) {
        describe('Coordinated Front\'s ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
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
            });

            it(' should give +2/+2 to a ground and a space unit for the phase', function () {
                const { context } = contextRef;

                // Play Coordinated Front
                context.player1.clickCard(context.coordinatedFront);

                // Choose a ground unit
                expect(context.player1).toBeAbleToSelectExactly([context.superBattleDroid, context.patrollingAat]);
                expect(context.player1).toHaveChooseNothingButton();

                context.player1.clickCard(context.superBattleDroid);

                // Choose a space unit
                expect(context.player1).toBeAbleToSelectExactly([context.tielnFighter, context.headhunterSquadron]);
                expect(context.player1).toHaveChooseNothingButton();

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

            it(' should give +2/+2 only to a ground unit for the phase', function () {
                const { context } = contextRef;

                // Play Coordinated Front
                context.player1.clickCard(context.coordinatedFront);

                // Choose a ground unit
                expect(context.player1).toBeAbleToSelectExactly([context.superBattleDroid, context.patrollingAat]);
                expect(context.player1).toHaveChooseNothingButton();

                context.player1.clickCard(context.superBattleDroid);

                // Choose a space unit
                expect(context.player1).toBeAbleToSelectExactly([context.tielnFighter, context.headhunterSquadron]);
                expect(context.player1).toHaveChooseNothingButton();

                context.player1.clickPrompt('Choose nothing');

                expect(context.superBattleDroid.getPower()).toBe(6); // 4 base power + 2 from Coordinated Front ability
                expect(context.superBattleDroid.getHp()).toBe(5); // 3 base HP + 2 from Coordinated Front ability
                expect(context.tielnFighter.getPower()).toBe(2); // 2 Base power
                expect(context.tielnFighter.getHp()).toBe(1); // 1 Base HP

                // Move to the next action phase
                context.moveToNextActionPhase();

                expect(context.superBattleDroid.getPower()).toBe(4); // 4 base power
                expect(context.superBattleDroid.getHp()).toBe(3); // 3 base HP
                expect(context.tielnFighter.getPower()).toBe(2); // 2 Base power
                expect(context.tielnFighter.getHp()).toBe(1); // 1 Base HP
            });

            it(' should give +2/+2 only to a space unit for the phase', function () {
                const { context } = contextRef;

                // Play Coordinated Front
                context.player1.clickCard(context.coordinatedFront);

                // Choose a ground unit
                expect(context.player1).toBeAbleToSelectExactly([context.superBattleDroid, context.patrollingAat]);
                expect(context.player1).toHaveChooseNothingButton();

                context.player1.clickPrompt('Choose nothing');

                // Choose a space unit
                expect(context.player1).toBeAbleToSelectExactly([context.tielnFighter, context.headhunterSquadron]);
                expect(context.player1).toHaveChooseNothingButton();

                context.player1.clickCard(context.tielnFighter);

                expect(context.superBattleDroid.getPower()).toBe(4); // 4 base power
                expect(context.superBattleDroid.getHp()).toBe(3); // 3 base HP
                expect(context.tielnFighter.getPower()).toBe(4); // 2 Base power + 2 from Coordinated Front ability
                expect(context.tielnFighter.getHp()).toBe(3); // 1 Base HP + 2 from Coordinated Front ability

                // Move to the next action phase
                context.moveToNextActionPhase();

                expect(context.superBattleDroid.getPower()).toBe(4); // 4 base power
                expect(context.superBattleDroid.getHp()).toBe(3); // 3 base HP
                expect(context.tielnFighter.getPower()).toBe(2); // 2 Base power
                expect(context.tielnFighter.getHp()).toBe(1); // 1 Base HP
            });

            it('should not give +2/+2 to any unit', function () {
                const { context } = contextRef;

                // Play Coordinated Front
                context.player1.clickCard(context.coordinatedFront);

                // Choose a ground unit
                expect(context.player1).toBeAbleToSelectExactly([context.superBattleDroid, context.patrollingAat]);
                expect(context.player1).toHaveChooseNothingButton();

                context.player1.clickPrompt('Choose nothing');

                // Choose a space unit
                expect(context.player1).toBeAbleToSelectExactly([context.tielnFighter, context.headhunterSquadron]);
                expect(context.player1).toHaveChooseNothingButton();

                context.player1.clickPrompt('Choose nothing');

                expect(context.superBattleDroid.getPower()).toBe(4);
                expect(context.superBattleDroid.getHp()).toBe(3);
                expect(context.tielnFighter.getPower()).toBe(2);
                expect(context.tielnFighter.getHp()).toBe(1);
            });
        });
    });
});
