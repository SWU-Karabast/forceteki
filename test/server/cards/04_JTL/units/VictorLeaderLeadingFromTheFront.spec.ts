describe('Victor Leader', function() {
    integration(function(contextRef) {
        it('Victor Leader\'s ability should give other friendly space units +1/+1', function () {
            contextRef.setupTest({
                phase: 'action',
                player1: {
                    groundArena: ['droideka-security'],
                    spaceArena: ['providence-destroyer', 'victor-leader#leading-from-the-front']
                },
                player2: {
                    hand: ['takedown'],
                    spaceArena: ['consortium-starviper'],
                    hasInitiative: true,
                }
            });

            const { context } = contextRef;

            // checks +1/+1 applies only to other friendly space units
            // Own units Space and Ground
            expect(context.victorLeader.getPower()).toBe(2);
            expect(context.victorLeader.getHp()).toBe(4);
            expect(context.providenceDestroyer.getPower()).toBe(6);
            expect(context.providenceDestroyer.getHp()).toBe(8);
            expect(context.droidekaSecurity.getPower()).toBe(4);
            expect(context.droidekaSecurity.getHp()).toBe(5);

            // Opponent Space
            expect(context.consortiumStarviper.getPower()).toBe(3);
            expect(context.consortiumStarviper.getHp()).toBe(3);

            // Remove Victor Leader to remove buff
            context.player2.clickCard(context.takedown);
            context.player2.clickCard(context.victorLeader);

            // Buff removed check
            expect(context.consortiumStarviper.getPower()).toBe(3);
            expect(context.consortiumStarviper.getHp()).toBe(3);
            expect(context.providenceDestroyer.getPower()).toBe(5);
            expect(context.providenceDestroyer.getHp()).toBe(7);
        });
    });
});
