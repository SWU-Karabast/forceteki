describe('House of Leaves', function () {
    integration(function () {
        beforeEach(function () {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    stronghold: 'house-of-leaves',
                    inPlay: ['fushicho']
                },
                player2: {
                    inPlay: ['bayushi-liar']
                }
            });
            this.craneBox = this.player1.findCardByName('house-of-leaves');
            this.fushicho = this.player1.findCardByName('fushicho');
            this.bayushiLiar = this.player2.findCardByName('bayushi-liar');
        });

        it('should bow itself', function () {
            this.player1.clickCard(this.craneBox);
            this.player1.clickCard(this.fushicho);
            expect(this.craneBox.bowed).toBe(true);
        });

        it('should prompt to choose a target character you control', function () {
            this.player1.clickCard(this.craneBox);
            expect(this.player1).toHavePrompt('Choose a character');
            expect(this.player1).toBeAbleToSelect(this.fushicho);
            expect(this.player1).not.toBeAbleToSelect(this.bayushiLiar);
        });

        it('should give the chosen character +2 glory', function () {
            this.player1.clickCard(this.craneBox);
            this.player1.clickCard(this.fushicho);
            expect(this.fushicho.getGlory()).toBe(2);
        });
    });
});
