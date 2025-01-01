describe('Droid Cohort', function() {
    integration(function(contextRef) {
        describe('Droid Cohort\'s ability', function() {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        groundArena: ['coruscant-guard']

                    },
                    player2: {
                        groundArena: [{ card: 'b1-security-team', upgrades: ['droid-cohort'] }]
                    }
                });
            });

            it('should create a Battle Droid token when defeated', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.coruscantGuard);
                context.player1.clickCard(context.b1SecurityTeam);

                const battleDroids = context.player2.findCardsByName('battle-droid');
                expect(battleDroids.length).toBe(1);
                expect(battleDroids).toAllBeInZone('groundArena', context.player2);
                expect(battleDroids.every((battleDroid) => battleDroid.exhausted)).toBeTrue();
            });
        });
    });
});
