describe('Bodhi Rook, Creating a Diversion', function() {
    integration(function(contextRef) {
        describe('Bodhi Rook\'s On Attack ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['bodhi-rook#creating-a-diversion', 'battlefield-marine', 'rebel-pathfinder', 'atst'],
                        spaceArena: ['alliance-xwing']
                    },
                    player2: {
                        groundArena: ['wampa'],
                        spaceArena: ['green-squadron-awing']
                    }
                });
            });

            it('should optionally give a friendly Rebel unit Sentinel for this phase', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.bodhiRook);
                context.player1.clickCard(context.p2Base);

                expect(context.player1).toBeAbleToSelectExactly([context.bodhiRook, context.battlefieldMarine, context.rebelPathfinder, context.allianceXwing]);
                expect(context.player1).toHavePassAbilityButton();

                context.player1.clickCard(context.rebelPathfinder);

                expect(context.player2).toBeActivePlayer();

                context.player2.clickCard(context.wampa);
                expect(context.player2).toBeAbleToSelectExactly([context.rebelPathfinder]);
                context.player2.clickCard(context.rebelPathfinder);
            });

            it('should have Sentinel expire at end of phase', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.bodhiRook);
                context.player1.clickCard(context.p2Base);

                context.player1.clickCard(context.rebelPathfinder);

                context.moveToNextActionPhase();

                context.player1.passAction();
                context.player2.clickCard(context.wampa);
                expect(context.player2).toBeAbleToSelectExactly([context.rebelPathfinder, context.atst, context.battlefieldMarine, context.bodhiRook, context.p1Base]);
                context.player2.clickCard(context.p1Base);

                expect(context.player1).toBeActivePlayer();
            });
        });
    });
});
