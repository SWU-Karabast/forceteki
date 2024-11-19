describe('Guild Target', function() {
    integration(function(contextRef) {
        describe('Guild Target\'s Bounty ability', function() {
            it('should deal 2 damage to a base if the attached unit is not unique', function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        groundArena: [{ card: 'battlefield-marine', upgrades: ['guild-target'] }, 'atst']
                    },
                    player2: {
                        groundArena: ['wampa']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.battlefieldMarine);
                context.player1.clickCard(context.wampa);

                expect(context.player2).toBeAbleToSelectExactly([context.p1Base, context.p2Base]);
                expect(context.player2).toHavePassAbilityButton();
                context.player2.clickCard(context.p1Base);
                expect(context.p1Base.damage).toBe(2);
                expect(context.player2).toBeActivePlayer();
            });

            it('should heal 3 damage to a base if the attached unit is unique', function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        groundArena: [{ card: 'colonel-yularen#isb-director', upgrades: ['guild-target'] }],
                    },
                    player2: {
                        groundArena: ['wampa']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.colonelYularen);
                context.player1.clickCard(context.wampa);

                context.player2.clickCard(context.p1Base);
                expect(context.p1Base.damage).toBe(3);
                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});
