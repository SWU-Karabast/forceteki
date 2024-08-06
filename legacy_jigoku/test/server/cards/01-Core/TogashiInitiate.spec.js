describe('Togashi Initiate', function() {
    integration(function() {
        beforeEach(function() {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['togashi-initiate']
                },
                player2: {
                    inPlay: ['border-rider']
                }
            });
            this.initiate = this.player1.findCardByName('togashi-initiate');
            this.borderRider = this.player2.findCardByName('border-rider');
        });

        it('should allow you to honor when attacking', function() {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.initiate],
                defenders: []
            });

            this.player2.pass();
            this.player1.clickCard(this.initiate);
            this.player1.clickRing('water');
            expect(this.getChatLogs(3)).toContain('player1 uses Togashi Initiate, placing 1 fate on the Water Ring to honor Togashi Initiate');
        });

        it('should not work on defense', function() {
            this.noMoreActions();
            this.player1.passConflict();
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.borderRider],
                defenders: [this.initiate]
            });

            expect(this.player1).toHavePrompt('Conflict Action Window');
            this.player1.clickCard(this.initiate);
            expect(this.player1).toHavePrompt('Conflict Action Window');
        });
    });
});
