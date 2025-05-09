describe('Grogu, Mysterious Child', function() {
    integration(function(contextRef) {
        describe('Grogu, Mysterious Child\'s ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: [{ card: 'grogu#mysterious-child' }, { card: 'wampa', damage: 3 }],
                    },
                    player2: {
                        groundArena: [{ card: 'atst', damage: 1 }]
                    },
                });
            });

            it('should heal up to 2 damage from a unit and deal that much damage to a unit', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.groguMysteriousChild);
                context.player1.clickPrompt('Heal up to 2 damage from a unit');
                expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.atst, context.grogu]);
                context.player1.setDistributeHealingPromptState(new Map([
                    [context.wampa, 2],
                ]));

                expect(context.player1).toHavePrompt('Deal that much damage to a unit');
                expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.atst, context.grogu]);
                context.player1.clickCard(context.atst);

                expect(context.wampa.damage).toBe(1);
                expect(context.atst.damage).toBe(3);
                expect(context.groguMysteriousChild.exhausted).toBe(true);
            });

            it('should heal 1 damage from a unit and deal that much damage to a unit', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.groguMysteriousChild);
                context.player1.clickPrompt('Heal up to 2 damage from a unit');
                expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.atst, context.grogu]);
                context.player1.setDistributeHealingPromptState(new Map([
                    [context.atst, 1],
                ]));

                expect(context.player1).toHavePrompt('Deal that much damage to a unit');
                context.player1.clickCard(context.wampa);

                expect(context.wampa.damage).toBe(4);
                expect(context.atst.damage).toBe(0);
                expect(context.groguMysteriousChild.exhausted).toBe(true);
            });

            it('should not heal damage from a unit and should not deal damage to a unit', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.groguMysteriousChild);
                context.player1.clickPrompt('Heal up to 2 damage from a unit');
                expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.atst, context.grogu]);
                context.player1.setDistributeHealingPromptState(new Map([
                    [context.grogu, 2],
                ]));

                expect(context.groguMysteriousChild.exhausted).toBe(true);
            });
        });
    });
});