describe('An Agreeable Arrangement', function() {
    integration(function() {
        describe('An Agreeable Arrangement\'s ability', function() {
            beforeEach(function() {
                this.setupTest({
                    phase: 'dynasty',
                    player1: {
                        inPlay: ['akodo-toturi', 'ikoma-prodigy', 'doji-challenger'],
                        dynastyDiscard: ['an-agreeable-arrangement']
                    },
                    player2: {
                        inPlay: ['hida-kisada', 'kaiu-shuichi'],
                        dynastyDiscard: ['akodo-toturi'],
                        hand: ['soul-beyond-reproach']
                    }
                });

                this.akodoToturi = this.player1.findCardByName('akodo-toturi');
                this.ikomaProdigy = this.player1.findCardByName('ikoma-prodigy');
                this.challenger = this.player1.findCardByName('doji-challenger');
                this.arrangement = this.player1.findCardByName('an-agreeable-arrangement', 'dynasty discard pile');

                this.player1.placeCardInProvince(this.arrangement, 'province 2');

                this.hidaKisada = this.player2.findCardByName('hida-kisada');
                this.toturi2 = this.player2.findCardByName('akodo-toturi');
                this.kaiuShuichi = this.player2.findCardByName('kaiu-shuichi');
                this.sbr = this.player2.findCardByName('soul-beyond-reproach');
                this.arrangement.facedown = false;
                this.challenger.bowed = true;
                this.game.checkGameState(true);
            });

            it('should prompt you to bow a non-champion', function() {
                this.player1.clickCard(this.arrangement);
                expect(this.player1).toHavePrompt('Bow a non-champion');
                expect(this.player1).not.toBeAbleToSelect(this.hidaKisada);
                expect(this.player1).toBeAbleToSelect(this.kaiuShuichi);
            });

            it('should prompt you to give ready >=2 fate character to your opponent', function() {
                this.player1.clickCard(this.arrangement);
                this.player1.clickCard(this.kaiuShuichi);
                expect(this.player1).toHavePrompt('Choose a card to give to your opponent');
                expect(this.player1).toBeAbleToSelect(this.akodoToturi);
                expect(this.player1).not.toBeAbleToSelect(this.ikomaProdigy);
                expect(this.player1).not.toBeAbleToSelect(this.challenger);
            });

            it('should give control of the character to your opponent and bow the chosen character', function() {
                expect(this.akodoToturi.controller).toBe(this.player1.player);
                this.player1.clickCard(this.arrangement);
                this.player1.clickCard(this.kaiuShuichi);
                this.player1.clickCard(this.akodoToturi);
                expect(this.akodoToturi.controller).toBe(this.player2.player);
                expect(this.kaiuShuichi.bowed).toBe(true);
                this.player2.clickCard(this.sbr);
                expect(this.player2).toBeAbleToSelect(this.akodoToturi);
                expect(this.player2).toBeAbleToSelect(this.kaiuShuichi);
                expect(this.player2).toBeAbleToSelect(this.hidaKisada);
                expect(this.player2).not.toBeAbleToSelect(this.challenger);
            });

            it('chat messages', function() {
                this.player1.clickCard(this.arrangement);
                this.player1.clickCard(this.kaiuShuichi);
                this.player1.clickCard(this.akodoToturi);
                expect(this.getChatLogs(3)).toContain('player1 plays An Agreeable Arrangement, giving player2 control of Akodo Toturi to bow Kaiu Shuichi');
            });

            it('edge case - should not be able to give a unique the opponent already controls', function() {
                this.player2.moveCard(this.toturi2, 'play area');
                this.challenger.bowed = false;
                this.game.checkGameState(true);
                this.player1.clickCard(this.arrangement);
                this.player1.clickCard(this.kaiuShuichi);
                expect(this.player1).not.toBeAbleToSelect(this.akodoToturi);
                expect(this.player1).not.toBeAbleToSelect(this.ikomaProdigy);
                expect(this.player1).toBeAbleToSelect(this.challenger);
            });
        });
    });
});
