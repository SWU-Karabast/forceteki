describe('Wanted Insurgents', function() {
    integration(function(contextRef) {
        describe('Wanted Insurgents\' Bounty ability', function() {
            it('should deal 2 damage to a unit', function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        groundArena: ['wanted-insurgents'],
                        spaceArena: ['green-squadron-awing']
                    },
                    player2: {
                        groundArena: ['wampa']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.wantedInsurgents);
                context.player1.clickCard(context.wampa);

                expect(context.player2).toBeAbleToSelectExactly([context.wampa, context.greenSquadronAwing]);
                expect(context.player2).toHavePassAbilityButton();

                context.player2.clickCard(context.greenSquadronAwing);
                expect(context.greenSquadronAwing.damage).toBe(2);
                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});
