describe('Drawing the Void', function () {
    integration(function () {
        beforeEach(function () {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['ikoma-prodigy', 'akodo-kaede'],
                    hand: ['regal-bearing', 'drawing-the-void', 'reprieve', 'fine-katana', 'ornate-fan']
                },
                player2: {}
            });

            this.ikomaProdigy = this.player1.findCardByName('ikoma-prodigy');
            this.akodoKaede = this.player1.findCardByName('akodo-kaede');
            this.regalBearing = this.player1.findCardByName('regal-bearing');
            this.drawingTheVoid = this.player1.findCardByName('drawing-the-void');
            this.katana = this.player1.findCardByName('fine-katana');
            this.fan = this.player1.findCardByName('ornate-fan');
            this.reprieve = this.player1.findCardByName('reprieve');

            this.player1.player.showBid = 5;
            this.player2.player.showBid = 5;

            this.player1.moveCard(this.katana, 'conflict deck');
            this.player1.moveCard(this.fan, 'conflict deck');
            this.player1.moveCard(this.reprieve, 'conflict deck');
        });

        it('chooses cards to draw from 2 piles', function () {
            this.noMoreActions();
            this.initiateConflict({
                type: 'political',
                attackers: [this.ikomaProdigy],
                defenders: []
            });

            this.player2.pass();
            this.player1.clickCard(this.regalBearing);
            expect(this.player1).toHavePrompt('Triggered Abilities');
            expect(this.player1).toBeAbleToSelect(this.drawingTheVoid);

            this.player1.clickCard(this.drawingTheVoid);
            expect(this.player1).toHavePrompt('Choose a pile of cards to draw');
            expect(this.player1).toHavePromptButton('Reprieve, Ornate Fan, Fine Katana, Supernatural Storm');
            expect(this.player1).toHavePromptButton('Supernatural Storm (4)');

            this.player1.clickPrompt('Reprieve, Ornate Fan, Fine Katana, Supernatural Storm');
            expect(this.katana.location).toBe('hand');
            expect(this.fan.location).toBe('hand');
            expect(this.reprieve.location).toBe('hand');
            expect(this.getChatLogs(5)).toContain(
                'player1 plays Drawing the Void to choose between two piles of cards to draw'
            );
            expect(this.getChatLogs(5)).toContain('player1 channels their void affinity to draw an extra card');
        });
    });
});