describe('SpecForce Soldier', function () {
    integration(function (contextRef) {
        describe('SpecForce Soldier\'s ability', function () {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['specforce-soldier'],
                        groundArena: ['wampa', 'battlefield-marine'],
                    },
                    player2: {
                        groundArena: ['cloud-city-wing-guard']
                    }
                });
            });

            it('should cause a unit to lose sentinel for the phase', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.specforceSoldier);
                expect(context.player1).toBeAbleToSelectExactly([context.specforceSoldier, context.wampa, context.battlefieldMarine, context.cloudCityWingGuard]);
                context.player1.clickCard(context.cloudCityWingGuard);

                context.player2.passAction();

                context.player1.clickCard(context.battlefieldMarine);
                expect(context.player1).toBeAbleToSelectExactly([context.cloudCityWingGuard, context.p2Base]);
                context.player1.clickCard(context.p2Base);

                context.moveToNextActionPhase();

                // next round, sentinel should be back
                context.player1.clickCard(context.battlefieldMarine);
                // attack automatically targets wing guard due to sentinel
                expect(context.cloudCityWingGuard.damage).toBe(3);
                expect(context.battlefieldMarine.damage).toBe(2);
                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});
