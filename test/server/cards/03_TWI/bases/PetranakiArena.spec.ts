describe('Petranaki Arena', function () {
    integration(function (contextRef) {
        it('Petranaki Arena\'s ability should give +1/+0 to leader unit you control', function () {
            contextRef.setupTest({
                phase: 'action',
                player1: {
                    groundArena: ['battlefield-marine'],
                    base: 'petranaki-arena',
                    leader: { card: 'captain-rex#fighting-for-his-brothers', deployed: true }
                },
                player2: {
                    leader: { card: 'nala-se#clone-engineer', deployed: true }
                }
            });

            const { context } = contextRef;

            // rex should have +1/+0
            expect(context.captainRex.getPower()).toBe(3);
            expect(context.captainRex.getHp()).toBe(6);

            // unit should not have +1/+0
            expect(context.battlefieldMarine.getPower()).toBe(3);
            expect(context.battlefieldMarine.getHp()).toBe(4);

            // enemy leader should not have +1/+0
            expect(context.nalaSe.getPower()).toBe(1);
            expect(context.nalaSe.getHp()).toBe(7);
        });
    });
});
