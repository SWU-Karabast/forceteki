describe('Isawa Pilgrim', function() {
    integration(function() {
        describe('Isawa Pilgrim\'s ability', function() {
            beforeEach(function() {
                this.setupTest({
                    phase: 'conflict',
                    player1: {
                        inPlay: ['isawa-pilgrim'],
                        hand: ['finger-of-jade']
                    },
                    player2: {
                        hand: ['finger-of-jade']
                    }
                });
                this.pilgrim = this.player1.findCardByName('isawa-pilgrim');
                this.jade = this.player1.findCardByName('finger-of-jade');
                this.jade2 = this.player2.findCardByName('finger-of-jade');

                this.player1.playAttachment(this.jade, this.pilgrim);
                this.player2.pass();
            });

            it('should do nothing if your opponent doesn\'t have the water ring', function() {
                expect(this.player1).toHavePrompt('Action Window');
                this.player1.clickCard(this.pilgrim);
                expect(this.player1).toHavePrompt('Action Window');
            });

            it('should switch sides if your opponent has the water ring', function() {
                this.player2.claimRing('water');
                this.game.checkGameState(true);
                expect(this.jade.location).toBe('play area');
                expect(this.player1).toHavePrompt('Action Window');
                this.player1.clickCard(this.pilgrim);
                expect(this.pilgrim.controller).toBe(this.player2.player);
                expect(this.player2).toHavePrompt('Action Window');
                expect(this.jade.location).toBe('conflict discard pile');
            });

            it('should properly switch sides during a conflict', function() {
                this.player2.claimRing('water');
                this.player1.pass();
                this.initiateConflict({
                    type: 'political',
                    attackers: [this.pilgrim],
                    defenders: []
                });

                this.player2.pass();
                this.player1.clickCard(this.pilgrim);
                expect(this.pilgrim.controller).toBe(this.player2.player);
                expect(this.player2).toHavePrompt('Conflict Action Window');
                expect(this.getChatLogs(2)).toContain('Political Air conflict - Attacker: 0 Defender: 2');
            });

            it('should be able to switch back', function() {
                this.player2.claimRing('water');
                this.player1.pass();
                this.initiateConflict({
                    type: 'political',
                    attackers: [this.pilgrim],
                    defenders: []
                });

                this.player2.pass();
                this.player1.clickCard(this.pilgrim);
                expect(this.pilgrim.controller).toBe(this.player2.player);
                expect(this.player2).toHavePrompt('Conflict Action Window');
                expect(this.getChatLogs(2)).toContain('Political Air conflict - Attacker: 0 Defender: 2');
                this.player1.claimRing('water');
                this.game.checkGameState(true);
                this.player2.clickCard(this.pilgrim);
                expect(this.pilgrim.controller).toBe(this.player1.player);
                expect(this.player1).toHavePrompt('Conflict Action Window');
                expect(this.getChatLogs(2)).toContain('Political Air conflict - Attacker: 2 Defender: 0');
            });
        });
    });
});
