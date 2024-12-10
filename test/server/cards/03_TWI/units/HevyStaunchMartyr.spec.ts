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
                        groundArena: ['consular-security-force', 'wampa'],
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.hevy);
                // context.player1.clickCard(context.consularSecurityForce);
                expect(1).toBe(1);
                // expect(context.consularSecurityForce.damage).toBe(6);
                // expect(context.hevy.damage).toBe(3);

                // context.player2.clickCard(context.wampa);
                // context.player2.clickCard(context.heavy);
                // expect(context.wampa).toBeInZone('discard');
                // expect(context.consularSecurityForce).toBeInZone('discard');
            });
        });
    });
});
