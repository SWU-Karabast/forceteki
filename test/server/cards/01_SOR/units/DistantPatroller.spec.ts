describe('Distant Patroller', function () {
    integration(function (contextRef) {
        describe('Distant Patroller\'s ability', function () {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['death-trooper'],
                        spaceArena: ['red-three#unstoppable', 'distant-patroller', 'avenger#hunting-star-destroyer', 'inferno-four#unforgetting'],
                        leader: { card: 'chirrut-imwe#one-with-the-force', deployed: true }
                    },
                    player2: {
                        spaceArena: ['system-patrol-craft']
                    },

                    // IMPORTANT: this is here for backwards compatibility of older tests, don't use in new code
                    autoSingleTarget: true
                });
            });

            it('should give a shield to an another ally', function () {
                const { context } = contextRef;

                // kill distant patroller on sentinel
                context.player1.clickCard(context.distantPatroller);
                expect(context.player1).toBeAbleToSelectExactly([context.deathTrooper, context.avenger, context.infernoFour, context.systemPatrolCraft, context.chirrutImwe]);
                // add a shield on avenger
                context.player1.clickCard(context.avenger);
                expect(context.distantPatroller.zoneName).toBe('discard');
                expect(context.avenger).toHaveExactUpgradeNames(['shield']);
            });
        });

        it('should work with No Glory, Only Results', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    spaceArena: [{ card: 'distant-patroller', upgrades: ['experience', 'experience'] }]
                },
                player2: {
                    hand: ['no-glory-only-results'],
                    groundArena: ['maul#shadow-collective-visionary', 'supreme-leader-snoke#shadow-ruler'],
                    hasInitiative: true
                }
            });
            const { context } = contextRef;

            context.player2.clickCard(context.noGloryOnlyResults);
            context.player2.clickCard(context.distantPatroller);
            expect(context.player2).toBeAbleToSelectExactly(context.supremeLeaderSnoke);
            context.player2.clickCard(context.supremeLeaderSnoke);
            expect(context.supremeLeaderSnoke).toHaveExactUpgradeNames(['shield']);

            context.player1.passAction();
        });
    });
});
