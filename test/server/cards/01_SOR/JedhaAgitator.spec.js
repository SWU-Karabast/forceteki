describe('Jedha Agitator', function() {
    integration(function() {
        describe('Jedha Agitator\'s on attack ability', function() {
            beforeEach(function () {
                this.setupTest({
                    phase: 'action',
                    player1: {
                        groundArena: ['jedha-agitator'],
                    },
                    player2: {
                        groundArena: ['wampa'],
                        spaceArena: ['cartel-spacer']
                    }
                });
            });

            it('should do nothing if no leader is deployed', function () {
                this.player1.clickCard(this.jedhaAgitator);
                this.player1.clickCard(this.p2Base);
                expect(this.jedhaAgitator.exhausted).toBe(true);

                expect(this.player2).toBeActivePlayer();
            });
        });
    });
});
