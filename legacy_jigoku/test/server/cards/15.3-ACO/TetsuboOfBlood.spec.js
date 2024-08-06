describe('Tetsubo of Blood', function() {
    integration(function() {
        describe('Tetsubo of Blood\'s ability', function() {
            beforeEach(function() {
                this.setupTest({
                    phase: 'conflict',
                    player1: {
                        inPlay: ['doji-challenger', 'hantei-sotorii'],
                        hand: ['tetsubo-of-blood', 'way-of-the-crane']
                    },
                    player2: {
                        inPlay: ['bayushi-shoju'],
                        hand: ['for-shame','way-of-the-scorpion']
                    }
                });
                this.challenger = this.player1.findCardByName('doji-challenger');
                this.sotorii = this.player1.findCardByName('hantei-sotorii');
                this.challenger.fate = 1;
                this.sotorii.fate = 1;
                this.blood = this.player1.findCardByName('tetsubo-of-blood');
                this.crane = this.player1.findCardByName('way-of-the-crane');


                this.forshame = this.player2.findCardByName('for-shame');
                this.wots = this.player2.findCardByName('way-of-the-scorpion');
                this.shoju = this.player2.findCardByName('bayushi-shoju');

                this.noMoreActions();
            });

            it('it should prevent Pride from honoring if attached character wins a conflict', function() {
                this.initiateConflict({
                    type: 'military',
                    attackers: [this.sotorii],
                    defenders: [this.shoju]
                });

                this.player2.pass();
                this.player1.playAttachment(this.blood, this.sotorii);
                this.player1.clickCard(this.sotorii);
                this.player1.clickPrompt('1');
                this.player2.pass();
                this.player1.pass();
                expect(this.sotorii.isHonored).toBe(false);
            });

            it('should prevent going from DH to Neutral', function() {
                this.initiateConflict({
                    attackers: [this.challenger],
                    defenders: [this.shoju],
                    type: 'military'
                });

                this.player2.clickCard(this.wots);
                this.player2.clickCard(this.challenger);
                expect(this.challenger.isDishonored).toBe(true);
                this.player1.playAttachment(this.blood, this.challenger);
                this.player1.clickCard(this.sotorii);
                this.player1.clickPrompt('1');
                this.player2.pass();

                this.player1.clickCard(this.crane);
                expect(this.player1).toHavePrompt('Conflict Action Window');
            });


            it('should prevent going from Neutral to Honored', function() {
                this.initiateConflict({
                    attackers: [this.challenger],
                    defenders: [this.shoju],
                    type: 'military'
                });

                this.player2.pass();
                this.player1.playAttachment(this.blood, this.challenger);
                this.player1.clickCard(this.sotorii);
                this.player1.clickPrompt('1');
                this.player2.pass();

                this.player1.clickCard(this.crane);
                expect(this.player1).toHavePrompt('Conflict Action Window');
            });
        });
    });
});
