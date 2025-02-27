describe('Anakin\'s Interceptor, Where The Fun Begins', function () {
    integration(function (contextRef) {
        describe('Anakin\'s Interceptor, Where The Fun Begins\'s ability', function () {
            it('should not have power buff if no base has more than 15 damage', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        spaceArena: ['anakins-interceptor#where-the-fun-begins'],
                        base: { card: 'energy-conversion-lab', damage: 14 }
                    }
                });

                const { context } = contextRef;

                expect(context.anakinsInterceptor.getPower()).toBe(2);
                expect(context.anakinsInterceptor.getHp()).toBe(3);
            });

            it('should have power buff as base has more than 15 damage', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        spaceArena: ['anakins-interceptor#where-the-fun-begins'],
                        base: { card: 'energy-conversion-lab', damage: 17 }
                    }
                });

                const { context } = contextRef;

                expect(context.anakinsInterceptor.getPower()).toBe(4);
                expect(context.anakinsInterceptor.getHp()).toBe(3);
            });
        });
    });
});
