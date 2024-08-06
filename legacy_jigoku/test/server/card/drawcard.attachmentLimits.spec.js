describe('When a card is attached', function() {
    integration(function() {
        beforeEach(function() {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['tattooed-wanderer'],
                    hand: ['ornate-fan','fine-katana','total-warfare']
                },
                player2: {
                    role: 'keeper-of-water',
                    provinces: ['pilgrimage','entrenched-position'],
                    inPlay: ['keeper-initiate'],
                    hand: ['honored-blade', 'total-warfare']
                }
            });
            this.testCharacter = this.player1.findCardByName('tattooed-wanderer');
            this.testProvince = this.player2.findCardByName('pilgrimage');
            this.ornateFan = this.player1.findCardByName('ornate-fan');
            this.fineKatana = this.player1.findCardByName('fine-katana');
            this.honoredBlade = this.player2.findCardByName('honored-blade');
            this.totalWarfare1 = this.player1.findCardByName('total-warfare');
            this.totalWarfare2 = this.player2.findCardByName('total-warfare');
            this.player1.playAttachment('ornate-fan',this.testCharacter);
            this.player2.pass();
        });

        describe('And it has the restricted keyword', function() {

            beforeEach(function() {
                this.player1.playAttachment(this.fineKatana, this.testCharacter);
            });

            it('should attach if the target has fewer than two restricted attachments', function() {
                expect(this.player2).toHavePrompt('Action Window');
                expect(this.testCharacter.attachments).toContain(this.fineKatana);
                expect(this.testCharacter.attachments).toContain(this.ornateFan);
            });

            describe ('And the target has at least two restricted attachments', function() {

                beforeEach(function() {
                    this.player2.playAttachment(this.honoredBlade, this.testCharacter);
                });

                it('should prompt the controller to discard a restricted attachment', function() {
                    expect(this.player1).toHavePrompt('Choose an attachment to discard');
                });

                describe('And the controller is prompted to discard an attachment', function() {
                    it('should permit the controller to discard their own attachments', function() {
                        expect(this.player1).toBeAbleToSelect(this.fineKatana);
                        expect(this.player1).toBeAbleToSelect(this.ornateFan);
                    });

                    it('should permit the controller to discard their opponent\'s attachments', function() {
                        expect(this.player1).toBeAbleToSelect(this.honoredBlade);
                    });
                });
            });

        });

        describe ('And it has a "limit 1" clause', function() {
            beforeEach(function() {
                this.player1.playAttachment(this.totalWarfare1,this.testProvince);
            });

            it('should attach if the limit will not be exceeded', function() {
                expect(this.player2).toHavePrompt('Action Window');
                expect(this.testProvince.attachments).toContain(this.totalWarfare1);
            });

            it('should remove the old attachment if the limit is exceeded', function() {
                this.player2.playAttachment(this.totalWarfare2,this.testProvince);
                expect(this.testProvince.attachments).toContain(this.totalWarfare2);
                expect(this.totalWarfare1.location).toBe('conflict discard pile');
            });
        });
    });
});
