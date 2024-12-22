describe('Sabine Wren, Galvanized Revolutionary', function() {
    integration(function(contextRef) {
        describe('Sabine\'s undeployed ability', function() {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        leader: 'sabine-wren#galvanized-revolutionary'
                    }
                });
            });

            it('should deal 1 damage to both bases', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.sabineWren);
                context.player1.clickPrompt('Deal 1 damage to each base');
                expect(context.p1Base.damage).toBe(1);
                expect(context.p2Base.damage).toBe(1);
                expect(context.sabineWren.exhausted).toBe(true);
            });
        });

        describe('Sabine\'s deployed ability', function() {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        leader: { card: 'sabine-wren#galvanized-revolutionary', deployed: true }
                    },
                    player2: {
                        groundArena: ['rebel-pathfinder']
                    }
                });
            });

            it('should deal 1 damage to the opponent\'s base on attack', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.sabineWren);
                context.player1.clickCard(context.rebelPathfinder);
                expect(context.p2Base.damage).toBe(1);
                expect(context.p1Base.damage).toBe(0);
                expect(context.rebelPathfinder.damage).toBe(2);
            });

            it('should deal 1 damage to the opponent\'s base on attack before combat damage', function () {
                const { context } = contextRef;

                context.setDamage(context.p2Base, 29);
                context.player1.clickCard(context.sabineWren);
                context.player1.clickCard(context.rebelPathfinder);
                expect(context.player1).toHavePrompt('player1 has won the game!');
                expect(context.player2).toHavePrompt('player1 has won the game!');
                expect(context.p2Base.damage).toBe(30);
                expect(context.p1Base.damage).toBe(0);
                expect(context.rebelPathfinder.damage).toBe(0);
                expect(context.player1).toBeActivePlayer();

                context.allowTestToEndWithOpenPrompt = true;
            });
        });
    });
});
