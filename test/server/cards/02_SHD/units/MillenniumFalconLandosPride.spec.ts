describe('Millennium Falcon, Landos Pride', function() {
    integration(function(contextRef) {
        describe('Millennium Falcon\'s constant ability', function() {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['millennium-falcon#landos-pride'],
                        groundArena: ['wampa'],
                    },
                    player2: {
                        spaceArena: ['survivors-gauntlet']
                    }
                });
            });

            it('should give it Ambush if it is played from hand', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.millenniumFalcon);
                expect(context.player1).toHavePassAbilityPrompt('Ambush');
                context.player1.clickPrompt('Ambush');

                context.player1.clickCard(context.survivorsGauntlet);
                expect(context.survivorsGauntlet.damage).toBe(5);
                expect(context.millenniumFalcon.damage).toBe(4);
            });
        });
    });
});
