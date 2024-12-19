describe('General\'s Guardian', function() {
    integration(function(contextRef) {
        describe('General\'s Guardian\'s ability', function() {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        groundArena: ['coruscant-guard', 'advanced-recon-commando']

                    },
                    player2: {
                        groundArena: ['generals-guardian', 'droid-commando']
                    }
                });
            });

            it('should create a Battle Droid token when attacked', function () {
                const { context } = contextRef;

                // Should create a Battle Droid token when General's Guardian is attacked
                context.player1.clickCard(context.coruscantGuard);
                context.player1.clickCard(context.generalsGuardian);

                let battleDroids = context.player2.findCardsByName('battle-droid');
                expect(battleDroids.length).toBe(1);
                expect(battleDroids).toAllBeInZone('groundArena', context.player2);
                expect(battleDroids.every((battleDroid) => battleDroid.exhausted)).toBeTrue();

                context.moveToNextActionPhase();

                // Should not create a Battle Droid token when any another unit is attacked
                context.player1.clickCard(context.advancedReconCommando);
                context.player1.clickCard(context.droidCommando);

                battleDroids = context.player2.findCardsByName('battle-droid');
                expect(battleDroids.length).toBe(1);
            });
        });
    });
});
