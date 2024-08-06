describe('Isawa Skycaller', function() {
    integration(function() {
        beforeEach(function() {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['isawa-skycaller'],
                    dynastyDiscard: ['doji-whisperer','kakita-kaezin']
                }
            });

            this.dojiWhisperer = this.player1.placeCardInProvince('doji-whisperer','province 1');
            this.kakitaKaezin = this.player1.placeCardInProvince('kakita-kaezin','province 2');
            this.skycaller = this.player1.findCardByName('isawa-skycaller');
        });

        it('should let you play characters as if they were in your hand during an air conflict', function() {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.skycaller],
                defenders: [],
                ring: 'air'
            });

            this.player2.pass();
            this.player1.clickCard(this.kakitaKaezin);
            expect(this.player1).toHavePrompt('Choose additional fate');
            this.player1.clickPrompt('2');
            expect(this.kakitaKaezin.location).toBe('play area');
            expect(this.kakitaKaezin.fate).toBe(2);
            expect(this.game.currentConflict.attackers).toContain(this.kakitaKaezin);

            expect(this.getChatLogs(3)).toContain('player1 plays Kakita Kaezin into the conflict with 2 additional fate');
        });

        it('should not let you play characters in a non air conflict', function() {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.skycaller],
                defenders: [],
                ring: 'earth'
            });

            this.player2.pass();
            this.player1.clickCard(this.kakitaKaezin);
            expect(this.player1).toHavePrompt('Conflict Action Window');
        });
    });
});
