describe('Clone Cohort', function() {
    integration(function(contextRef) {
        describe('Clone Cohort\'s ability', function() {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        groundArena: [{ card: 'battlefield-marine', upgrades: ['clone-cohort'] }]

                    },
                    player2: {
                        groundArena: ['consular-security-force']
                    }
                });
            });

            it('should give raid 2 and create a Clone Trooper token when defeated', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.battlefieldMarine);
                context.player1.clickCard(context.consularSecurityForce);

                // Raid 2
                expect(context.consularSecurityForce.damage).toBe(5);

                // Create Clone Trooper when attached unit is defeated
                expect(context.battlefieldMarine).toBeInZone('discard');
                const cloneTroopers = context.player1.findCardsByName('clone-trooper');
                expect(cloneTroopers.length).toBe(1);
                expect(cloneTroopers[0]).toBeInZone('groundArena');
                expect(cloneTroopers[0].exhausted).toBeTrue();
            });
        });
    });
});
