describe('Yogo Junzo', function() {
    integration(function() {
        describe('Yogo Junzo\'s ability', function() {
            beforeEach(function() {
                this.setupTest({
                    phase: 'conflict',
                    player1: {
                        inPlay: ['yogo-junzo', 'young-rumormonger'],
                        fate:5
                    },
                    player2: {
                        inPlay: ['doji-whisperer', 'doji-challenger', 'yogo-junzo'],
                        fate: 10
                    }
                });

                this.junzo = this.player1.findCardByName('yogo-junzo');
                this.monger = this.player1.findCardByName('young-rumormonger');
                this.monger.fate = 3;

                this.dojiChallenger = this.player2.findCardByName('doji-challenger');
                this.dojiChallenger.fate = 2;
                this.junzo2 = this.player2.findCardByName('yogo-junzo');
                this.junzo2.fate = 1;
                this.dojiWhisperer = this.player2.findCardByName('doji-whisperer');
            });

            it('dire action', function() {
                this.player1.clickCard(this.junzo);
                expect(this.player1).toHavePrompt('Choose an ability:');
                this.player1.clickPrompt('Remove all fate from a character');
                expect(this.player1).toBeAbleToSelect(this.dojiChallenger);
                expect(this.player1).not.toBeAbleToSelect(this.dojiWhisperer);
                this.player1.clickCard(this.dojiChallenger);
                expect(this.dojiChallenger.fate).toBe(0);
            });

            it('should not let you use dire action when fated', function() {
                this.junzo.fate = 1;
                expect(this.junzo.fate).toBe(1);
                this.game.checkGameState(true);
                this.player1.clickCard(this.junzo);
                expect(this.player1).not.toBeAbleToSelect(this.dojiChallenger);
            });

            it('should let you move as much fate as you want', function() {
                let fate = this.player2.fate;
                this.player1.pass();
                this.player2.clickCard(this.junzo2);
                expect(this.player2).toBeAbleToSelect(this.dojiChallenger);
                expect(this.player2).not.toBeAbleToSelect(this.dojiWhisperer);
                expect(this.player2).not.toBeAbleToSelect(this.monger);
                expect(this.player2).not.toHavePrompt('Action Window');
                this.player2.clickCard(this.dojiChallenger);
                expect(this.player2).toHavePrompt('Select fate amount:');
                this.player2.clickPrompt('1');
                expect(this.player2.fate).toBe(fate + 1);
            });

            it('chat', function() {
                this.player1.pass();
                this.player2.clickCard(this.junzo2);
                this.player2.clickCard(this.dojiChallenger);
                this.player2.clickPrompt('1');
                expect(this.getChatLogs(2)).toContain('player2 chooses to move 1 fate from Doji Challenger to player2\'s pool');
            });

        });
    });
});
