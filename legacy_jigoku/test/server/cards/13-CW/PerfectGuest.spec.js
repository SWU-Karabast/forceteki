describe('Perfect Guest', function() {
    integration(function() {
        describe('Perfect Guest\'s ability', function() {
            beforeEach(function() {
                this.setupTest({
                    phase: 'conflict',
                    player1: {
                        inPlay: ['perfect-guest'],
                        hand: ['finger-of-jade']
                    },
                    player2: {
                        hand: ['finger-of-jade']
                    }
                });
                this.guest = this.player1.findCardByName('perfect-guest');
                this.jade = this.player1.findCardByName('finger-of-jade');
                this.jade2 = this.player2.findCardByName('finger-of-jade');

                this.player1.playAttachment(this.jade, this.guest);
                this.player2.pass();
            });

            it('should switch sides', function() {
                expect(this.jade.location).toBe('play area');
                expect(this.player1).toHavePrompt('Action Window');
                this.player1.clickCard(this.guest);
                expect(this.guest.controller).toBe(this.player2.player);
                expect(this.player2).toHavePrompt('Action Window');
                expect(this.jade.location).toBe('conflict discard pile');
            });

            it('should properly switch sides during a conflict', function() {
                this.player1.pass();
                this.initiateConflict({
                    type: 'political',
                    attackers: [this.guest],
                    defenders: []
                });

                this.player2.pass();
                this.player1.clickCard(this.guest);
                expect(this.guest.controller).toBe(this.player2.player);
                expect(this.player2).toHavePrompt('Conflict Action Window');
                expect(this.getChatLogs(2)).toContain('Political Air conflict - Attacker: 0 Defender: 3');
            });

            it('should not be able to switch back', function() {
                this.player1.pass();
                this.initiateConflict({
                    type: 'political',
                    attackers: [this.guest],
                    defenders: []
                });

                this.player2.pass();
                this.player1.clickCard(this.guest);
                expect(this.guest.controller).toBe(this.player2.player);
                expect(this.player2).toHavePrompt('Conflict Action Window');
                expect(this.getChatLogs(2)).toContain('Political Air conflict - Attacker: 0 Defender: 3');
                this.player2.clickCard(this.guest);
                expect(this.guest.controller).toBe(this.player2.player);
                expect(this.player2).toHavePrompt('Conflict Action Window');
                expect(this.getChatLogs(2)).toContain('Political Air conflict - Attacker: 0 Defender: 3');
            });
        });

        describe('Perfect Guest\'s ability - round reset', function() {
            beforeEach(function() {
                this.setupTest({
                    phase: 'fate',
                    player1: {
                        inPlay: ['perfect-guest']
                    },
                    player2: {
                    }
                });
                this.guest = this.player1.findCardByName('perfect-guest');
            });

            it('should reset at the end of the round', function() {
                this.player1.clickCard(this.guest);
                expect(this.guest.controller).toBe(this.player2.player);
                expect(this.player2).toHavePrompt('Action Window');
                this.player2.clickCard(this.guest);
                expect(this.guest.controller).toBe(this.player2.player);
                expect(this.player2).toHavePrompt('Action Window');

                this.noMoreActions();
                this.player1.clickPrompt('Done');
                this.player2.clickPrompt('Done');
                this.player2.clickPrompt('End Round');
                this.player1.clickPrompt('End Round');

                expect(this.player2).toHavePrompt('Play cards from provinces');
                this.player2.clickCard(this.guest);
                expect(this.guest.controller).toBe(this.player1.player);
                expect(this.player1).toHavePrompt('Play cards from provinces');
                this.player1.clickCard(this.guest);
                expect(this.guest.controller).toBe(this.player1.player);
                expect(this.player1).toHavePrompt('Play cards from provinces');
            });
        });
    });
});
