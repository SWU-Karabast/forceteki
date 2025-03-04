describe('Shoot Down', function () {
    integration(function (contextRef) {
        describe('Shoot Down\'s ability', function () {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['shoot-down'],
                        spaceArena: ['alliance-xwing'],
                        groundArena: ['battlefield-marine']
                    },
                    player2: {
                        spaceArena: ['tieln-fighter', 'system-patrol-craft'],
                        groundArena: ['atst'],
                    }
                });
            });

            it('should defeat a space unit and deal damage to a base', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.shootDown);

                expect(context.player1).toBeAbleToSelectExactly([context.allianceXwing, context.tielnFighter, context.systemPatrolCraft]);
                context.player1.clickCard(context.tielnFighter);

                expect(context.tielnFighter).toBeInZone('discard');
                expect(context.player1).toHavePassAbilityPrompt('Deal 2 damage to a base');
                context.player1.clickPrompt('Trigger');
                expect(context.player1).toBeAbleToSelectExactly([context.p2Base, context.p1Base]);
                context.player1.clickCard(context.p2Base);
                expect(context.player2).toBeActivePlayer();
            });

            it('should defeat a space unit and player chooses not to deal damage to a base', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.shootDown);

                expect(context.player1).toBeAbleToSelectExactly([context.allianceXwing, context.tielnFighter, context.systemPatrolCraft]);
                context.player1.clickCard(context.tielnFighter);

                expect(context.tielnFighter).toBeInZone('discard');
                expect(context.player1).toHavePassAbilityPrompt('Deal 2 damage to a base');
                context.player1.clickPrompt('Pass');
                expect(context.player2).toBeActivePlayer();
            });

            it('should neither defeat a unit nor deal damage to a base', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.shootDown);

                expect(context.player1).toBeAbleToSelectExactly([context.allianceXwing, context.tielnFighter, context.systemPatrolCraft]);
                context.player1.clickCard(context.systemPatrolCraft);
                expect(context.systemPatrolCraft.damage).toBe(3);
                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});
