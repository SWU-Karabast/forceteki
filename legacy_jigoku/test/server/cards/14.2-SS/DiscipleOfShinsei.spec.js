describe('Disciple Of Shinsei', function() {
    integration(function() {
        beforeEach(function() {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['disciple-of-shinsei', 'doji-kuwanan'],
                    dynastyDiscard: ['togashi-ichi'],
                    hand: ['fine-katana']
                },
                player2: {
                    inPlay: ['kakita-toshimoko'],
                    dynastyDiscard: ['togashi-ichi'],
                    hand: ['finger-of-jade', 'pacifism']
                }
            });

            this.disciple = this.player1.findCardByName('disciple-of-shinsei');
            this.ichi = this.player1.placeCardInProvince('togashi-ichi', 'province 1');

            this.kuwanan = this.player1.findCardByName('doji-kuwanan');
            this.toshimoko = this.player2.findCardByName('kakita-toshimoko');
            this.katana = this.player1.findCardByName('fine-katana');
            this.jade = this.player2.findCardByName('finger-of-jade');
            this.pacifism = this.player2.findCardByName('pacifism');
        });

        it('should not be able to trigger with no attachments', function() {
            this.player1.clickCard(this.ichi);
            this.player1.clickCard(this.disciple);
            expect(this.player1).not.toHavePrompt('Disciple of Shinsei');
            expect(this.disciple.location).toBe('dynasty discard pile');
        });

        it('should be able to target an attachment to discard it', function() {
            this.player1.playAttachment(this.katana, this.kuwanan);
            this.player2.playAttachment(this.jade, this.toshimoko);
            this.player1.pass();
            this.player2.playAttachment(this.pacifism, this.kuwanan);

            this.player1.clickCard(this.ichi);
            this.player1.clickCard(this.disciple);

            expect(this.player1).toHavePrompt('Triggered Abilities');
            this.player1.clickCard(this.disciple);
            expect(this.player1).toHavePrompt('Disciple of Shinsei');

            expect(this.player1).toBeAbleToSelect(this.katana);
            expect(this.player1).toBeAbleToSelect(this.jade);
            expect(this.player1).toBeAbleToSelect(this.pacifism);
            this.player1.clickCard(this.pacifism);
            expect(this.disciple.location).toBe('dynasty discard pile');
            expect(this.pacifism.location).toBe('conflict discard pile');
        });
    });
});
