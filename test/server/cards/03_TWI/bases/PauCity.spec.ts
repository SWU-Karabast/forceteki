describe('Pau City', function () {
    integration(function (contextRef) {
        it('Pau City\'s ability should give +0/+1 to leader unit you control', function () {
            contextRef.setupTest({
                phase: 'action',
                player1: {
                    groundArena: ['battlefield-marine'],
                    base: 'pau-city',
                    leader: { card: 'rey#more-than-a-scavenger', deployed: true }
                },
                player2: {
                    leader: { card: 'nala-se#clone-engineer', deployed: true }
                }
            });

            const { context } = contextRef;

            // rex should have +0/+1
            expect(context.rey.getPower()).toBe(2);
            expect(context.rey.getHp()).toBe(7);

            // unit should not have +0/+1
            expect(context.battlefieldMarine.getPower()).toBe(3);
            expect(context.battlefieldMarine.getHp()).toBe(3);

            // enemy leader should not have +0/+1
            expect(context.nalaSe.getPower()).toBe(1);
            expect(context.nalaSe.getHp()).toBe(7);
        });

        it('Pau City\'s ability should not crash if there is not leader', function () {
            contextRef.setupTest({
                phase: 'action',
                player1: {
                    groundArena: ['battlefield-marine'],
                    base: 'pau-city',
                    leader: 'rey#more-than-a-scavenger',
                },
                player2: {
                    leader: 'nala-se#clone-engineer'
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.battlefieldMarine);
            context.player1.clickCard(context.p2Base);
            expect(context.p2Base.damage).toBe(3);
            expect(context.p1Base.getHp()).toBe(26);
        });
    });
});
