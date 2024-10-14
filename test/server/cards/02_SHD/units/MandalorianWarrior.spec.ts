describe('Mandalorian Warrior', function () {
    integration(function () {
        describe('Mandalorian Warrior\'s ability', function () {
            const { context } = contextRef;

            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['mandalorian-warrior'],
                        groundArena: ['protector-of-the-throne', 'battlefield-marine'],
                        leader: { card: 'sabine-wren#galvanized-revolutionary', deployed: true }
                    },
                    player2: {
                        groundArena: ['snowspeeder', 'clan-challengers']
                    }
                });
            });

            it('should give an experience to mandalorian unit', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.mandalorianWarrior);
                expect(context.player1).toBeAbleToSelectExactly([context.protectorOfTheThrone, context.sabineWren, context.clanChallengers]);
                expect(context.player1).toHavePassAbilityButton();
                context.player1.clickCard(context.protectorOfTheThrone);
                expect(context.protectorOfTheThrone.isUpgraded()).toBeTrue();
            });
        });
    });
});
