describe('Huyang, Enduring Instructor', function() {
    integration(function(contextRef) {
        it('Huyang\'s ability gives another friendly unit +2/+2 until he leaves play', function () {
            contextRef.setupTest({
                phase: 'action',
                player1: {
                    hand: ['huyang#enduring-instructor'],
                    groundArena: ['wampa']
                },
                player2: {
                    groundArena: ['atst', 'atat-suppressor'],
                    spaceArena: ['cartel-spacer'],
                    hand: ['republic-attack-pod']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.huyang);
            expect(context.player1).toBeAbleToSelect(context.wampa);
            context.player1.clickCard(context.wampa);

            expect(context.wampa.getPower()).toBe(6);
            expect(context.wampa.getHp()).toBe(7);
            expect(context.huyang.getPower()).toBe(2);
            expect(context.huyang.getHp()).toBe(4);

            // Defeat Huyang, effect goes away
            context.player2.clickCard(context.atst);
            context.player2.clickCard(context.huyang);

            expect(context.wampa.getPower()).toBe(4);
            expect(context.wampa.getHp()).toBe(5);
        });
    });
});
