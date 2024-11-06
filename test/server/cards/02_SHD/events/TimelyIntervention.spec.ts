describe('Timely Intervention', function () {
    integration(function (contextRef) {
        describe('Timely Intervention\'s ability', function () {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        leader: 'hera-syndulla#spectre-two',
                        hand: ['timely-intervention', 'rebel-pathfinder', 'alliance-xwing'],
                        groundArena: ['battlefield-marine'],
                        resources: ['tech#source-of-insight', 'atst', 'atst', 'atst']
                    },
                    player2: {
                        groundArena: ['isb-agent'],
                    }
                });
            });

            it('should allow the player to play a unit from his hand, paying its cost, and give it ambush', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.timelyIntervention);
                expect(context.player1).toBeAbleToSelectExactly([context.rebelPathfinder, context.allianceXwing]);

                context.player1.clickCard(context.rebelPathfinder);
                expect(context.rebelPathfinder).toBeInLocation('ground arena');
                expect(context.player1.countExhaustedResources()).toBe(3);
                expect(context.player1).toHavePassAbilityPrompt('Ambush');

                context.player1.clickPrompt('Ambush');
                expect(context.rebelPathfinder.exhausted).toBe(true);
                expect(context.rebelPathfinder.damage).toBe(1);
                expect(context.isbAgent.damage).toBe(2);
            });
        });

        describe('Timely Intervention\'s ability', function () {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        leader: 'hera-syndulla#spectre-two',
                        hand: ['rebel-pathfinder', 'alliance-xwing'],
                        groundArena: ['battlefield-marine'],
                        resources: ['timely-intervention', 'tech#source-of-insight', 'atst', 'atst', 'atst']
                    },
                    player2: {
                        groundArena: ['isb-agent'],
                    }
                });
            });

            it('should allow the player to play a unit from his hand, paying its cost, and give it ambush (from smuggle)', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.timelyIntervention);
                expect(context.player1).toBeAbleToSelectExactly([context.rebelPathfinder, context.allianceXwing]);

                context.player1.clickCard(context.rebelPathfinder);
                expect(context.rebelPathfinder).toBeInLocation('ground arena');
                expect(context.player1.countExhaustedResources()).toBe(4);
                expect(context.player1).toHavePassAbilityPrompt('Ambush');

                context.player1.clickPrompt('Ambush');
                expect(context.rebelPathfinder.exhausted).toBe(true);
                expect(context.rebelPathfinder.damage).toBe(1);
                expect(context.isbAgent.damage).toBe(2);
            });
        });
    });
});
