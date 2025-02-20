describe('Timely Intervention', function () {
    integration(function (contextRef) {
        describe('Timely Intervention\'s ability', function () {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'hera-syndulla#spectre-two',
                        hand: ['timely-intervention', 'rebel-pathfinder', 'alliance-xwing'],
                        groundArena: ['battlefield-marine'],
                        resources: ['tech#source-of-insight', 'atst', 'atst', 'atst']
                    },
                    player2: {
                        groundArena: ['isb-agent'],
                    },

                    // IMPORTANT: this is here for backwards compatibility of older tests, don't use in new code
                    autoSingleTarget: true
                });
            });

            it('should allow the player to play a unit from his hand, paying its cost, and give it ambush', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.timelyIntervention);
                expect(context.player1).toBeAbleToSelectExactly([context.rebelPathfinder, context.allianceXwing]);

                context.player1.clickCard(context.rebelPathfinder);
                expect(context.rebelPathfinder).toBeInZone('groundArena');
                expect(context.player1.exhaustedResourceCount).toBe(3);
                expect(context.player1).toHavePassAbilityPrompt('Ambush');

                context.player1.clickPrompt('Ambush');
                expect(context.rebelPathfinder.exhausted).toBe(true);
                expect(context.rebelPathfinder.damage).toBe(1);
                expect(context.isbAgent.damage).toBe(2);
            });
        });

        describe('Timely Intervention\'s ability', function () {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'hera-syndulla#spectre-two',
                        hand: ['rebel-pathfinder', 'alliance-xwing'],
                        groundArena: ['battlefield-marine'],
                        resources: ['timely-intervention', 'tech#source-of-insight', 'atst', 'atst', 'atst']
                    },
                    player2: {
                        groundArena: ['isb-agent'],
                    },

                    // IMPORTANT: this is here for backwards compatibility of older tests, don't use in new code
                    autoSingleTarget: true
                });
            });

            it('should allow the player to play a unit from his hand, paying its cost, and give it ambush (from smuggle)', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.timelyIntervention);
                expect(context.player1).toBeAbleToSelectExactly([context.rebelPathfinder, context.allianceXwing]);

                context.player1.clickCard(context.rebelPathfinder);
                expect(context.rebelPathfinder).toBeInZone('groundArena');
                expect(context.player1.exhaustedResourceCount).toBe(4);
                expect(context.player1).toHavePassAbilityPrompt('Ambush');

                context.player1.clickPrompt('Ambush');
                expect(context.rebelPathfinder.exhausted).toBe(true);
                expect(context.rebelPathfinder.damage).toBe(1);
                expect(context.isbAgent.damage).toBe(2);
            });
        });
    });
});
