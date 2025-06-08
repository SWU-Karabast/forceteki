
describe('Kylo Ren\'s Lightsaber', () => {
    integration(function (contextRef) {
        describe('Kylo Ren\'s Lightsaber\'s constant ability', function () {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: [
                            'kylo-rens-lightsaber',
                            'atat-suppressor'
                        ],
                        groundArena: [
                            'kylo-ren#i-know-your-story',
                            'hylobon-enforcer'
                        ],
                        spaceArena: ['inferno-four#unforgetting'],
                    },
                    player2: {
                        hand: ['no-good-to-me-dead'],
                        groundArena: ['battlefield-marine']
                    }
                });
            });

            it('if attached unit is a Force unit, it cannot be exhausted by enemy card abilities', function () {
                const { context } = contextRef;

                // Play Kylo Ren's Lightsaber
                context.player1.clickCard(context.kyloRensLightsaber);

                // It can only target non-Vehicle units (including enemy units)
                expect(context.player1).toBeAbleToSelectExactly([
                    context.kyloRen,
                    context.hylobonEnforcer,
                    context.battlefieldMarine
                ]);
                context.player1.clickCard(context.kyloRen);

                // Player 2 plays No Good to Me Dead to attempt to exhaust Kylo Ren
                context.player2.clickCard(context.noGoodToMeDead);
                context.player2.clickCard(context.kyloRen);

                expect(context.kyloRen.exhausted).toBeFalse();

                // Player 1 attacks with Kylo Ren
                context.player1.clickCard(context.kyloRen);
                context.player1.clickCard(context.p2Base);

                // Kylo can be exhausted by attacking
                expect(context.kyloRen.exhausted).toBeTrue();

                context.moveToNextActionPhase();

                // Kylo Ren can be exhausted by friendly card abilities
                context.player1.clickCard(context.atatSuppressor); // Exhaust all ground units

                expect(context.kyloRen.exhausted).toBeTrue();
            });

            it('if attached unit is not a Force unit, it can be exhausted by enemy card abilities', function () {
                const { context } = contextRef;

                // Play Kylo Ren's Lightsaber
                context.player1.clickCard(context.kyloRensLightsaber);

                // It can only target non-Vehicle units (including enemy units)
                expect(context.player1).toBeAbleToSelectExactly([
                    context.hylobonEnforcer,
                    context.battlefieldMarine
                ]);
                context.player1.clickCard(context.hylobonEnforcer);

                // Player 2 plays No Good to Me Dead to exhaust Hylobon Enforcer
                context.player2.clickCard(context.noGoodToMeDead);
                context.player2.clickCard(context.hylobonEnforcer);

                expect(context.hylobonEnforcer.exhausted).toBeTrue();
            });
        });
    });
});