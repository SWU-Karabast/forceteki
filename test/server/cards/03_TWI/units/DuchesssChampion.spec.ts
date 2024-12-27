describe('Duchess\'s Champion', function () {
    integration(function (contextRef) {
        describe('Duchess\'s Champion\'s ability', function () {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        groundArena: ['duchesss-champion']
                    },
                    player2: {
                        groundArena: ['specforce-soldier'],
                        hasInitiative: true,
                    },

                    // IMPORTANT: this is here for backwards compatibility of older tests, don't use in new code
                    autoSingleTarget: true
                });
            });

            it('should not have Sentinel as opponent does not control 3 units or more', function () {
                const { context } = contextRef;

                context.player2.clickCard(context.specforceSoldier);
                expect(context.player2).toBeAbleToSelectExactly([context.p1Base, context.duchesssChampion]);
                context.player2.clickCard(context.p1Base);
                expect(context.player1).toBeActivePlayer();
                expect(context.p1Base.damage).toBe(2);
                expect(context.duchesssChampion.damage).toBe(0);
            });
        });

        describe('Duchess\'s Champion\'s ability', function () {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        groundArena: ['duchesss-champion']
                    },
                    player2: {
                        groundArena: ['specforce-soldier', 'battlefield-marine'],
                        spaceArena: ['green-squadron-awing'],
                        hasInitiative: true,
                    },

                    // IMPORTANT: this is here for backwards compatibility of older tests, don't use in new code
                    autoSingleTarget: true
                });
            });

            it('should have Sentinel as opponent control 3 units or more', function () {
                const { context } = contextRef;

                context.player2.clickCard(context.specforceSoldier);
                expect(context.player1).toBeActivePlayer();
                expect(context.p1Base.damage).toBe(0);
                expect(context.duchesssChampion.damage).toBe(2);
            });
        });
    });
});
