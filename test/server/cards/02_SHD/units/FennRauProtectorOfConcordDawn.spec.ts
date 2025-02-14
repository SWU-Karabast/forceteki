describe('Fenn Rau Protector of Concord Dawn\'s ability', function () {
    integration(function (contextRef) {
        it('should allow to play an upgrade for 2 less', function () {
            contextRef.setupTest({
                phase: 'action',
                player1: {
                    hand: ['fenn-rau#protector-of-concord-dawn', 'academy-training', 'jedi-lightsaber', 'wampa'],
                    groundArena: ['specforce-soldier'],
                    leader: 'luke-skywalker#faithful-friend',
                    base: 'echo-base',
                    resources: 9
                },
                player2: {
                    groundArena: ['consular-security-force'],
                    spaceArena: ['tie-advanced']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.fennRau);
            expect(context.player1).toBeAbleToSelectExactly([
                context.academyTraining,
                context.jediLightsaber,
            ]);
            expect(context.player1).toHaveChooseNoTargetButton();
            context.player1.clickCard(context.jediLightsaber);
            context.player1.clickCard(context.fennRau);
            expect(context.player1.readyResourceCount).toBe(2);
            expect(context.player1).toBeAbleToSelectExactly([
                context.consularSecurityForce,
                context.tieAdvanced,
            ]);
            context.player1.clickCard(context.consularSecurityForce);
            expect(context.consularSecurityForce.getPower()).toBe(1);
            expect(context.consularSecurityForce.getHp()).toBe(5);
            expect(context.player2).toBeActivePlayer();
            context.player2.passAction();

            // Academy Training cost is not reduced
            // Academy Training does not trigger the -2/-2 Fenn Rau's ability
            // Consular Security Force remains impacted by -2/-2
            context.player1.clickCard(context.academyTraining);
            context.player1.clickCard(context.specforceSoldier);
            expect(context.player1.readyResourceCount).toBe(0);
            expect(context.consularSecurityForce.getPower()).toBe(1);
            expect(context.consularSecurityForce.getHp()).toBe(5);
            context.moveToNextActionPhase();

            // -2/-2 stops at the end of the phase
            expect(context.consularSecurityForce.getPower()).toBe(3);
            expect(context.consularSecurityForce.getHp()).toBe(7);
        });

        it('should not bug if there is no enemy unit', function () {
            contextRef.setupTest({
                phase: 'action',
                player1: {
                    hand: ['academy-training', 'survivors-gauntlet'],
                    groundArena: [{ card: 'specforce-soldier', upgrades: ['jedi-lightsaber'] }, 'fenn-rau#protector-of-concord-dawn'],
                },
                player2: {
                    hand: ['consular-security-force'],
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.academyTraining);
            context.player1.clickCard(context.fennRau);
            expect(context.player2).toBeActivePlayer();

            // It should not trigger -2/-2 if we move an upgrade
            context.player2.clickCard(context.consularSecurityForce);
            context.player1.clickCard(context.survivorsGauntlet);
            context.player1.clickCard(context.jediLightsaber);
            context.player1.clickCard(context.fennRau);
            expect(context.player2).toBeActivePlayer();
        });
    });
});
