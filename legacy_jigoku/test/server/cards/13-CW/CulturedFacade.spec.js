describe('Cultured Facade', function() {
    integration(function() {
        beforeEach(function() {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['kakita-yoshi', 'doji-fumiki'],
                    hand: ['way-of-the-scorpion']
                },
                player2: {
                    inPlay: ['doji-whisperer', 'doji-challenger', 'kakita-toshimoko'],
                    hand: ['cultured-facade', 'way-of-the-scorpion'],
                    dynastyDiscard: ['favorable-ground']
                }
            });

            this.yoshi = this.player1.findCardByName('kakita-yoshi');
            this.fumiki = this.player1.findCardByName('doji-fumiki');
            this.scorpion1 = this.player1.findCardByName('way-of-the-scorpion');
            this.dojiWhisperer = this.player2.findCardByName('doji-whisperer');
            this.challenger = this.player2.findCardByName('doji-challenger');
            this.toshimoko = this.player2.findCardByName('kakita-toshimoko');
            this.scorpion2 = this.player2.findCardByName('way-of-the-scorpion');
            this.facade = this.player2.findCardByName('cultured-facade');
            this.fg = this.player2.placeCardInProvince('favorable-ground', 'province 1');
            this.fg.facedown = false;

            this.player1.player.showBid = 3;
            this.player2.player.showBid = 3;
        });

        it('should not work outside of conflicts', function() {
            this.player1.pass();
            expect(this.player2).toHavePrompt('Action Window');
            this.player2.clickCard(this.facade);
            expect(this.player2).toHavePrompt('Action Window');
        });

        it('should blanket target everyone', function() {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.yoshi, this.fumiki],
                defenders: [this.dojiWhisperer, this.challenger],
                type: 'political'
            });
            this.player2.clickCard(this.facade);

            expect(this.getChatLogs(3)).toContain('player2 plays Cultured Facade to prevent characters from being targetted by events played by players with a higher bid value than that of the character\'s controller');
        });

        it('should do nothing if honor bids are equal', function() {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.yoshi, this.fumiki],
                defenders: [this.dojiWhisperer, this.challenger],
                type: 'political'
            });
            this.player2.clickCard(this.facade);

            this.player1.clickCard(this.scorpion1);
            expect(this.player1).toBeAbleToSelect(this.yoshi);
            expect(this.player1).toBeAbleToSelect(this.fumiki);
            expect(this.player1).toBeAbleToSelect(this.dojiWhisperer);
            expect(this.player1).toBeAbleToSelect(this.challenger);
            expect(this.player1).not.toBeAbleToSelect(this.toshimoko);

            this.player1.clickPrompt('Cancel');
            this.player1.pass();

            this.player2.clickCard(this.scorpion2);
            expect(this.player2).toBeAbleToSelect(this.yoshi);
            expect(this.player2).toBeAbleToSelect(this.fumiki);
            expect(this.player2).toBeAbleToSelect(this.dojiWhisperer);
            expect(this.player2).toBeAbleToSelect(this.challenger);
            expect(this.player2).not.toBeAbleToSelect(this.toshimoko);
        });

        it('should prevent targeting opponent\'s characters if your bid is higher', function() {
            this.player1.player.showBid = 5;
            this.player2.player.showBid = 3;

            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.yoshi, this.fumiki],
                defenders: [this.dojiWhisperer, this.challenger],
                type: 'political'
            });
            this.player2.clickCard(this.facade);

            this.player1.clickCard(this.scorpion1);
            expect(this.player1).toBeAbleToSelect(this.yoshi);
            expect(this.player1).toBeAbleToSelect(this.fumiki);
            expect(this.player1).not.toBeAbleToSelect(this.dojiWhisperer);
            expect(this.player1).not.toBeAbleToSelect(this.challenger);
            expect(this.player1).not.toBeAbleToSelect(this.toshimoko);

            this.player1.clickPrompt('Cancel');
            this.player1.pass();

            this.player2.clickCard(this.scorpion2);
            expect(this.player2).toBeAbleToSelect(this.yoshi);
            expect(this.player2).toBeAbleToSelect(this.fumiki);
            expect(this.player2).toBeAbleToSelect(this.dojiWhisperer);
            expect(this.player2).toBeAbleToSelect(this.challenger);
            expect(this.player2).not.toBeAbleToSelect(this.toshimoko);
        });

        it('should prevent targeting opponent\'s characters if your bid is higher', function() {
            this.player1.player.showBid = 3;
            this.player2.player.showBid = 5;

            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.yoshi, this.fumiki],
                defenders: [this.dojiWhisperer, this.challenger],
                type: 'political'
            });
            this.player2.clickCard(this.facade);

            this.player1.clickCard(this.scorpion1);
            expect(this.player1).toBeAbleToSelect(this.yoshi);
            expect(this.player1).toBeAbleToSelect(this.fumiki);
            expect(this.player1).toBeAbleToSelect(this.dojiWhisperer);
            expect(this.player1).toBeAbleToSelect(this.challenger);
            expect(this.player1).not.toBeAbleToSelect(this.toshimoko);

            this.player1.clickPrompt('Cancel');
            this.player1.pass();

            this.player2.clickCard(this.scorpion2);
            expect(this.player2).not.toBeAbleToSelect(this.yoshi);
            expect(this.player2).not.toBeAbleToSelect(this.fumiki);
            expect(this.player2).toBeAbleToSelect(this.dojiWhisperer);
            expect(this.player2).toBeAbleToSelect(this.challenger);
            expect(this.player2).not.toBeAbleToSelect(this.toshimoko);
        });

        it('should not effect characters that weren\'t present when the card was played', function() {
            this.player1.player.showBid = 5;
            this.player2.player.showBid = 3;

            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.yoshi, this.fumiki],
                defenders: [this.dojiWhisperer, this.challenger],
                type: 'political'
            });
            this.player2.clickCard(this.facade);
            this.player1.pass();
            this.player2.clickCard(this.fg);
            this.player2.clickCard(this.toshimoko);

            this.player1.clickCard(this.scorpion1);
            expect(this.player1).toBeAbleToSelect(this.yoshi);
            expect(this.player1).toBeAbleToSelect(this.fumiki);
            expect(this.player1).not.toBeAbleToSelect(this.dojiWhisperer);
            expect(this.player1).not.toBeAbleToSelect(this.challenger);
            expect(this.player1).toBeAbleToSelect(this.toshimoko);
        });
    });
});
