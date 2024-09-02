describe('Sabine Wren, Explosives Artist', function() {
    integration(function() {
        describe('Sabine', function() {
            beforeEach(function () {
                this.setupTest({
                    phase: 'action',
                    player1: {
                        groundArena: ['sabine-wren#explosives-artist', 'battlefield-marine'],
                        spaceArena: ['cartel-spacer']
                    },
                    player2: {
                        groundArena: ['wampa'],
                    }
                });

                // sabine is only partially implemented, still need to handle:
                // - the effect override if she gains sentinel
                // - her active ability
            });

            it('should not be targetable when 3 friendly aspects are in play', function () {
                this.player2.setActivePlayer();
                this.player2.clickCard(this.wampa);

                expect(this.player2).toBeAbleToSelectExactly([this.battlefieldMarine, this.p1Base]);
            });

            it('should be targetable when less than 3 friendly aspects are in play', function () {
                this.player1.setSpaceArenaUnits([]);
                this.player2.setActivePlayer();
                this.player2.clickCard(this.wampa);

                expect(this.player2).toBeAbleToSelectExactly([this.battlefieldMarine, this.p1Base, this.sabineWren]);
            });
        });
    });
});
