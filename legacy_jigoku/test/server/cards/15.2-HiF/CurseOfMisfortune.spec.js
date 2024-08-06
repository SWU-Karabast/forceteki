describe('Curse of Misfortune', function() {
    integration(function() {
        beforeEach(function() {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['togashi-mitsu', 'kakita-yoshi'],
                    hand: ['fine-katana', 'a-new-name', 'seal-of-the-dragon', 'honored-blade', 'tattooed-wanderer', 'curse-of-misfortune']
                },
                player2: {
                    inPlay: ['togashi-initiate'],
                    hand: ['fine-katana', 'a-new-name', 'seal-of-the-dragon', 'curse-of-misfortune']
                }
            });

            this.mitsu = this.player1.findCardByName('togashi-mitsu');
            this.yoshi = this.player1.findCardByName('kakita-yoshi');
            this.katana = this.player1.findCardByName('fine-katana');
            this.ann = this.player1.findCardByName('a-new-name');
            this.dragon = this.player1.findCardByName('seal-of-the-dragon');
            this.wanderer = this.player1.findCardByName('tattooed-wanderer');

            this.initiate = this.player2.findCardByName('togashi-initiate');
            this.katana2 = this.player2.findCardByName('fine-katana');
            this.ann2 = this.player2.findCardByName('a-new-name');
            this.dragon2 = this.player2.findCardByName('seal-of-the-dragon');

            this.curse = this.player1.findCardByName('curse-of-misfortune');
            this.curse2 = this.player2.findCardByName('curse-of-misfortune');

            this.player1.playAttachment(this.katana, this.mitsu);
            this.player2.playAttachment(this.katana2, this.mitsu);
            this.player1.playAttachment(this.ann, this.mitsu);
            this.player2.playAttachment(this.ann2, this.mitsu);
            this.player1.clickCard(this.wanderer);
            this.player1.clickPrompt('Play Tattooed Wanderer as an attachment');
            this.player1.clickCard(this.mitsu);
        });

        it('should give all other attachments (but not itself) restricted', function() {
            this.player2.clickCard(this.curse2);
            this.player2.clickCard(this.mitsu);
            expect(this.player1).toHavePrompt('Choose an attachment to discard');

            expect(this.player1).toBeAbleToSelect(this.katana);
            expect(this.player1).toBeAbleToSelect(this.katana2);
            expect(this.player1).toBeAbleToSelect(this.ann);
            expect(this.player1).toBeAbleToSelect(this.ann2);
            expect(this.player1).toBeAbleToSelect(this.wanderer);
            expect(this.player1).not.toBeAbleToSelect(this.curse2);

            this.player1.clickCard(this.katana);
            expect(this.player1).toHavePrompt('Choose an attachment to discard');
            this.player1.clickCard(this.wanderer);
            expect(this.player1).toHavePrompt('Choose an attachment to discard');
            this.player1.clickCard(this.ann2);
            expect(this.player1).not.toHavePrompt('Choose an attachment to discard');
            expect(this.getChatLogs(8)).toContain('player1 discards Fine Katana from Togashi Mitsu due to too many Restricted attachments');
            expect(this.getChatLogs(8)).toContain('player1 discards Tattooed Wanderer from Togashi Mitsu due to too many Restricted attachments');
            expect(this.getChatLogs(8)).toContain('player1 discards A New Name from Togashi Mitsu due to too many Restricted attachments');
        });

        it('should give new attachments restricted', function() {
            this.player2.clickCard(this.curse2);
            this.player2.clickCard(this.mitsu);
            this.player1.clickCard(this.katana);
            this.player1.clickCard(this.wanderer);
            this.player1.clickCard(this.ann2);
            this.player1.playAttachment(this.dragon, this.mitsu);
            expect(this.player1).toHavePrompt('Choose an attachment to discard');
        });

        it('should give other copies restricted', function() {
            this.player2.clickCard(this.curse2);
            this.player2.clickCard(this.mitsu);
            this.player1.clickCard(this.katana);
            this.player1.clickCard(this.wanderer);
            this.player1.clickCard(this.ann2);
            this.player1.playAttachment(this.curse, this.mitsu);
            expect(this.player1).toHavePrompt('Choose an attachment to discard');
            expect(this.player1).toBeAbleToSelect(this.curse);
            expect(this.player1).toBeAbleToSelect(this.curse2);
            this.player1.clickCard(this.curse2);
            expect(this.player1).not.toHavePrompt('Choose an attachment to discard');
            expect(this.getChatLogs(8)).toContain('player1 discards Curse of Misfortune from Togashi Mitsu due to too many Restricted attachments');
        });
    });
});
