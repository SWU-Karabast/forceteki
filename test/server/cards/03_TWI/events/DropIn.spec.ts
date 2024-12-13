describe('Drop In', function () {
    integration(function (contextRef) {
        it('Drop In\'s ability should create two Clone Trooper tokens for the controller', function () {
            contextRef.setupTest({
                phase: 'action',
                player1: {
                    hand: ['drop-in'],
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.dropIn);

            const cloneTroopers = context.player1.findCardsByName('clone-trooper');
            expect(cloneTroopers.length).toBe(2);
            expect(cloneTroopers).toAllBeInZone('groundArena');
            expect(cloneTroopers.every((cloneTrooper) => cloneTrooper.exhausted)).toBeTrue();
            expect(context.player2.getArenaCards().length).toBe(0);
        });
    });
});
