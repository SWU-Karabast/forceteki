describe('The Force token', function () {
    integration(function(contextRef) {
        beforeEach(function () {
            return contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    base: 'shadowed-undercity',
                    groundArena: [
                        'guardian-of-the-whills'
                    ]
                },
                player2: {
                    base: 'jedi-temple',
                }
            });
        });

        it('Is initialized for each player at the start of the game', function () {
            const { context } = contextRef;

            const p1ForceToken = context.player1.findCardByName('force');
            const p2ForceToken = context.player2.findCardByName('force');

            // Ensure that the force tokens are created and out of play for both players
            expect(p1ForceToken).toBeInZone('outsideTheGame');
            expect(p2ForceToken).toBeInZone('outsideTheGame');
        });

        it('Does not get destoryed at the end of a round with the standar token cleanup', function () {
            const { context } = contextRef;

            const p1ForceToken = context.player1.findCardByName('force');
            const p2ForceToken = context.player2.findCardByName('force');

            // Move to the next round
            context.moveToNextActionPhase();

            // Ensure that the force tokens are still out of play for both players
            expect(p1ForceToken).toBeInZone('outsideTheGame');
            expect(p2ForceToken).toBeInZone('outsideTheGame');
        });

        it('Stays in its current zone across rounds', function () {
            const { context } = contextRef;

            const p1ForceToken = context.player1.findCardByName('force');
            const p2ForceToken = context.player2.findCardByName('force');

            // Attack with a Force unit to gain The Force
            context.player1.clickCard(context.guardianOfTheWhills);
            context.player1.clickCard(context.p2Base);

            // Ensure Force tokens are in the correct zone
            expect(p1ForceToken).toBeInZone('base');
            expect(p2ForceToken).toBeInZone('outsideTheGame');

            // Move to the next round
            context.moveToNextActionPhase();

            // Ensure that the force tokens are still in the correct zone
            expect(p1ForceToken).toBeInZone('base');
            expect(p2ForceToken).toBeInZone('outsideTheGame');
        });
    });
});