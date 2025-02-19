describe('Home One, On My Mark', function() {
    integration(function(contextRef) {
        describe('Home One, On My Mark\'s decrease cost ability', function() {
            it('should cost 3 less if the opponent controls 3 or more space units', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['home-one#on-my-mark'],
                        leader: 'jyn-erso#resisting-oppression',
                        base: 'chopper-base'
                    },
                    player2: {
                        spaceArena: ['imperial-interceptor', 'tie-advanced', 'tieln-fighter']
                    }
                });
                const { context } = contextRef;

                context.player1.clickCard(context.homeOne);
                context.player1.clickPrompt('Pass'); // Resolve ambush

                expect(context.player1.exhaustedResourceCount).toBe(6);
            });

            it('should not reduce unit cost as there are not three or more space units under the opponent\'s control', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['home-one#on-my-mark'],
                        spaceArena: ['alliance-xwing', 'wing-leader', 'vanguard-ace'],
                        groundArena: ['battlefield-marine', 'yoda#old-master', 'jedha-agitator'],
                        leader: 'jyn-erso#resisting-oppression',
                        base: 'chopper-base'
                    },
                    player2: {
                        spaceArena: ['imperial-interceptor', 'tie-advanced'],
                        groundArena: ['gentle-giant', 'wampa', 'atst', 'volunteer-soldier']
                    }
                });
                const { context } = contextRef;

                // Friendly units and enemy Ground units must be ignored
                context.player1.clickCard(context.homeOne);
                context.player1.clickPrompt('Pass'); // Resolve ambush

                expect(context.player1.exhaustedResourceCount).toBe(9);
            });
        });
    });
});
