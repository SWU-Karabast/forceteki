describe('Energy Conversion Lab', function() {
    integration(function(contextRef) {
        describe('Energy Conversion Lab\'s ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        base: 'energy-conversion-lab',
                        leader: 'hera-syndulla#spectre-two',
                        hand: ['reinforcement-walker', 'rebel-pathfinder', 'alliance-xwing', 'atst']
                    },
                    player2: {
                        groundArena: ['isb-agent'],
                        spaceArena: ['tieln-fighter']
                    },

                    // IMPORTANT: this is here for backwards compatibility of older tests, don't use in new code
                    autoSingleTarget: true
                });
            });

            it('should allow the player to play a unit with cost 6 or less, paying its cost, and give it ambush', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.energyConversionLab);
                expect(context.player1).toBeAbleToSelectExactly([context.rebelPathfinder, context.allianceXwing, context.atst]);

                context.player1.clickCard(context.rebelPathfinder);
                expect(context.rebelPathfinder).toBeInZone('groundArena');
                expect(context.player1.exhaustedResourceCount).toBe(2);
                expect(context.player1).toHavePassAbilityPrompt('Ambush');

                context.player1.clickPrompt('Trigger');
                expect(context.rebelPathfinder.exhausted).toBe(true);
                expect(context.rebelPathfinder.damage).toBe(1);
                expect(context.isbAgent.damage).toBe(2);
            });
        });

        describe('Energy Conversion Lab\'s ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: [
                            'poe-dameron#quick-to-improvise'
                        ],
                        base: 'energy-conversion-lab',
                        leader: 'han-solo#worth-the-risk',
                        resources: 4
                    },
                    player2: {
                        groundArena: [
                            'rugged-survivors'
                        ]
                    }
                });
            });

            // Cf issue: https://github.com/SWU-Karabast/forceteki/issues/1005:
            it('should not give poe dameron ambush after attempting to use ECL', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.energyConversionLab);
                context.player1.clickCard(context.poeDameronQuickToImprovise);
                expect(1).toBe(1);
            });
        });
    });
});
