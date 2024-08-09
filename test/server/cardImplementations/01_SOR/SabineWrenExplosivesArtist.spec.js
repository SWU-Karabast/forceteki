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

                this.sabine = this.player1.findCardByName('sabine-wren#explosives-artist');
                this.marine = this.player1.findCardByName('battlefield-marine');
                this.wampa = this.player2.findCardByName('wampa');

                this.p1Base = this.player1.base;
                this.p2Base = this.player2.base;

                this.noMoreActions();

                // sabine is only partially implemented, still need to handle:
                // - the effect override if she gains sentinel
                // - her active ability
            });

            it('should not be targetable when 3 friendly aspects are in play', function () {
                this.player2.setActivePlayer();
                this.player2.clickCard(this.wampa);

                expect(this.player2).toBeAbleToSelect(this.marine);
                expect(this.player2).toBeAbleToSelect(this.p1Base);
                expect(this.player2).not.toBeAbleToSelect(this.sabine);
            });

            it('should be targetable when less than 3 friendly aspects are in play', function () {
                this.player1.spaceArena = [];
                this.player2.setActivePlayer();
                this.player2.clickCard(this.wampa);

                expect(this.player2).toBeAbleToSelect(this.marine);
                expect(this.player2).toBeAbleToSelect(this.p1Base);
                expect(this.player2).toBeAbleToSelect(this.sabine);
            });
        });
    });
});
