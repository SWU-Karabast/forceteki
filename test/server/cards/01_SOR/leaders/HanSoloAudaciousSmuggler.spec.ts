describe('Han Solo, Audacious Smuggler', function() {
    integration(function(contextRef) {
        describe('Han Solo\'s leader ability', function() {
            beforeEach(function() {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        leader: 'han-solo#audacious-smuggler',
                        hand: ['pyke-sentinel', 'wampa'],
                        resources: 4,
                    },
                    player2: {
                        groundArena: ['moisture-farmer'],
                    }
                });
            });

            it('should put a card into play from hand as a ready resource and then defeat a resource at the start of the next action phase', function() {
                const { context } = contextRef;
                context.player1.clickCard('han-solo#audacious-smuggler');
                expect(context.player1.readyResourceCount).toBe(4);
                expect(context.player1).toBeAbleToSelectExactly(['pyke-sentinel', 'wampa']);
                context.player1.clickCard('wampa');
                expect(context.wampa).toBeInZone('resource', context.player1);
                expect(context.player1.readyResourceCount).toBe(5);

                context.player2.claimInitiative();
                context.player1.passAction();
                context.player2.clickPrompt('Done');
                context.player1.clickPrompt('Done');

                expect(context.player1).toHavePrompt('Defeat a resource you control');
                context.player1.clickCard('wampa');
                expect(context.wampa).toBeInZone('discard', context.player1);
            });
        });

        // describe('Han Solo\'s leader unit ability', function() {
        //     beforeEach(function() {
        //         contextRef.setupTest({
        //             phase: 'action',
        //             player1: {
        //                 groundArena: ['yoda#old-master', 'wilderness-fighter'],
        //                 spaceArena: ['green-squadron-awing'],
        //                 leader: { card: 'han-solo#audacious-smuggler', deployed: true },
        //             },
        //             player2: {
        //                 groundArena: ['wampa'],
        //                 spaceArena: ['system-patrol-craft']
        //             },

        //             // IMPORTANT: this is here for backwards compatibility of older tests, don't use in new code
        //             autoSingleTarget: true
        //         });
        //     });

        //     it('should put the top card of his deck into play as a ready resource and then defeat a resource at the start of the next action phase', function() {
        //         const { context } = contextRef;
        //     });
        // });
    });
});
