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
                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.ahsokaTano, context.r2d2IgnoringProtocol]);

                context.player1.clickCard(context.ahsokaTano);
                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.ahsokaTano, context.greenSquadronAwing]);
                expect(context.player1).toHavePassAbilityButton();

                context.player1.clickCard(context.battlefieldMarine);
                expect(context.player1).toBeAbleToSelectExactly([context.r2d2IgnoringProtocol, context.p2Base]);
                expect(context.ahsokaTano).toHaveExactUpgradeNames(['ahsokas-padawan-lightsaber']);
                expect(context.ahsokaTano.exhausted).toBe(false);

                context.player1.clickCard(context.p2Base);
                expect(context.battlefieldMarine.exhausted).toBe(true);
                expect(context.p2Base.damage).toBe(3);
                expect(context.player2).toBeActivePlayer();
            });

            it('does not initiates an attack when played on a unit that is not Ahsoka Tano', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.ahsokasPadawanLightsaber);
                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.ahsokaTano, context.r2d2IgnoringProtocol]);

                context.player1.clickCard(context.battlefieldMarine);
                expect(context.battlefieldMarine).toHaveExactUpgradeNames(['ahsokas-padawan-lightsaber']);
                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});
