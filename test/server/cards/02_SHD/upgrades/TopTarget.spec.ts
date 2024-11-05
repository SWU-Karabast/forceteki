describe('Top Target', function() {
    integration(function(contextRef) {
        describe('Top Target\'s Bounty ability', function() {
            it('should ready 2 resources', function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        groundArena: [{ card: 'battlefield-marine', upgrades: ['top-target'] }]
                    },
                    player2: {
                        groundArena: ['wampa'],
                        base: { card: 'jedha-city', damage: 10 }
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.battlefieldMarine);
                context.player1.clickCard(context.wampa);

                expect(context.player2).toBeAbleToSelectExactly([context.p1Base, context.p2Base]);
                expect(context.player2).toHavePassAbilityButton();
                context.player2.clickCard(context.p2Base);
                expect(context.p2Base.damage).toBe(6);
                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});
