describe('Grey squadron Y-Wing', function() {
    integration(function(contextRef) {
        describe('Grey squadron Y-Wing\'s Ability', function() {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        spaceArena: ['grey-squadron-ywing'],
                        groundArena: ['wampa'],
                    },
                    player2: {
                        groundArena: ['battlefield-marine'],
                        spaceArena: ['cartel-spacer'],
                        base: { card: 'echo-base', damage: 0 }

                    }
                });
            });

            it('should deal damage to either a base or a unit (depending on opponent choice)', function () {
                const { context } = contextRef;
                context.player1.clickCard(context.greySquadronYwing);
                context.player1.clickCard(context.cartelSpacer);
                expect(context.player2).toHavePrompt('Choose a card');
                expect(context.player2).toBeAbleToSelectExactly([context.cartelSpacer, context.battlefieldMarine, context.echoBase]);
                context.player2.clickCard(context.echoBase);
                expect(context.echoBase.damage).toEqual(2);
            });
        });
    });
});
