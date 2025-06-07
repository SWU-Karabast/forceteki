describe('Grand Inquisitor, Youre Right to Be Afraid', function() {
    integration(function(contextRef) {
        describe('Grand Inquisitor\'s ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['seventh-sister#implacable-inquisitor'],
                        groundArena: ['grand-inquisitor#youre-right-to-be-afraid'],
                    },
                    player2: {
                        groundArena: ['rebel-pathfinder'],
                        hand: ['battlefield-marine']
                    }
                });
            });

            it('should give seventh sister hidden', function () {
                const { context } = contextRef;
                const { player1, player2 } = context;

                player1.clickCard(context.seventhSister);

                expect(context.seventhSister.hasSomeKeyword('hidden')).toBeTrue();

                // check current hidden
                player2.clickCard(context.rebelPathfinder);
                expect(player2).toBeAbleToSelectExactly([context.grandInquisitorYoureRightToBeAfraid, context.p1Base]);
                player2.clickCard(context.p1Base);
            });
        });
    });
});