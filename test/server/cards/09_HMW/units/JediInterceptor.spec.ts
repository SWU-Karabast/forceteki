describe('Jedi Interceptor', function() {
    integration(function(contextRef) {
        describe('Jedi Interceptor\'s constant ability', function() {
            it('should get +2/+0 while its controller has 6 or more resources', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        spaceArena: ['jedi-interceptor'],
                        resources: 6
                    }
                });

                const { context } = contextRef;

                expect(context.jediInterceptor.getPower()).toBe(4);
                expect(context.jediInterceptor.getHp()).toBe(2);
            });

            it('should not get +2/+0 while its controller has fewer than 6 resources', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        spaceArena: ['jedi-interceptor'],
                        resources: 5
                    }
                });

                const { context } = contextRef;

                expect(context.jediInterceptor.getPower()).toBe(2);
                expect(context.jediInterceptor.getHp()).toBe(2);
            });

            it('should lose the bonus when its controller\'s resource count drops below 6', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['confiscate'],
                        spaceArena: ['jedi-interceptor'],
                        resources: 6
                    },
                    player2: {
                        groundArena: [{ card: 'wampa', upgrades: ['resilient'] }]
                    }
                });

                const { context } = contextRef;

                expect(context.jediInterceptor.getPower()).toBe(4);

                // Playing Confiscate (cost 1) does not change the resource count
                context.player1.clickCard(context.confiscate);
                context.player1.clickCard(context.resilient);

                expect(context.jediInterceptor.getPower()).toBe(4);
                expect(context.player2).toBeActivePlayer();
            });

            it('should count resources regardless of whether they are exhausted', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        spaceArena: ['jedi-interceptor'],
                        resources: 6
                    }
                });

                const { context } = contextRef;

                context.player1.exhaustResources(4);

                expect(context.jediInterceptor.getPower()).toBe(4);
                expect(context.jediInterceptor.getHp()).toBe(2);
            });
        });
    });
});
