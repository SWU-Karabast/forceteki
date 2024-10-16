describe('Sabine Wren, Galvanized Revolutionary', function() {
    integration(function() {
        describe('Sabine\'s undeployed ability', function() {
            beforeEach(function () {
                this.setupTest({
                    phase: 'action',
                    player1: {
                        leader: 'sabine-wren#galvanized-revolutionary'
                    }
                });
            });

            it('should deal 1 damage to both bases', function () {
                this.player1.clickCard(this.sabineWren);
                this.player1.clickPrompt('Deal 1 damage to each base');
                expect(this.p1Base.damage).toBe(1);
                expect(this.p2Base.damage).toBe(1);
                expect(this.sabineWren.exhausted).toBe(true);
            });
        });

        describe('Sabine\'s deployed ability', function() {
            beforeEach(function () {
                this.setupTest({
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
                this.player1.clickCard(this.sabineWren);
                this.player1.clickCard(this.rebelPathfinder);
                expect(this.p2Base.damage).toBe(1);
                expect(this.p1Base.damage).toBe(0);
                expect(this.rebelPathfinder.damage).toBe(2);
            });

            it('should deal 1 damage to the opponent\'s base on attack before combat damage', function () {
                this.p2Base.damage = 29;
                this.player1.clickCard(this.sabineWren);
                this.player1.clickCard(this.rebelPathfinder);
                expect(this.player1).toHavePrompt('player1 has won the game!');
                expect(this.player2).toHavePrompt('player1 has won the game!');
                expect(this.player1).toBeActivePlayer();
                expect(this.p2Base.damage).toBe(30);
                expect(this.p1Base.damage).toBe(0);
                expect(this.rebelPathfinder.damage).toBe(0);
            });
        });
    });
});
