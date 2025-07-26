describe('Target The Main Generator', function() {
    integration(function(contextRef) {
        describe('Target The Main Generator\'s ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['target-the-main-generator'],
                        groundArena: ['wampa']
                    },
                    player2: {
                        groundArena: ['atst']
                    }
                });
            });

            it('can deal 2 damage to a friendly base', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.targetTheMainGenerator);
                expect(context.player1).toBeAbleToSelectExactly([context.p1Base, context.p2Base]);

                context.player1.clickCard(context.p1Base);
                expect(context.p1Base.damage).toBe(2);
            });

            it('can deal 2 damage to an enemy base', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.targetTheMainGenerator);
                expect(context.player1).toBeAbleToSelectExactly([context.p1Base, context.p2Base]);

                context.player1.clickCard(context.p2Base);
                expect(context.p2Base.damage).toBe(2);
            });
        });
    });
});