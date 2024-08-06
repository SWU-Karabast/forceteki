describe('Resourceful Maho Tsukai', function() {
    integration(function() {
        describe('Resourceful Maho Tsukai\'s ability', function() {
            beforeEach(function() {
                this.setupTest({
                    phase: 'conflict',
                    player1: {
                        fate: 1,
                        honor: 9,
                        inPlay: ['resourceful-maho-tsukai', 'hida-kisada'],
                        hand: ['force-of-the-river', 'darkness-rising', 'shadow-steed', 'fine-katana']
                    },
                    player2: {
                        honor:10,
                        inPlay: ['kudaka']
                    }
                });

                this.maho = this.player1.findCardByName('resourceful-maho-tsukai');
                this.maho.dishonor();
                this.maho.fate = 1;
                this.river = this.player1.findCardByName('force-of-the-river');
                this.kisada = this.player1.findCardByName('hida-kisada');
                this.rising = this.player1.findCardByName('darkness-rising');
                this.steed = this.player1.findCardByName('shadow-steed');
                this.katana = this.player1.findCardByName('fine-katana');
                this.kudaka = this.player2.findCardByName('kudaka');
            });

            it('should reduce the cost of playing maho cards', function() {
                this.player1.clickCard(this.steed);
                this.player1.clickCard(this.maho);
                expect(this.maho.fate).toBe(1);
            });

            it('should not reduce the cost of non-maho', function() {
                this.player1.playAttachment(this.river, this.maho);
                expect(this.player1.fate).toBe(0);
            });

            it('should not work when character is not dishonored', function() {
                this.maho.honor();
                this.player1.playAttachment(this.steed, this.maho);
                this.player1.clickCard(this.maho);
                this.player1.clickPrompt('1');
                expect(this.maho.fate).toBe(0);
            });

            it('should work when the character has 1 fate and wants to play a 2 fate maho card', function() {
                this.noMoreActions();
                this.initiateConflict({
                    type: 'military',
                    attackers: [this.maho, this.kisada],
                    defenders: [this.kudaka]
                });
                this.player2.pass();
                this.player1.clickCard(this.rising);
                expect(this.player1).toHavePrompt('Select character to dishonor');
                this.player1.clickCard(this.kisada);
                this.player1.clickCard(this.maho);
                this.player1.clickPrompt('1');
                expect(this.maho.fate).toBe(0);
                expect(this.kisada.isDishonored).toBe(true);
                expect(this.kudaka.bowed).toBe(true);
                expect(this.player2).toHavePrompt('Conflict Action Window');
            });

            it('can only have attachments that are spell or shadowlands', function() {
                this.player1.clickCard(this.katana);
                this.player1.clickCard(this.maho);
                expect(this.player1).toHavePrompt('Choose a card');
            });
        });
    });
});
