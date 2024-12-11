describe('Bo-Katan Kryze, Death Watch Lieutenant', function () {
    integration(function (contextRef) {
        describe('Bo-Katan Kryze\'s ability', function () {
            it('should get +1/+0 as we control a trooper unit', function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        groundArena: ['bokatan-kryze#death-watch-lieutenant', 'battlefield-marine'],
                    },
                    player2: {
                        hand: ['rivals-fall'],
                    },

                    // IMPORTANT: this is here for backwards compatibility of older tests, don't use in new code
                    autoSingleTarget: true
                });

                const { context } = contextRef;

                context.player1.clickCard(context.bokatanKryze);
                expect(context.p2Base.damage).toBe(3);
                expect(context.bokatanKryze.getPower()).toBe(3);

                context.player2.clickCard(context.rivalsFall);
                context.player2.clickCard(context.battlefieldMarine);
                expect(context.bokatanKryze.getPower()).toBe(2);
            });

            it('should get saboteur and overwhelm as we control a mandalorian unit', function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        groundArena: ['bokatan-kryze#death-watch-lieutenant'],
                        spaceArena: ['disabling-fang-fighter']
                    },
                    player2: {
                        hand: ['rivals-fall'],
                        groundArena: ['echo-base-defender', 'jedha-agitator'],
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.bokatanKryze);
                context.player1.clickCard(context.jedhaAgitator);
                expect(context.p2Base.damage).toBe(1);

                context.bokatanKryze.exhausted = false;

                // kill other mandalorian
                context.player2.clickCard(context.rivalsFall);
                context.player2.clickCard(context.disablingFangFighter);

                // bo katan loose saboteur & overwhelm, echo base defender should be attack automatically
                context.player1.clickCard(context.bokatanKryze);
                expect(context.player2).toBeActivePlayer();
                expect(context.echoBaseDefender.damage).toBe(2);
            });
        });
    });
});
