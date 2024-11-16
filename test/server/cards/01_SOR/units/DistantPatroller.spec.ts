describe('Distant Patroller', function () {
    integration(function (contextRef) {
        describe('Distant Patroller\'s ability', function () {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        groundArena: ['death-trooper'],
                        spaceArena: ['red-three#unstoppable', 'distant-patroller', 'avenger#hunting-star-destroyer', 'inferno-four#unforgetting'],
                        leader: { card: 'chirrut-imwe#one-with-the-force', deployed: true }
                    },
                    player2: {
                        spaceArena: ['system-patrol-craft']
                    }
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
    });
});
