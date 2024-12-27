describe('Rallying Cry', function () {
    integration(function (contextRef) {
        describe('Rallying Cry\'s ability', function () {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['rallying-cry'],
                        groundArena: ['death-trooper'],
                        spaceArena: ['imperial-interceptor']
                    },
                    player2: {
                        spaceArena: ['distant-patroller']
                    },

                    // IMPORTANT: this is here for backwards compatibility of older tests, don't use in new code
                    autoSingleTarget: true
                });
            });

            it('should give Raid 2 to friendly units', function () {
                const { context } = contextRef;

                // Playing Rallying Cry from hand
                context.player1.clickCard(context.rallyingCry);
                context.player2.passAction();

                // Attacking with Death Trooper
                context.player1.clickCard(context.deathTrooper);
                expect(context.p2Base.damage).toBe(5);

                // Attacking with Imperial Interceptor
                context.player2.passAction();
                context.player1.clickCard(context.imperialInterceptor);
                expect(context.player1).toBeAbleToSelectExactly([context.p2Base, context.distantPatroller]);
                context.player1.clickCard(context.p2Base);
                expect(context.p2Base.damage).toBe(10);

                // Should not give Raid 2 to non-friendly units
                context.player2.clickCard(context.distantPatroller);
                expect(context.player2).toBeAbleToSelectExactly([context.p1Base, context.imperialInterceptor]);
                context.player2.clickCard(context.p1Base);
                expect(context.p1Base.damage).toBe(2);

                // Raid 2 should be gone by next phase
                context.moveToNextActionPhase();
                context.player1.clickCard(context.deathTrooper);
                expect(context.p2Base.damage).toBe(13);
            });
        });
    });
});