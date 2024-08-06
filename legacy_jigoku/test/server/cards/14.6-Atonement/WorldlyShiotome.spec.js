describe('Worldly Shiotome', function() {
    integration(function() {
        beforeEach(function() {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['worldly-shiotome'],
                    hand: ['spyglass']
                },
                player2: {
                    inPlay: ['doji-whisperer'],
                    hand: ['spyglass']
                }
            });

            this.worldlyShiotome = this.player1.findCardByName('worldly-shiotome');
            this.spyglass = this.player1.findCardByName('spyglass');

            this.dojiWhisperer = this.player2.findCardByName('doji-whisperer');
            this.spyglassP2 = this.player2.findCardByName('spyglass');
        });

        it('should react and honor after you play a gaijin card', function() {
            this.player1.clickCard(this.spyglass);
            this.player1.clickCard(this.worldlyShiotome);

            expect(this.player1).toHavePrompt('Triggered Abilities');
            expect(this.player1).toBeAbleToSelect(this.worldlyShiotome);

            this.player1.clickCard(this.worldlyShiotome);
            expect(this.worldlyShiotome.isHonored).toBe(true);
        });

        it('should not react and honor after an opponent plays a gaijin card', function() {
            this.player1.pass();
            this.player2.clickCard(this.spyglassP2);
            this.player2.clickCard(this.worldlyShiotome);

            expect(this.player1).not.toHavePrompt('Triggered Abilities');
            expect(this.player1).not.toBeAbleToSelect(this.worldlyShiotome);
            expect(this.player1).toHavePrompt('Action Window');
        });
    });
});
