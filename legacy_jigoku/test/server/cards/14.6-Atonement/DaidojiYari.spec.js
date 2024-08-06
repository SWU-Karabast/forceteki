describe('Kuni Wasteland', function() {
    integration(function() {
        describe('Kuni Wasteland\'s constant ability', function() {
            beforeEach(function() {
                this.setupTest({
                    phase: 'conflict',
                    player1: {
                        inPlay: ['iuchi-shahai', 'doji-challenger'],
                        hand: ['tattooed-wanderer']
                    },
                    player2: {
                        inPlay: ['doji-whisperer', 'ikoma-ikehata'],
                        hand: ['daidoji-yari']
                    }
                });
                this.shahai = this.player1.findCardByName('iuchi-shahai');
                this.wanderer = this.player1.findCardByName('tattooed-wanderer');
                this.challenger = this.player1.findCardByName('doji-challenger');
                this.provinceP1 = this.player1.findCardByName('shameful-display', 'province 1');

                this.ikehata = this.player2.findCardByName('ikoma-ikehata');
                this.whisperer = this.player2.findCardByName('doji-whisperer');
                this.yari = this.player2.findCardByName('daidoji-yari');
                this.province = this.player2.findCardByName('shameful-display', 'province 1');

                this.player1.pass();
                this.player2.playAttachment(this.yari, this.whisperer);
            });

            it('should do nothing if honor bids are equal', function() {
                this.player1.player.showBid = 5;
                this.player2.player.showBid = 5;
                this.noMoreActions();
                this.player1.clickRing('air');
                this.player1.clickCard(this.province);
                this.player1.clickCard(this.shahai);
                this.player1.clickPrompt('Initiate Conflict');
                expect(this.player1).toHavePrompt('Choose covert target for Iuchi Shahai');
            });

            it('should do nothing if your honor bid is higher', function() {
                this.player1.player.showBid = 4;
                this.player2.player.showBid = 5;
                this.noMoreActions();
                this.player1.clickRing('air');
                this.player1.clickCard(this.province);
                this.player1.clickCard(this.shahai);
                this.player1.clickPrompt('Initiate Conflict');
                expect(this.player1).toHavePrompt('Choose covert target for Iuchi Shahai');
            });

            it('should remove covert if your honor bid is lower (using post-declaration prompt)', function() {
                this.player1.player.showBid = 5;
                this.player2.player.showBid = 1;
                this.noMoreActions();
                this.player1.clickRing('air');
                this.player1.clickCard(this.province);
                this.player1.clickCard(this.shahai);
                this.player1.clickCard(this.whisperer);
                this.player1.clickPrompt('Initiate Conflict');
                expect(this.player1).not.toHavePrompt('Choose covert target for Iuchi Shahai');
                expect(this.player2).toHavePrompt('Choose defenders');
                this.player2.clickCard(this.whisperer);
                this.player2.clickPrompt('Done');
                expect(this.game.currentConflict.defenders).toContain(this.whisperer);
            });

            it('should remove covert if your honor bid is lower (using in-declaration prompt)', function() {
                this.player1.player.showBid = 5;
                this.player2.player.showBid = 1;
                this.noMoreActions();
                this.player1.clickRing('air');
                this.player1.clickCard(this.province);
                this.player1.clickCard(this.shahai);
                this.player1.clickPrompt('Initiate Conflict');
                expect(this.player1).not.toHavePrompt('Choose covert target for Iuchi Shahai');
                expect(this.player2).toHavePrompt('Choose defenders');
            });

            it('should remove covert that is added', function() {
                this.player1.player.showBid = 5;
                this.player2.player.showBid = 1;
                this.player1.clickCard(this.wanderer);
                this.player1.clickPrompt('Play Tattooed Wanderer as an attachment');
                this.player1.clickCard(this.challenger);
                this.noMoreActions();
                this.player1.clickRing('air');
                this.player1.clickCard(this.province);
                this.player1.clickCard(this.challenger);
                this.player1.clickCard(this.whisperer);
                this.player1.clickPrompt('Initiate Conflict');
                expect(this.player1).not.toHavePrompt('Choose covert target for Iuchi Shahai');
                expect(this.player2).toHavePrompt('Choose defenders');
                this.player2.clickCard(this.whisperer);
                this.player2.clickPrompt('Done');
                expect(this.game.currentConflict.defenders).toContain(this.whisperer);
            });

            it('should not remove covert if it is added to someone who has printed covert', function() {
                this.player1.player.showBid = 5;
                this.player2.player.showBid = 1;
                this.player1.clickCard(this.wanderer);
                this.player1.clickPrompt('Play Tattooed Wanderer as an attachment');
                this.player1.clickCard(this.shahai);
                this.noMoreActions();
                this.player1.clickRing('air');
                this.player1.clickCard(this.province);
                this.player1.clickCard(this.shahai);
                this.player1.clickPrompt('Initiate Conflict');
                expect(this.player1).toHavePrompt('Choose covert target for Iuchi Shahai');
                expect(this.player2).not.toHavePrompt('Choose defenders');
            });

            it('should not remove covert from characters you control', function() {
                this.player1.player.showBid = 5;
                this.player2.player.showBid = 1;
                this.noMoreActions();
                this.player1.passConflict();
                this.noMoreActions();
                this.player2.clickRing('air');
                this.player2.clickCard(this.provinceP1);
                this.player2.clickCard(this.ikehata);
                this.player2.clickPrompt('Initiate Conflict');
                expect(this.player2).toHavePrompt('Choose covert target for Ikoma Ikehata');
                this.player2.clickCard(this.shahai);

                expect(this.player1).toHavePrompt('Choose defenders');
                this.player1.clickCard(this.shahai);
                this.player1.clickPrompt('Done');
                expect(this.game.currentConflict.defenders).not.toContain(this.shahai);
            });
        });
    });
});
