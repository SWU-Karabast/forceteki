describe('Ahsoka\'s Padawan Lightsaber', function() {
    integration(function(contextRef) {
        describe('Ahsoka\'s Padawan Lightsaber\'s ability', function() {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['ahsokas-padawan-lightsaber'],
                        groundArena: ['battlefield-marine', 'ahsoka-tano#always-ready-for-trouble'],
                        spaceArena: ['green-squadron-awing']
                    },
                    player2: {
                        groundArena: ['r2d2#ignoring-protocol']
                    }
                });
            });

            it('initiates an attack when played on Ahsoka Tano', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.ahsokasPadawanLightsaber);
                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.ahsokaTanoAlwaysReadyForTrouble, context.r2d2IgnoringProtocol]);

                context.player1.clickCard(context.ahsokaTanoAlwaysReadyForTrouble);
                expect(context.player1).toHavePassAbilityPrompt('Attack with Ahsoka Tano');

                context.player1.clickPrompt('Attack with Ahsoka Tano');
                context.player1.clickCard(context.r2d2IgnoringProtocol);
                expect(context.ahsokaTanoAlwaysReadyForTrouble).toHaveExactUpgradeNames(['ahsokas-padawan-lightsaber']);
                expect(context.ahsokaTanoAlwaysReadyForTrouble.exhausted).toBe(true);
                expect(context.r2d2IgnoringProtocol).toBeInZone('discard');
                expect(context.player2).toBeActivePlayer();
            });

            it('initiates an attack when played on Ahsoka Tano but player selects not to attack', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.ahsokasPadawanLightsaber);
                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.ahsokaTanoAlwaysReadyForTrouble, context.r2d2IgnoringProtocol]);

                context.player1.clickCard(context.ahsokaTanoAlwaysReadyForTrouble);
                expect(context.player1).toHavePassAbilityPrompt('Attack with Ahsoka Tano');

                context.player1.passAction();
                expect(context.ahsokaTanoAlwaysReadyForTrouble).toHaveExactUpgradeNames(['ahsokas-padawan-lightsaber']);
                expect(context.ahsokaTanoAlwaysReadyForTrouble.exhausted).toBe(false);
                expect(context.player2).toBeActivePlayer();
            });

            it('does not initiates an attack when played on a unit that is not Ahsoka Tano', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.ahsokasPadawanLightsaber);
                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.ahsokaTanoAlwaysReadyForTrouble, context.r2d2IgnoringProtocol]);

                context.player1.clickCard(context.battlefieldMarine);
                expect(context.battlefieldMarine).toHaveExactUpgradeNames(['ahsokas-padawan-lightsaber']);
                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});
