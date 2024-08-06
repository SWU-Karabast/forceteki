describe('Shape the Flesh', function() {
    integration(function() {
        beforeEach(function() {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['doji-whisperer'],
                    hand: ['shape-the-flesh', 'way-of-the-crane']
                },
                player2: {
                    inPlay: ['steward-of-cryptic-lore']
                }
            });

            this.whisperer = this.player1.findCardByName('doji-whisperer');
            this.shapeFlesh = this.player1.findCardByName('shape-the-flesh');
            this.wayOfTheCrane = this.player1.findCardByName('way-of-the-crane');

            this.steward = this.player2.findCardByName('steward-of-cryptic-lore');
            this.whisperer.fate = 3;
        });

        it('should pay with fate on characters', function () {
            const whispererFate = this.whisperer.fate;

            this.player1.clickCard(this.shapeFlesh);
            this.player1.clickCard(this.whisperer);
            this.player1.clickCard(this.whisperer);
            this.player1.clickPrompt('1');

            expect(this.whisperer.fate).toBe(whispererFate - 1);
            expect(this.shapeFlesh.parent).toBe(this.whisperer);
        });

        it('should not be able to honor the character', function () {
            this.player1.clickCard(this.shapeFlesh);
            this.player1.clickCard(this.whisperer);
            this.player1.clickCard(this.whisperer);
            this.player1.clickPrompt('1');

            this.player2.pass();

            this.player1.clickCard(this.wayOfTheCrane);
            expect(this.player1).toHavePrompt('Action Window');

            this.whisperer.dishonor();
            expect(this.whisperer.isDishonored).toBe(true);

            this.player1.clickCard(this.wayOfTheCrane);
            expect(this.player1).toHavePrompt('Action Window');
            expect(this.whisperer.isDishonored).toBe(true);
        });

        it('should grant covert', function () {
            this.player1.clickCard(this.shapeFlesh);
            this.player1.clickCard(this.whisperer);
            this.player1.clickCard(this.whisperer);
            this.player1.clickPrompt('1');

            this.noMoreActions();

            this.player1.clickCard(this.whisperer);
            this.player1.clickRing('fire');
            this.player1.clickCard(this.steward);

            expect(this.steward.covert).toBe(true);
        });
    });
});
