describe('Sanguine Mastery', function() {
    integration(function() {
        beforeEach(function() {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['doji-kuwanan', 'hida-kisada', 'doji-whisperer'],
                    dynastyDiscard: ['utaku-rumaru'],
                    hand: ['fine-katana', 'seal-of-the-crane', 'sanguine-mastery']
                },
                player2: {
                    inPlay: ['kakita-toshimoko'],
                    dynastyDiscard: ['shosuro-denmaru'],
                    hand: ['finger-of-jade', 'pacifism']
                }
            });

            this.sanguine = this.player1.findCardByName('sanguine-mastery');
            this.kuwanan = this.player1.findCardByName('doji-kuwanan');
            this.kisada = this.player1.findCardByName('hida-kisada');
            this.whisperer = this.player1.findCardByName('doji-whisperer');
            this.toshimoko = this.player2.findCardByName('kakita-toshimoko');
            this.katana = this.player1.findCardByName('fine-katana');
            this.crane = this.player1.findCardByName('seal-of-the-crane');
            this.jade = this.player2.findCardByName('finger-of-jade');
            this.pacifism = this.player2.findCardByName('pacifism');

            this.denmaru = this.player2.findCardByName('shosuro-denmaru');
            this.rumaru = this.player1.findCardByName('utaku-rumaru');

            this.kuwanan.fate = 10;
        });

        it('should not be able to be played with no attachments in play', function() {
            expect(this.player1).toHavePrompt('Action Window');
            this.player1.clickCard(this.sanguine);
            expect(this.player1).toHavePrompt('Action Window');
        });

        it('should let you dishonor a character with 1 or more glory as part of the cost', function() {
            this.player1.playAttachment(this.katana, this.kuwanan);
            this.player2.playAttachment(this.jade, this.toshimoko);
            this.player1.playAttachment(this.crane, this.kisada);
            this.player2.playAttachment(this.pacifism, this.whisperer);

            this.player1.clickCard(this.sanguine);
            expect(this.player1).toHavePrompt('Select character to dishonor');
            expect(this.player1).toBeAbleToSelect(this.kuwanan);
            expect(this.player1).not.toBeAbleToSelect(this.kisada);
            expect(this.player1).toBeAbleToSelect(this.whisperer);
            expect(this.player1).not.toBeAbleToSelect(this.toshimoko);
        });

        it('should let you choose a number of attachments equal to the glory of the dishonored character', function() {
            this.player1.playAttachment(this.katana, this.kuwanan);
            this.player2.playAttachment(this.jade, this.toshimoko);
            this.player1.playAttachment(this.crane, this.kisada);
            this.player2.playAttachment(this.pacifism, this.whisperer);

            this.player1.clickCard(this.sanguine);
            this.player1.clickCard(this.kuwanan);
            this.player1.clickCard(this.kuwanan);
            this.player1.clickPrompt('1');

            expect(this.player1).toHavePrompt('Select up to 3 attachments');

            this.player1.clickCard(this.katana);
            this.player1.clickCard(this.jade);
            this.player1.clickCard(this.pacifism);
            this.player1.clickCard(this.crane);

            expect(this.player1.player.promptState.selectedCards).toContain(this.katana);
            expect(this.player1.player.promptState.selectedCards).toContain(this.jade);
            expect(this.player1.player.promptState.selectedCards).toContain(this.pacifism);
            expect(this.player1.player.promptState.selectedCards).not.toContain(this.crane);
        });

        it('should discard the chosen attachments', function() {
            this.player1.playAttachment(this.katana, this.kuwanan);
            this.player2.playAttachment(this.jade, this.toshimoko);
            this.player1.playAttachment(this.crane, this.kisada);
            this.player2.playAttachment(this.pacifism, this.whisperer);

            this.player1.clickCard(this.sanguine);
            this.player1.clickCard(this.kuwanan);
            this.player1.clickCard(this.kuwanan);
            this.player1.clickPrompt('1');

            expect(this.player1).toHavePrompt('Select up to 3 attachments');
            this.player1.clickCard(this.katana);
            this.player1.clickCard(this.jade);
            this.player1.clickCard(this.pacifism);
            this.player1.clickPrompt('Done');

            expect(this.katana.location).toBe('conflict discard pile');
            expect(this.jade.location).toBe('conflict discard pile');
            expect(this.pacifism.location).toBe('conflict discard pile');

            expect(this.getChatLogs(5)).toContain('player1 plays Sanguine Mastery, dishonoring Doji Kuwanan to discard Fine Katana, Finger of Jade and Pacifism');
        });

        it('should not let you dishonor an honored character if Denmaru is in play', function() {
            this.kuwanan.honor();
            this.player2.moveCard(this.denmaru, 'play area');
            this.player1.playAttachment(this.katana, this.kuwanan);
            this.player2.playAttachment(this.jade, this.toshimoko);
            this.player1.playAttachment(this.crane, this.kisada);
            this.player2.playAttachment(this.pacifism, this.whisperer);

            this.player1.clickCard(this.sanguine);
            expect(this.player1).toHavePrompt('Select character to dishonor');
            expect(this.player1).not.toBeAbleToSelect(this.kuwanan);
            expect(this.player1).not.toBeAbleToSelect(this.kisada);
            expect(this.player1).toBeAbleToSelect(this.whisperer);
            expect(this.player1).not.toBeAbleToSelect(this.toshimoko);
        });

        it('should fail to initiate and remain in hand if your dishonored character loses their glory', function() {
            this.player1.moveCard(this.rumaru, 'play area');
            this.player1.playAttachment(this.katana, this.kuwanan);
            this.player2.playAttachment(this.jade, this.toshimoko);
            this.player1.playAttachment(this.crane, this.kisada);
            this.player2.playAttachment(this.pacifism, this.whisperer);

            this.player1.clickCard(this.sanguine);
            expect(this.player1).toBeAbleToSelect(this.whisperer);
            this.player1.clickCard(this.whisperer);
            this.player1.clickCard(this.kuwanan);
            this.player1.clickPrompt('1');

            expect(this.getChatLogs(5)).toContain('player1 attempted to use Sanguine Mastery, but there are insufficient legal targets');
            expect(this.sanguine.location).toBe('hand');
        });
    });
});
