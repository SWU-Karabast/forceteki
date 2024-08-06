describe('Shori', function() {
    integration(function() {
        beforeEach(function () {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['ikoma-prodigy', 'akodo-toturi', 'ikoma-ikehata', 'doji-kuwanan'],
                    hand: ['shori']
                },
                player2: {
                    inPlay: ['matsu-tsuko-2'],
                    hand: ['let-go']
                }
            });

            this.kuwanan = this.player1.findCardByName('doji-kuwanan');
            this.prodigy = this.player1.findCardByName('ikoma-prodigy');
            this.toturi = this.player1.findCardByName('akodo-toturi');
            this.ikehata = this.player1.findCardByName('ikoma-ikehata');
            this.shori = this.player1.findCardByName('shori');
            this.letGo = this.player2.findCardByName('let-go');
            this.tsuko = this.player2.findCardByName('matsu-tsuko-2');
        });

        it('should only attach to unique lion characters', function () {
            this.player1.clickCard(this.shori);
            expect(this.player1).not.toBeAbleToSelect(this.kuwanan);
            expect(this.player1).not.toBeAbleToSelect(this.prodigy);
            expect(this.player1).toBeAbleToSelect(this.toturi);
            expect(this.player1).toBeAbleToSelect(this.ikehata);
            expect(this.player1).toBeAbleToSelect(this.tsuko);
        });

        it('should grant you a military conflict while on a champion', function () {
            let conflicts = this.player1.player.getConflictOpportunities();
            let milConflicts = this.player1.player.getRemainingConflictOpportunitiesForType('military');
            this.player1.playAttachment(this.shori, this.toturi);
            expect(this.player1.player.getConflictOpportunities()).toBe(conflicts + 1);
            expect(this.player1.player.getRemainingConflictOpportunitiesForType('military')).toBe(milConflicts + 1);
        });

        it('should grant your opponent a military conflict while on their champion', function () {
            let conflicts = this.player1.player.getConflictOpportunities();
            let milConflicts = this.player1.player.getRemainingConflictOpportunitiesForType('military');
            let conflicts2 = this.player2.player.getConflictOpportunities();
            let milConflicts2 = this.player2.player.getRemainingConflictOpportunitiesForType('military');

            this.player1.playAttachment(this.shori, this.tsuko);
            expect(this.player1.player.getConflictOpportunities()).toBe(conflicts);
            expect(this.player1.player.getRemainingConflictOpportunitiesForType('military')).toBe(milConflicts);
            expect(this.player2.player.getConflictOpportunities()).toBe(conflicts2 + 1);
            expect(this.player2.player.getRemainingConflictOpportunitiesForType('military')).toBe(milConflicts2 + 1);
        });

        it('should not grant you a military conflict while on a non-champion', function () {
            let conflicts = this.player1.player.getConflictOpportunities();
            let milConflicts = this.player1.player.getRemainingConflictOpportunitiesForType('military');
            this.player1.playAttachment(this.shori, this.ikehata);
            expect(this.player1.player.getConflictOpportunities()).toBe(conflicts);
            expect(this.player1.player.getRemainingConflictOpportunitiesForType('military')).toBe(milConflicts);
        });

        it('should remove the granted conflict when discarded', function () {
            let conflicts = this.player1.player.getConflictOpportunities();
            let milConflicts = this.player1.player.getRemainingConflictOpportunitiesForType('military');
            this.player1.playAttachment(this.shori, this.toturi);
            this.player2.clickCard(this.letGo);
            this.player2.clickCard(this.shori);
            expect(this.player1.player.getConflictOpportunities()).toBe(conflicts);
            expect(this.player1.player.getRemainingConflictOpportunitiesForType('military')).toBe(milConflicts);
        });

        it('should use the bonus conflict last', function () {
            let conflicts = this.player1.player.getConflictOpportunities();
            let milConflicts = this.player1.player.getRemainingConflictOpportunitiesForType('military');
            this.player1.playAttachment(this.shori, this.toturi);
            this.noMoreActions();
            this.initiateConflict({
                type: 'military',
                attackers: [this.prodigy],
                defenders: []
            });
            this.noMoreActions();
            this.player1.pass();
            this.player2.clickCard(this.letGo);
            this.player2.clickCard(this.shori);
            expect(this.player1.player.getConflictOpportunities()).toBe(conflicts - 1);
            expect(this.player1.player.getRemainingConflictOpportunitiesForType('military')).toBe(milConflicts - 1);
        });
    });
});
