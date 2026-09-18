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
        });
    });
});
