describe('Stormtrooper Patrol', function () {
    integration(function (contextRef) {
        describe('Stormtrooper Patrol\'s ability', function () {
            it('should gain +2/+0 while controlling another unit that costs 3 or more', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['stormtrooper-patrol', 'yoda#old-master']
                    }
                });
                const { context } = contextRef;

                expect(context.stormtrooperPatrol.getPower()).toBe(4);
                expect(context.stormtrooperPatrol.getHp()).toBe(4);
            });

            it('should not gain the bonus while the only other unit costs less than 3', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['stormtrooper-patrol'],
                        spaceArena: ['awing']
                    },
                    player2: {
                        groundArena: ['yoda#old-master']
                    }
                });
                const { context } = contextRef;

                expect(context.stormtrooperPatrol.getPower()).toBe(2);
                expect(context.stormtrooperPatrol.getHp()).toBe(4);
            });
        });
    });
});
