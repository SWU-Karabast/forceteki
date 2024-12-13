describe('Infiltrator\'s Skill', function() {
    integration(function(contextRef) {
        describe('Infiltrator\'s Skill\'s ability', function() {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        groundArena: [{ card: 'battlefield-marine', upgrades: ['infiltrators-skill'] }],
                    },
                    player2: {
                        groundArena: [{ card: 'niima-outpost-constables', upgrades: ['shield'] }]
                    },

                    // IMPORTANT: this is here for backwards compatibility of older tests, don't use in new code
                    autoSingleTarget: true
                });
            });

            it('should ignore sentinel', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.battlefieldMarine);
                expect(context.player1).toBeAbleToSelectExactly([context.niimaOutpostConstables, context.p2Base]);
                // ignore sentinel
                context.player1.clickCard(context.p2Base);
                expect(context.p2Base.damage).toBe(4);
            });

            it('should ignore shield', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.battlefieldMarine);
                expect(context.player1).toBeAbleToSelectExactly([context.niimaOutpostConstables, context.p2Base]);

                // defeat shielded niima outpost constables
                context.player1.clickCard(context.niimaOutpostConstables);
                expect(context.battlefieldMarine.damage).toBe(2);
                expect(context.niimaOutpostConstables.damage).toBe(4);
                expect(context.niimaOutpostConstables.isUpgraded()).toBe(false);
            });
        });
    });
});
