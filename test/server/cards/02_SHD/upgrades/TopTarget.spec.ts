describe('Top Target', function() {
    integration(function(contextRef) {
        describe('Top Target\'s Bounty ability', function() {
            it('should heal 4 damage from a base if the attached unit is not unique', function () {
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

            it('should heal 6 damage from a base if the attached unit is unique', function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        groundArena: [{ card: 'colonel-yularen#isb-director', upgrades: ['top-target'] }],
                        base: { card: 'jedha-city', damage: 10 }
                    },
                    player2: {
                        groundArena: ['wampa']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.colonelYularen);
                context.player1.clickCard(context.wampa);

                expect(context.player2).toBeAbleToSelectExactly([context.p1Base, context.p2Base]);
                expect(context.player2).toHavePassAbilityButton();
                context.player2.clickCard(context.p1Base);
                expect(context.p1Base.damage).toBe(4);
                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});
