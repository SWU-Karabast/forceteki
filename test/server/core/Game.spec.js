describe('Overall game mechanics', function() {
    integration(function() {
        describe('Simultaneous lethal damage to both bases', function() {
            beforeEach(function () {
                this.setupTest({
                    phase: 'action',
                    player1: {
                        leader: 'sabine-wren#galvanized-revolutionary',
                        base: { card: 'chopper-base', damage: 29 }
                    },
                    player2: {
                        base: { card: 'administrators-tower', damage: 29 }
                    }
                });
            });

            it('should result in the game ending in a draw', function () {
                this.player1.clickCard(this.sabineWren);
                this.player1.clickPrompt('Deal 1 damage to each base');
                expect(this.player1).toHavePrompt('The game ended in a draw!');
                expect(this.player2).toHavePrompt('The game ended in a draw!');
            });
        });

        describe('One player\'s base taking lethal damage', function() {
            beforeEach(function () {
                this.setupTest({
                    phase: 'action',
                    player1: {
                        groundArena: ['rebel-pathfinder']
                    },
                    player2: {
                        base: { card: 'administrators-tower', damage: 29 }
                    }
                });
            });

            it('should cause that player to lose the game', function () {
                this.player1.clickCard(this.rebelPathfinder);
                expect(this.player1).toHavePrompt('player1 has won the game!');
                expect(this.player2).toHavePrompt('player1 has won the game!');
                expect(this.player1).toBeActivePlayer();
            });
        });
    });
});
