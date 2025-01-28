describe('Nala Se, Clone Engineer', function () {
    integration(function (contextRef) {
        describe('Nala Se\'s leader undeployed ability', function () {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        leader: { card: 'nala-se#clone-engineer', deployed: true },
                        base: 'echo-base',
                        hand: ['batch-brothers'],
                    },
                    player2: {
                        groundArena: ['battlefield-marine'],
                    }
                });
            });

            it('should ignore aspect penalties on Clones', function () {
                const { context } = contextRef;
                const readyResources = context.player1.readyResourceCount;

                // Should cost 3 despite a double aspect penalty
                context.player1.clickCard(context.batchBrothers);
                expect(context.player1.readyResourceCount).toBe(readyResources - 3);
            });
        });

        describe('Nala Se\'s leader deployed ability', function () {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        leader: { card: 'nala-se#clone-engineer', deployed: true },
                        groundArena: ['pyke-sentinel'],
                        base: { card: 'echo-base', damage: 6 },
                        hand: ['batch-brothers'],
                    },
                    player2: {
                        hand: ['vanquish', 'takedown']
                    }
                });
            });

            it('should ignore aspect penalties on Clones and heal 2 damage when a clone is defeated', function () {
                const { context } = contextRef;
                const readyResources = context.player1.readyResourceCount;

                // Should cost 3 despite a double aspect penalty
                context.player1.clickCard(context.batchBrothers);
                expect(context.player1.readyResourceCount).toBe(readyResources - 3);

                context.player2.clickCard(context.vanquish);
                context.player2.clickCard(context.batchBrothers);

                expect(context.p1Base.damage).toBe(4);

                // Ensure a non-clone unit doesn't heal
                context.player1.passAction();
                context.player2.clickCard(context.takedown);
                context.player2.clickCard(context.pykeSentinel);
                expect(context.p1Base.damage).toBe(4);
            });
        });
    });
});
