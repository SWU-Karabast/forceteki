describe('Grogu, Irresistible', function() {
    integration(function(contextRef) {
        describe('Grogu\'s ability', function() {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        groundArena: ['grogu#irresistible', 'wampa'],
                    },
                    player2: {
                        groundArena: [
                            { card: 'frontier-atrt', exhausted: true },
                            'enfys-nest#marauder'
                        ],
                    }
                });
            });

            it('should exhaust a selected enemy unit', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.grogu);
                context.player1.clickPrompt('Exhaust an enemy unit');

                // can target opponent's units only
                expect(context.player1).toBeAbleToSelectExactly([context.frontierAtrt, context.enfysNest]);

                context.player1.clickCard(context.enfysNest);
                expect(context.grogu.exhausted).toBe(true);
                expect(context.enfysNest.exhausted).toBe(true);

                context.player2.passAction();

                // this is a general test of the exhaustSelf cost mechanic, don't need to repeat it for other cards that have an exhaustSelf cost
                expect(context.grogu).not.toHaveAvailableActionWhenClickedBy(context.player1);
            });
        });

        describe('Grogu\'s ability', function() {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        groundArena: ['grogu#irresistible'],
                    },
                    player2: {
                    }
                });
            });

            it('should activate with no targets', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.grogu);
                expect(context.player1).toHaveEnabledPromptButton('Attack');
                expect(context.player1).toHaveEnabledPromptButton('Exhaust an enemy unit');
                context.player1.clickPrompt('Exhaust an enemy unit');
                expect(context.grogu.exhausted).toBe(true);
            });
        });
    });
});
