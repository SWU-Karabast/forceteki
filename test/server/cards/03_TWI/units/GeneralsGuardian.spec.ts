describe('General\'s Guardian', function() {
    integration(function(contextRef) {
        describe('General\'s Guardian\'s ability', function() {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        groundArena: ['coruscant-guard']

                    },
                    player2: {
                        groundArena: ['generals-guardian']
                    }
                });
            });

            it('should create a Battle Droid token when attacked', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.coruscantGuard);
                context.player1.clickCard(context.generalsGuardian);

                const battleDroids = context.player2.findCardsByName('battle-droid');
                expect(battleDroids.length).toBe(1);
                expect(battleDroids).toAllBeInZone('groundArena');
                expect(battleDroids.every((battleDroid) => battleDroid.exhausted)).toBeTrue();
            });
        });
    });
});
