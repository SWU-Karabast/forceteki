describe('Inspiring Senator', function () {
    integration(function (contextRef) {
        describe('Inspiring Senator\'s when defeated ability', () => {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['major-partagaz#healthcare-provider', 'rush-clovis#banking-clan-scion'],
                        groundArena: ['inspiring-senator'],
                        leader: 'sly-moore#cipher-in-the-dark',
                        base: 'echo-base'
                    },
                    player2: {
                        hand: ['takedown', 'populist-champion', 'no-glory-only-results'],
                        leader: 'chirrut-imwe#one-with-the-force',
                        hasInitiative: true
                    }
                });
            });

            it('should decrease cost of the next Official you play by 1 resource', function () {
                const { context } = contextRef;

                context.player2.clickCard(context.takedown);
                context.player2.clickCard(context.inspiringSenator);

                context.player1.passAction();

                context.player2.clickCard(context.populistChampion);

                expect(context.player1).toBeActivePlayer();
                expect(context.player2.exhaustedResourceCount).toBe(7); // 4 for takedown + 3 for populist champion

                context.player1.clickCard(context.majorPartagaz);

                expect(context.player2).toBeActivePlayer();
                expect(context.player1.exhaustedResourceCount).toBe(1);

                context.player2.passAction();
                context.player1.clickCard(context.rushClovis);


                expect(context.player2).toBeActivePlayer();
                expect(context.player1.exhaustedResourceCount).toBe(5);
            });

            it('should decrease cost of the next Official you play by 1 resource (only the current phase)', function () {
                const { context } = contextRef;

                context.player2.clickCard(context.takedown);
                context.player2.clickCard(context.inspiringSenator);

                context.moveToNextActionPhase();
                context.player2.passAction();

                context.player1.clickCard(context.majorPartagaz);

                expect(context.player2).toBeActivePlayer();
                expect(context.player1.exhaustedResourceCount).toBe(2);
            });

            it('should decrease cost of the next Official you play by 1 resource (No Glory Only Results)', function () {
                const { context } = contextRef;

                context.player2.clickCard(context.noGloryOnlyResults);
                context.player2.clickCard(context.inspiringSenator);

                context.player1.clickCard(context.majorPartagaz);

                expect(context.player2).toBeActivePlayer();
                expect(context.player1.exhaustedResourceCount).toBe(2);

                context.player2.clickCard(context.populistChampion);

                expect(context.player1).toBeActivePlayer();
                expect(context.player1.exhaustedResourceCount).toBe(2);
            });
        });
    });
});
