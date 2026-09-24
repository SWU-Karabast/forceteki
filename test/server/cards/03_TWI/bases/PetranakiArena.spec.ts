
describe('Petranaki Arena', function () {
    integration(function (contextRef) {
        it('Petranaki Arena\'s ability should give +1/+0 to leader unit you control', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['battlefield-marine'],
                    base: 'petranaki-arena',
                    leader: { card: 'rey#more-than-a-scavenger', deployed: true }
                },
                player2: {
                    leader: { card: 'nala-se#clone-engineer', deployed: true }
                }
            });

            const { context } = contextRef;

            // rex should have +1/+0
            expect(context.rey.getPower()).toBe(3);
            expect(context.rey.getHp()).toBe(6);

            // unit should not have +1/+0
            expect(context.battlefieldMarine.getPower()).toBe(3);
            expect(context.battlefieldMarine.getHp()).toBe(3);

            // enemy leader should not have +1/+0
            expect(context.nalaSe.getPower()).toBe(1);
            expect(context.nalaSe.getHp()).toBe(7);
        });

        it('Petranaki Arena\'s ability should give +1/+0 to both deployed leaders in FauxSuns', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                format: 'fauxSuns',
                player1: {
                    // Luke deployed: base 4/7 â†’ 5/7  |  Saw deployed: base 4/7 â†’ 5/7
                    leader: { card: 'luke-skywalker#faithful-friend', deployed: true },
                    secondLeader: { card: 'saw-gerrera#bring-down-the-empire', deployed: true },
                    base: 'petranaki-arena',
                },
                player2: {
                    leader: 'darth-vader#dark-lord-of-the-sith',
                    base: 'administrators-tower',
                }
            });

            const { context } = contextRef;

            expect(context.lukeSkywalkerFaithfulFriend.getPower()).toBe(5); // 4 base + 1
            expect(context.lukeSkywalkerFaithfulFriend.getHp()).toBe(7);    // unchanged
            expect(context.sawGerreraBringDownTheEmpire.getPower()).toBe(5); // 4 base + 1
            expect(context.sawGerreraBringDownTheEmpire.getHp()).toBe(7);    // unchanged
        });
    });
});

