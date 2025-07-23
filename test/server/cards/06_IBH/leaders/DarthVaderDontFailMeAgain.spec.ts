describe('Darth Vader - Don\'t Fail Me Again', function () {
    integration(function (contextRef) {
        describe('Leader side ability', function () {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'darth-vader#dont-fail-me-again',
                        resourceCount: 1
                    },
                    player2: {
                        base: { damage: 0 }
                    }
                });
            });

            it('should deal 1 damage to a base when activated', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.darthVaderDontFailMeAgain);
                expect(context.player1).toHavePrompt('Choose an ability');
                context.player1.clickPrompt('Deal 1 damage to a base');
                expect(context.player1).toBeAbleToSelectExactly([context.p1Base, context.p2Base]);
                context.player1.clickCard(context.p2Base);

                expect(context.p2Base.damage).toBe(1);
                expect(context.darthVaderDontFailMeAgain.exhausted).toBe(true);
                expect(context.player1.resourceCount).toBe(0);
            });
        });

        describe('Leader unit side ability', function () {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'darth-vader#dont-fail-me-again',
                        leaderInPlay: true
                    },
                    player2: {
                        base: { damage: 0 },
                        groundArena: ['wampa']
                    }
                });
            });

            it('should deal 2 damage to a base when attacking', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.darthVaderDontFailMeAgain);
                expect(context.player1).toHavePrompt('Choose an ability');
                context.player1.clickPrompt('Attack');
                expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.p2Base]);
                context.player1.clickCard(context.wampa);

                // After attack is declared, the on-attack ability should trigger
                expect(context.player1).toHavePrompt('Choose a base');
                context.player1.clickCard(context.p2Base);

                expect(context.p2Base.damage).toBe(2);
                
                // Complete the attack
                context.player2.clickPrompt('Done');
                expect(context.wampa.damage).toBe(context.darthVaderDontFailMeAgain.power);
                expect(context.darthVaderDontFailMeAgain.damage).toBe(context.wampa.power);
            });
        });
    });
});