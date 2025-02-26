describe('Sugi, Hired Guardian', function () {
    integration(function (contextRef) {
        describe('Sugi\'s ability', function () {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['sugi#hired-guardian', { card: 'battlefield-marine', upgrades: ['academy-training'] }],
                    },
                    player2: {
                        groundArena: ['wampa'],
                    },

                    // IMPORTANT: this is here for backwards compatibility of older tests, don't use in new code
                    autoSingleTarget: true
                });
            });

            it('should not have Sentinel as there is not any upgraded enemy unit', function () {
                const { context } = contextRef;

                context.player1.passAction();

                context.player2.clickCard(context.wampa);
                expect(context.player2).toBeAbleToSelectExactly([context.p1Base, context.sugi, context.battlefieldMarine]);
                context.player2.clickCard(context.p1Base);
                expect(context.p1Base.damage).toBe(4);
            });
        });

        describe('Sugi\'s ability', function () {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['sugi#hired-guardian'],
                    },
                    player2: {
                        groundArena: ['wampa', { card: 'jedha-agitator', upgrades: ['protector'] }],
                    },

                    // IMPORTANT: this is here for backwards compatibility of older tests, don't use in new code
                    autoSingleTarget: true
                });
            });

            it('should have Sentinel as there is an upgraded enemy unit', function () {
                const { context } = contextRef;

                context.player1.passAction();
                context.player2.clickCard(context.wampa);

                // sugi automatically choose because there is an upgraded unit
                expect(context.player1).toBeActivePlayer();
                expect(context.p1Base.damage).toBe(0);
                expect(context.sugi.damage).toBe(4);
            });
        });
    });
});
