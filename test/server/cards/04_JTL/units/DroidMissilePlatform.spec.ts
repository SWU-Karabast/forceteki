describe('Droid Missile Platform', function () {
    integration(function (contextRef) {
        it('Droid Missile Platform\'s ability should deal 3 indirect damage when defeated', function () {
            contextRef.setupTest({
                phase: 'action',
                player1: {
                    hand: ['rivals-fall']
                },
                player2: {
                    spaceArena: ['droid-missile-platform']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.rivalsFall);
            context.player1.clickCard(context.droidMissilePlatform);

            context.player2.clickPrompt('Opponent');

            // we do not have anything on board, indirect damage are automatically dealt on base

            expect(context.player2).toBeActivePlayer();
            expect(context.p1Base.damage).toBe(3);
        });
    });
});
