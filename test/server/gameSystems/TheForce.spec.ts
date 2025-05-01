describe('The Force token', function () {
    integration(function(contextRef) {
        describe('The basics of the Force token', function () {
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

                const p1ForceToken = context.player1.findCardByName('the-force');
                const p2ForceToken = context.player2.findCardByName('the-force');

                // Ensure that the force tokens are created and out of play for both players
                expect(p1ForceToken).toBeInZone('outsideTheGame');
                expect(p2ForceToken).toBeInZone('outsideTheGame');
            });

            it('Does not get destoryed at the end of a round with the standar token cleanup', function () {
                const { context } = contextRef;

                const p1ForceToken = context.player1.findCardByName('the-force');
                const p2ForceToken = context.player2.findCardByName('the-force');

                // Move to the next round
                context.moveToNextActionPhase();

                // Ensure that the force tokens are still out of play for both players
                expect(p1ForceToken).toBeInZone('outsideTheGame');
                expect(p2ForceToken).toBeInZone('outsideTheGame');
            });

            it('Stays in its current zone across rounds', function () {
                const { context } = contextRef;

                const p1ForceToken = context.player1.findCardByName('the-force');
                const p2ForceToken = context.player2.findCardByName('the-force');

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

        describe('Test Suite integration', function () {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hasForceToken: true
                    }
                });
            });

            it('Can be set using test setup options', function () {
                const { context } = contextRef;

                expect(context.player1.hasTheForce).toBe(true);
                expect(context.player2.hasTheForce).toBe(false);
            });

            it('Can be modified using the player interaction wrapper', function () {
                const { context } = contextRef;

                context.player1.setHasTheForce(false);
                context.player2.setHasTheForce(true);

                expect(context.player1.hasTheForce).toBe(false);
                expect(context.player2.hasTheForce).toBe(true);
            });
        });
    });
});