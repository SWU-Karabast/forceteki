describe('Intro Battle of Hoth\'s bases', function() {
    integration(function(contextRef) {
        it('should have 20 hp', async function () {
            await contextRef.setupTestAsync({
                phase: 'setup',
                player1: {
                    base: 'echo-caverns',
                },
                player2: {
                    base: 'forward-command-post'
                }
            });

            const { context } = contextRef;
            expect(context.echoCaverns.getHp()).toBe(20);
            expect(context.forwardCommandPost.getHp()).toBe(20);
        });
    });
});
