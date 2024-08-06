describe('Strike Beneath the Veil', function () {
    integration(function () {
        beforeEach(function () {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['akodo-toturi'],
                    hand: ['fine-katana', 'ornate-fan']
                },
                player2: {
                    inPlay: [],
                    hand: ['strike-beneath-the-veil', 'pillow-book']
                }
            });

            this.toturi = this.player1.findCardByName('akodo-toturi');
            this.fineKatana = this.player1.findCardByName('fine-katana');
            this.ornateFan = this.player1.findCardByName('ornate-fan');

            this.pillowBook = this.player2.findCardByName('pillow-book');
            this.strikeBeneathTheVeil = this.player2.findCardByName('strike-beneath-the-veil');

            this.player1.playAttachment(this.fineKatana, this.toturi);
            this.player2.playAttachment(this.pillowBook, this.toturi);
            this.player1.playAttachment(this.ornateFan, this.toturi);

            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.toturi],
                defenders: []
            });
        });

        it('gives skill penalty depending on number of attachments', function () {
            this.player2.clickCard(this.strikeBeneathTheVeil);
            expect(this.player2).toHavePrompt('Choose a character');

            this.player2.clickCard(this.toturi);
            expect(this.toturi.getMilitarySkill()).toBe(2);
            expect(this.getChatLogs(5)).toContain(
                'player2 plays Strike Beneath the Veil to give Akodo Toturi -6military'
            );
        });
    });
});