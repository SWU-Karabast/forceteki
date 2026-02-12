describe('Mastery', function() {
    integration(function(contextRef) {
        describe('Mastery\'s ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['mastery'],
                        groundArena: ['rebel-pathfinder', 'yoda#old-master'],
                        spaceArena: ['cartel-spacer'],
                        leader: 'chewbacca#walking-carpet'
                    },
                    player2: {
                        groundArena: ['wampa', 'gungi#finding-himself'],
                    }
                });
            });

            it('should cost 1 resource less when played on a unique unit', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.mastery);

                expect(context.player1).toBeAbleToSelectExactly([context.rebelPathfinder, context.yoda, context.gungi, context.cartelSpacer, context.wampa]);

                context.player1.clickCard(context.yoda);

                expect(context.yoda).toHaveExactUpgradeNames(['mastery']);
                expect(context.player1.exhaustedResourceCount).toBe(3);
                expect(context.player2).toBeActivePlayer();
            });

            it('should not cost 1 resource less when played on a unique unit', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.mastery);
                context.player1.clickCard(context.cartelSpacer);

                expect(context.cartelSpacer).toHaveExactUpgradeNames(['mastery']);
                expect(context.player1.exhaustedResourceCount).toBe(4);
                expect(context.player2).toBeActivePlayer();
            });

            it('should work on enemy unique units as well', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.mastery);
                context.player1.clickCard(context.gungi);

                expect(context.gungi).toHaveExactUpgradeNames(['mastery']);
                expect(context.player1.exhaustedResourceCount).toBe(3);
                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});
