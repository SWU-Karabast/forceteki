describe('Strafing Gunship', function () {
    integration(function (contextRef) {
        describe('Strafing Gunship\'s ability', function () {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        spaceArena: ['strafing-gunship'],
                    },
                    player2: {
                        groundArena: ['consular-security-force'],
                        spaceArena: ['pirated-starfighter']
                    }
                });
            });

            it('should attack ground and space units, if attacking a ground unit then defender gets -2/0', function () {
                const { context } = contextRef;

                const reset = () => {
                    context.strafingGunship.damage = 0;
                    context.strafingGunship.exhausted = false;
                    context.player2.passAction();
                };

                context.player1.clickCard(context.strafingGunship);
                expect(context.player1).toBeAbleToSelectExactly([context.consularSecurityForce, context.piratedStarfighter, context.p2Base]);

                // attack a space unit : no -2/-0 apply
                context.player1.clickCard(context.piratedStarfighter);
                expect(context.player2).toBeActivePlayer();
                expect(context.piratedStarfighter.damage).toBe(3);
                expect(context.strafingGunship.damage).toBe(2);

                reset();

                context.player1.clickCard(context.strafingGunship);
                expect(context.player1).toBeAbleToSelectExactly([context.consularSecurityForce, context.piratedStarfighter, context.p2Base]);

                // attack a ground unit : defender get -2/-0 for this attack
                context.player1.clickCard(context.consularSecurityForce);
                expect(context.player2).toBeActivePlayer();
                expect(context.consularSecurityForce.damage).toBe(3);
                expect(context.strafingGunship.damage).toBe(1);
                expect(context.consularSecurityForce.getPower()).toBe(3);
            });

            // tests with sentinel is handled by Sentinel.spec.ts
        });
    });
});
