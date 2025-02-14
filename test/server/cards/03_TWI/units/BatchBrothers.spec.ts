describe('Batch Brothers', function() {
    integration(function(contextRef) {
        it('Batch Brothers\'s ability should create a Clone Trooper when played', function () {
            contextRef.setupTest({
                phase: 'action',
                player1: {
                    hand: ['batch-brothers']
                },
            });

            const { context } = contextRef;
            context.player1.clickCard(context.batchBrothers);
            const cloneTroopers = context.player1.findCardsByName('clone-trooper');
            expect(cloneTroopers.length).toBe(1);
            expect(cloneTroopers).toAllBeInZone('groundArena');
            expect(cloneTroopers.every((cloneTrooper) => cloneTrooper.exhausted)).toBeTrue();
        });
    });
});