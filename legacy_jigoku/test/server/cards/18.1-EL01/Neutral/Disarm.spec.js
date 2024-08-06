describe('Disarm', function() {
    integration(function() {
        beforeEach(function() {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['doomed-shugenja'],
                    hand: ['fine-katana', 'disarm']
                },
                player2: {
                    inPlay: ['doji-whisperer'],
                    hand: ['ornate-fan']
                }
            });

            this.doomed = this.player1.findCardByName('doomed-shugenja');
            this.whisperer = this.player2.findCardByName('doji-whisperer');
            this.fan = this.player2.findCardByName('ornate-fan');
            this.katana = this.player1.findCardByName('fine-katana');
            this.disarm = this.player1.findCardByName('disarm');

            this.player1.playAttachment(this.katana, this.doomed);
            this.player2.playAttachment(this.fan, this.doomed);
        });

        it('should cost 1 fate and let you choose an discard an attachment', function() {
            let fate = this.player1.fate;
            this.player1.clickCard(this.disarm);
            expect(this.player1).toBeAbleToSelect(this.katana);
            expect(this.player1).toBeAbleToSelect(this.fan);
            this.player1.clickCard(this.katana);

            expect(this.katana.location).toBe('conflict discard pile');
            expect(this.player1.fate).toBe(fate - 1);

            expect(this.getChatLogs(5)).toContain('player1 plays Disarm to discard Fine Katana');
        });
    });
});
