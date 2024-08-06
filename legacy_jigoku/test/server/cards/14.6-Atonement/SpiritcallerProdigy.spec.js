describe('Spiritcaller Prodigy', function() {
    integration(function() {
        beforeEach(function() {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['spiritcaller-prodigy'],
                    dynastyDiscard: ['vice-proprietor', 'ikoma-tsanuri', 'kitsu-motso', 'ikoma-ujiaki'],
                    conflictDiscard: ['ageless-crone']
                },
                player2: {
                }
            });

            this.spiritcaller = this.player1.findCardByName('spiritcaller-prodigy');
            this.vice = this.player1.findCardByName('vice-proprietor');
            this.tsanuri = this.player1.findCardByName('ikoma-tsanuri');
            this.motso = this.player1.findCardByName('kitsu-motso');
            this.ujiaki = this.player1.findCardByName('ikoma-ujiaki');
            this.crone = this.player1.findCardByName('ageless-crone');
        });

        it('should allow targeting a lion character that costs 3 or less in your dynasty discard pile', function() {
            this.player1.clickCard(this.spiritcaller);
            expect(this.player1).not.toBeAbleToSelect(this.spiritcaller);
            expect(this.player1).not.toBeAbleToSelect(this.vice);
            expect(this.player1).toBeAbleToSelect(this.tsanuri);
            expect(this.player1).toBeAbleToSelect(this.motso);
            expect(this.player1).not.toBeAbleToSelect(this.ujiaki);
            expect(this.player1).not.toBeAbleToSelect(this.crone);
        });

        it('should sac the spiritcaller and put the target in play', function() {
            this.player1.clickCard(this.spiritcaller);
            this.player1.clickCard(this.tsanuri);

            expect(this.tsanuri.location).toBe('play area');
            expect(this.spiritcaller.location).toBe('conflict discard pile');
            expect(this.getChatLogs(5)).toContain('player1 uses Spiritcaller Prodigy, sacrificing Spiritcaller Prodigy to call Ikoma Tsanuri back from the dead');
        });
    });
});
