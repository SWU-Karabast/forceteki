describe('Shosuro Botanist', function() {
    integration(function() {
        beforeEach(function () {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['shosuro-botanist', 'doji-challenger'],
                    hand: ['fine-katana', 'a-new-name']
                },
                player2: {
                    inPlay: ['adept-of-the-waves', 'miya-mystic'],
                    hand: ['ornate-fan', 'cloud-the-mind']
                }
            });

            this.player1.playAttachment('a-new-name', 'shosuro-botanist');
            this.player2.playAttachment('ornate-fan', 'adept-of-the-waves');
            this.player1.playAttachment('fine-katana', 'doji-challenger');
            this.player2.playAttachment('cloud-the-mind', 'miya-mystic');
            this.ann = this.player1.findCardByName('a-new-name');
            this.ornatefan = this.player2.findCardByName('ornate-fan');
            this.finekatana = this.player1.findCardByName('fine-katana');
            this.cloud = this.player2.findCardByName('cloud-the-mind');
            this.botanist = this.player1.findCardByName('shosuro-botanist');
        });

        it('should return a non-weapon attachment to hand', function() {
            this.player1.clickCard(this.botanist);
            expect(this.player1).toBeAbleToSelect(this.ann);
            expect(this.player1).not.toBeAbleToSelect(this.finekatana);
            expect(this.player1).not.toBeAbleToSelect(this.ornatefan);
            expect(this.player1).not.toBeAbleToSelect(this.cloud);
            expect(this.ann.location).toBe('play area');
            this.player1.clickCard(this.ann);
            expect(this.ann.location).toBe('hand');
            expect(this.getChatLogs(5)).toContain('player1 uses Shosuro Botanist to return A New Name to player1\'s hand');
        });
    });
});
