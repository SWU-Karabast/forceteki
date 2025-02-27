describe('Armed to the teeth', function () {
    integration(function (contextRef) {
        describe('Armed to the teeth\'s ability', function () {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: [{ card: 'bokatan-kryze#fighting-for-mandalore', upgrades: ['armed-to-the-teeth'] }, 'freetown-backup'],
                        spaceArena: ['collections-starhopper'],
                    },
                    player2: {
                        groundArena: ['battlefield-marine']
                    }
                });
            });

            it('ground unit has 5 power and on attack gives other unit +2, which removes at end of phase', function () {
                const { context } = contextRef;

                // initial check
                expect(context.bokatanKryze.getPower()).toBe(5);
                expect(context.collectionsStarhopper.getPower()).toBe(2);

                // attack base and power up other unit
                context.player1.clickCard(context.bokatanKryze);
                context.player1.clickCard(context.p2Base);
                expect(context.player1).toBeAbleToSelectExactly([context.collectionsStarhopper, context.freetownBackup]);
                context.player1.clickCard(context.collectionsStarhopper);
                expect(context.collectionsStarhopper.getPower()).toBe(4);

                // end phase to drop power boost
                context.moveToNextActionPhase();
                expect(context.collectionsStarhopper.getPower()).toBe(2);
            });
        });
    });
});
