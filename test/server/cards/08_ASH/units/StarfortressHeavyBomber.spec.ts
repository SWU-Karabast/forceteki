describe('Starfortress Heavy Bomber', function () {
    integration(function (contextRef) {
        describe('Starfortress Heavy Bomber\'s ability', function () {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['starfortress-heavy-bomber'],
                        groundArena: ['battlefield-marine', 'yoda#old-master'],
                        spaceArena: ['alliance-xwing', 'blue-leader#scarif-air-support'],
                    },
                    player2: {
                        groundArena: ['reinforcement-walker', 'kylo-ren#killing-the-past'],
                        spaceArena: ['tieln-fighter'],
                    }
                });
            });

            it('should deal 6 damage to a non-unique ground unit', function () {
                const { context } = contextRef;

                // Player 1 plays Starfortress Heavy Bomber and selects Reinforcement Walker as the target
                context.player1.clickCard(context.starfortressHeavyBomber);
                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.reinforcementWalker]);
                expect(context.player1).toHavePassAbilityButton();
                context.player1.clickCard(context.reinforcementWalker);

                expect(context.reinforcementWalker.damage).toBe(6);
                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});