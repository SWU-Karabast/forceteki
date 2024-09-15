describe('Simultaneous triggers', function() {
    integration(function() {
        describe('Chewbacca being attacked by Sabine', function() {
            beforeEach(function () {
                this.setupTest({
                    phase: 'action',
                    player1: {
                        groundArena: ['sabine-wren#explosives-artist']
                    },
                    player2: {
                        groundArena: [{ card: 'chewbacca#loyal-companion', exhausted: true }]
                    }
                });
            });

            it('should prompt the active player(controller of Sabine) which player\'s triggers to resolve first', function () {
                this.player1.clickCard(this.sabineWren);
                //Don't need to click Chewbacca due to sentinel
                expect(this.player1).toHavePrompt('Both players have triggered abilities in response. Choose a player to resolve all of their abilities first:');
                expect(this.player2).toHavePrompt('Waiting for opponent to choose a player to resolve their triggers first');
                this.player1.clickPrompt('You');
                expect(this.chewbacca.exhausted).toBe(true);
                expect(this.player1).toBeAbleToSelectExactly([this.p1Base, this.p2Base, this.chewbacca]);
                expect(this.chewbacca.damage).toBe(0);
                this.player1.clickCard(this.p1Base);
                expect(this.player2).toBeActivePlayer();
                expect(this.chewbacca.damage).toBe(2);
                expect(this.chewbacca.exhausted).toBe(false);
            });

            it('should have the triggers work in either order', function () {
                this.player1.clickCard(this.sabineWren);
                //Don't need to click Chewbacca due to sentinel
                expect(this.player1).toHavePrompt('Both players have triggered abilities in response. Choose a player to resolve all of their abilities first:');
                expect(this.player2).toHavePrompt('Waiting for opponent to choose a player to resolve their triggers first');
                this.player1.clickPrompt('Opponent');
                expect(this.chewbacca.exhausted).toBe(false);
                expect(this.player1).toBeAbleToSelectExactly([this.p1Base, this.p2Base, this.chewbacca]);
                expect(this.chewbacca.damage).toBe(0);
                this.player1.clickCard(this.p1Base);
                expect(this.player2).toBeActivePlayer();
                expect(this.chewbacca.damage).toBe(2);
                expect(this.chewbacca.exhausted).toBe(false);
            });
        });
    });
});
