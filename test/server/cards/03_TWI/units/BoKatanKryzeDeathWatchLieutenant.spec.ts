describe('Bo-Katan Kryze, Death Watch Lieutenant', function () {
    integration(function (contextRef) {
        describe('Bo-Katan Kryze\'s ability', function () {
            it('should get +1/+0 as we control a trooper unit', function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        groundArena: ['bokatan-kryze#death-watch-lieutenant', 'battlefield-marine'],
                    },
                });

                const { context } = contextRef;

                context.player1.clickCard(context.bokatanKryze);
                expect(context.p2Base.damage).toBe(3);
            });

            it('should get saboteur and overwhelm as we control a mandalorian unit', function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        groundArena: ['bokatan-kryze#death-watch-lieutenant'],
                        spaceArena: ['disabling-fang-fighter']
                    },
                    player2: {
                        groundArena: ['echo-base-defender', 'jedha-agitator'],
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.bokatanKryze);
                context.player1.clickCard(context.jedhaAgitator);
                expect(context.p2Base.damage).toBe(1);
            });
        });
    });
});
