describe('Hevy Staunch Martyr', function () {
    integration(function (contextRef) {
        describe('Hevy Staunch Martyr\'s ability', function () {
            it('should attack for 6 with raid 2 on coordinate', function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        groundArena: ['specforce-soldier', 'luke-skywalker#jedi-knight', 'hevy#staunch-martyr'],
                    },
                    player2: {
                        groundArena: ['consular-security-force', 'wampa', 'fleet-lieutenant'],
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.hevy);
                context.player1.clickCard(context.consularSecurityForce);
                expect(context.consularSecurityForce.damage).toBe(6);
                expect(context.hevy.damage).toBe(3);

                // When defeated, deal 1 damage to each enemy ground unit
                context.player2.clickCard(context.wampa);
                context.player2.clickCard(context.hevy);
                expect(context.hevy).toBeInZone('discard');
                expect(context.wampa).toBeInZone('discard');
                expect(context.consularSecurityForce).toBeInZone('discard');
                expect(context.fleetLieutenant.damage).toBe(1);
            });
        });
    });
});
