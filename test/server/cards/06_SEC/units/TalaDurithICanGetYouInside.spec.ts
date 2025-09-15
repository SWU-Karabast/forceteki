describe('Tala Durith, I Can Get You Inside', function() {
    integration(function(contextRef) {
        describe('Tala Durith\'s ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['battlefield-marine'],
                        groundArena: ['tala-durith#i-can-get-you-inside'],
                    },
                    player2: {
                        groundArena: ['rebel-pathfinder'],
                    }
                });
            });

            it('should give other friendly units hidden', function () {
                const { context } = contextRef;
                const { player1, player2 } = context;

                player1.clickCard(context.battlefieldMarine);

                expect(context.battlefieldMarine.hasSomeKeyword('hidden')).toBeTrue();
                expect(context.talaDurithICanGetYouInside.hasSomeKeyword('hidden')).toBeFalse();
                expect(context.rebelPathfinder.hasSomeKeyword('hidden')).toBeFalse();

                // check current hidden
                player2.clickCard(context.rebelPathfinder);
                expect(player2).toBeAbleToSelectExactly([context.talaDurithICanGetYouInside, context.p1Base]);
                player2.clickCard(context.p1Base);
            });
        });
    });
});