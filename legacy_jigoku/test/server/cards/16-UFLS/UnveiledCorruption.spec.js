describe('Unveiled Corruption', function() {
    integration(function() {
        beforeEach(function() {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    hand: [
                        'against-the-waves', 'fine-katana', 'unveiled-corruption'
                    ]
                },
                player2: {
                    hand: [
                        'against-the-waves', 'fine-katana', 'ornate-fan', 'honored-blade',
                        'magnificent-kimono', 'assassination', 'banzai', 'charge'
                    ]
                }
            });
            this.atw = this.player1.findCardByName('against-the-waves');
            this.katana = this.player1.findCardByName('fine-katana');
            this.corruption = this.player1.findCardByName('unveiled-corruption');

            this.sd1 = this.player1.findCardByName('shameful-display', 'province 1');
            this.sd2 = this.player1.findCardByName('shameful-display', 'province 2');
            this.sd3 = this.player1.findCardByName('shameful-display', 'province 3');
            this.sd4 = this.player1.findCardByName('shameful-display', 'province 4');
            this.sd5 = this.player1.findCardByName('shameful-display', 'stronghold province');

            this.sd1_2 = this.player2.findCardByName('shameful-display', 'province 1');

            this.sd2.isBroken = true;
            this.sd1.facedown = false;
            this.sd3.facedown = true;

            this.atw2 = this.player2.findCardByName('against-the-waves');
            this.katana2 = this.player2.findCardByName('fine-katana');
            this.fan2 = this.player2.findCardByName('ornate-fan');
            this.blade2 = this.player2.findCardByName('honored-blade');
            this.kimono2 = this.player2.findCardByName('magnificent-kimono');
            this.assassination2 = this.player2.findCardByName('assassination');
            this.banzai2 = this.player2.findCardByName('banzai');
            this.charge2 = this.player2.findCardByName('charge');
        });

        it('should prompt you to taint an unbroken province', function() {
            this.player1.clickCard(this.corruption);
            expect(this.player1).toHavePrompt('Select card to taint');
            expect(this.player1).toBeAbleToSelect(this.sd1);
            expect(this.player1).not.toBeAbleToSelect(this.sd2);
            expect(this.player1).toBeAbleToSelect(this.sd3);
            expect(this.player1).toBeAbleToSelect(this.sd4);
            expect(this.player1).toBeAbleToSelect(this.sd5);
            expect(this.player1).not.toBeAbleToSelect(this.sd1_2);
        });

        it('should taint the chosen province and prompt opponent to discard cards - faceup province', function() {
            this.player1.clickCard(this.corruption);
            expect(this.player1).toHavePrompt('Select card to taint');
            this.player1.clickCard(this.sd1);
            expect(this.sd1.isTainted).toBe(true);
            expect(this.getChatLogs(5)).toContain('player1 plays Unveiled Corruption, tainting Shameful Display to make player2 discard 6 cards');
        });

        it('should taint the chosen province and prompt opponent to discard cards - facedown province', function() {
            this.player1.clickCard(this.corruption);
            expect(this.player1).toHavePrompt('Select card to taint');
            this.player1.clickCard(this.sd3);
            expect(this.sd3.isTainted).toBe(true);
            expect(this.getChatLogs(5)).toContain('player1 plays Unveiled Corruption, tainting a facedown card to make player2 discard 6 cards');
            expect(this.player2).toHavePrompt('Choose 6 cards to discard');
            expect(this.player2).toBeAbleToSelect(this.assassination2);
            expect(this.player2).toBeAbleToSelect(this.charge2);

            this.player2.clickCard(this.assassination2);
            this.player2.clickCard(this.atw2);
            this.player2.clickCard(this.kimono2);
            this.player2.clickCard(this.katana2);
            this.player2.clickCard(this.charge2);
            this.player2.clickCard(this.blade2);
            this.player2.clickPrompt('Done');

            expect(this.getChatLogs(5)).toContain('player2 discards Assassination, Against the Waves, Magnificent Kimono, Fine Katana, Charge! and Honored Blade');
        });

        it('should not be playable if opponent has fewer cards', function() {
            this.player2.moveCard(this.assassination2, 'conflict discard pile');
            this.player2.moveCard(this.atw2, 'conflict discard pile');
            this.player2.moveCard(this.kimono2, 'conflict discard pile');
            this.player2.moveCard(this.katana2, 'conflict discard pile');
            this.player2.moveCard(this.charge2, 'conflict discard pile');
            this.player2.moveCard(this.blade2, 'conflict discard pile');

            expect(this.player1).toHavePrompt('Action Window');
            this.player1.clickCard(this.corruption);
            expect(this.player1).toHavePrompt('Action Window');
        });

        it('should be playable if opponent has equal cards', function() {
            this.player2.moveCard(this.assassination2, 'conflict discard pile');
            this.player2.moveCard(this.atw2, 'conflict discard pile');
            this.player2.moveCard(this.kimono2, 'conflict discard pile');
            this.player2.moveCard(this.katana2, 'conflict discard pile');
            this.player2.moveCard(this.charge2, 'conflict discard pile');

            expect(this.player1).toHavePrompt('Action Window');
            this.player1.clickCard(this.corruption);
            expect(this.player1).toHavePrompt('Select card to taint');
            this.player1.clickCard(this.sd3);
            expect(this.sd3.isTainted).toBe(true);
            expect(this.getChatLogs(5)).toContain('player1 plays Unveiled Corruption, tainting a facedown card to make player2 discard 1 cards');
        });
    });
});
