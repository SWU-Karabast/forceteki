describe('Obi Wan\'s Aethersprite, This Is Why I Hate Flying', function () {
    integration(function (contextRef) {
        it('Obi Wan\'s Aethersprite, This Is Why I Hate Flying\'s ability should deal 1 damage to itself and deal 2 damage to another space unit', function () {
            contextRef.setupTest({
                phase: 'action',
                player1: {
                    hand: ['obiwans-aethersprite#this-is-why-i-hate-flying'],
                    spaceArena: ['corellian-freighter'],
                    groundArena: ['battlefield-marine']
                },
                player2: {
                    spaceArena: ['green-squadron-awing', 'tieln-fighter'],
                }
            });

            const { context } = contextRef;

            // When played ability
            context.player1.clickCard(context.obiwansAetherspriteThisIsWhyIHateFlying);
            expect(context.player1).toHavePassAbilityPrompt('Deal 1 damage to this unit');
            context.player1.clickPrompt('Deal 1 damage to this unit');
            expect(context.player1).toBeAbleToSelectExactly([context.greenSquadronAwing, context.tielnFighter, context.corellianFreighter]);
            context.player1.clickCard(context.greenSquadronAwing);

            expect(context.obiwansAetherspriteThisIsWhyIHateFlying.damage).toBe(1);
            expect(context.greenSquadronAwing.damage).toBe(2);

            // On attack ability
            context.obiwansAetherspriteThisIsWhyIHateFlying.exhausted = false;
            context.player2.passAction();
            context.player1.clickCard(context.obiwansAetherspriteThisIsWhyIHateFlying);
            context.player1.clickCard(context.p2Base);

            expect(context.player1).toHavePassAbilityPrompt('Deal 1 damage to this unit');
            context.player1.clickPrompt('Deal 1 damage to this unit');
            expect(context.player1).toBeAbleToSelectExactly([context.greenSquadronAwing, context.tielnFighter, context.corellianFreighter]);
            context.player1.clickCard(context.corellianFreighter);

            expect(context.obiwansAetherspriteThisIsWhyIHateFlying.damage).toBe(2);
            expect(context.corellianFreighter.damage).toBe(2);
        });
    });
});
