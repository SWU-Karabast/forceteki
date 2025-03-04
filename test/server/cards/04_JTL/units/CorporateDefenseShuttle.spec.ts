
describe('Corporate Defense Shuttle', function() {
    integration(function(contextRef) {
        describe('Corporate Defense Shuttle', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['outflank'],
                        spaceArena: ['corporate-defense-shuttle'],
                        groundArena: ['atst'],
                        leader: 'darth-vader#dark-lord-of-the-sith'
                    }
                });
            });

            it('should not be able to declare an attack', function() {
                const { context } = contextRef;

                expect(context.player1).toBeAbleToSelectExactly([context.atst, context.darthVader, context.outflank]);
                expect(context.player1).toBeActivePlayer();
            });

            it('should not be able to declare an attack with an event', function() {
                const { context } = contextRef;

                context.player1.clickCard(context.outflank);
                expect(context.player1).toBeAbleToSelectExactly([context.atst]);

                context.player1.clickCard(context.atst);
                context.player1.clickCard(context.p2Base);
                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});