describe('First Legion Snow Trooper', function() {
    integration(function() {
        describe('Boba Fett Disintegrator\'s ability', function () {
            beforeEach(function () {
                this.setupTest({
                    phase: 'action',
                    player1: {
                        groundArena: ['boba-fett#disintegrator'],
                    },
                    player2: {
                        groundArena: ['wampa'],
                        hand: ['steadfast-battalion', 'battlefield-marine'],
                    }
                });
            });

            it('should have no effect when attacking a ready unit or a exhausted unit played this turn', function () {
                // Case 1 attacking a ready card
                expect(this.player1).toBeActivePlayer();
                expect(this.player1).toBeAbleToSelectExactly([this.bobaFett]);
                this.player1.clickCard(this.bobaFett);
                this.player1.clickCard(this.wampa);

                // check board state
                expect(this.wampa.damage).toBe(3);
                expect(this.bobaFett.damage).toBe(4);

                // reset board state
                this.bobaFett.damage = 0;
                this.bobaFett.exhausted = false;
                this.wampa.damage = 0;

                // Case 2 attacking a card played this turn
                expect(this.player2).toBeActivePlayer();
                this.player2.clickCard(this.steadfastBattalion);
                expect(this.player1).toBeActivePlayer();
                this.player1.clickCard(this.bobaFettDisintegrator);
                this.player1.clickCard(this.steadfastBattalion);

                // check board state
                expect(this.player2).toBeActivePlayer();
                expect(this.steadfastBattalion.damage).toBe(3);
                expect(this.bobaFett.location).toBe('discard');
            });

            it('Should activate when attacking a exhausted unit played in a previous phase', function() {
                this.player1.passAction();
                this.player2.clickCard(this.wampa);
                this.player2.clickCard(this.bobaFett);
                this.player1.clickCard(this.bobaFett);
                this.player1.clickCard(this.wampa);

                // check board state
                expect(this.wampa.location).toBe('discard');
                expect(this.bobaFettDisintegrator.damage).toBe(4);
            });
        });
    });
});
