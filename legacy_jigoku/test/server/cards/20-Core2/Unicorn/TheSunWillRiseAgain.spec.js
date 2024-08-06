describe('The Sun Will Rise Again', function () {
    integration(function () {
        beforeEach(function () {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['doji-whisperer', 'solemn-scholar', 'adept-of-the-waves'],
                    hand: ['the-sun-will-rise-again']
                },
                player2: {
                    inPlay: ['doji-kuwanan']
                }
            });

            this.whisperer = this.player1.findCardByName('doji-whisperer');
            this.scholar = this.player1.findCardByName('solemn-scholar');
            this.adeptOfTheWaves = this.player1.findCardByName('adept-of-the-waves');
            this.kuwanan = this.player2.findCardByName('doji-kuwanan');
            this.sun = this.player1.findCardByName('the-sun-will-rise-again');
        });

        it('extra mil', function () {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.whisperer],
                defenders: [this.kuwanan],
                type: 'military'
            });

            this.player2.pass();
            this.player1.pass();

            expect(this.player1.player.getConflictOpportunities()).toBe(1);
            expect(this.player1.player.getRemainingConflictOpportunitiesForType('military')).toBe(0);
            expect(this.player1.player.getRemainingConflictOpportunitiesForType('political')).toBe(1);

            expect(this.player1).toHavePrompt('Triggered Abilities');
            expect(this.player1).toBeAbleToSelect(this.sun);
            this.player1.clickCard(this.sun);

            expect(this.getChatLogs(10)).toContain(
                'player1 plays The Sun Will Rise Again to gain an additional military conflict this round. They will not forget this defeat.'
            );

            expect(this.player1.player.getConflictOpportunities()).toBe(2);
            expect(this.player1.player.getRemainingConflictOpportunitiesForType('military')).toBe(1);
            expect(this.player1.player.getRemainingConflictOpportunitiesForType('political')).toBe(1);
        });

        it('extra pol', function () {
            this.kuwanan.honor();
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.scholar],
                defenders: [this.kuwanan],
                type: 'political'
            });

            this.player2.pass();
            this.player1.pass();

            expect(this.player1.player.getConflictOpportunities()).toBe(1);
            expect(this.player1.player.getRemainingConflictOpportunitiesForType('military')).toBe(1);
            expect(this.player1.player.getRemainingConflictOpportunitiesForType('political')).toBe(0);

            expect(this.player1).toHavePrompt('Triggered Abilities');
            expect(this.player1).toBeAbleToSelect(this.sun);
            this.player1.clickCard(this.sun);

            expect(this.getChatLogs(10)).toContain(
                'player1 plays The Sun Will Rise Again to gain an additional political conflict this round. They will not forget this defeat.'
            );

            expect(this.player1.player.getConflictOpportunities()).toBe(2);
            expect(this.player1.player.getRemainingConflictOpportunitiesForType('military')).toBe(1);
            expect(this.player1.player.getRemainingConflictOpportunitiesForType('political')).toBe(1);
        });

        it('should not trigger if lost by <4', function () {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.scholar, this.adeptOfTheWaves],
                defenders: [this.kuwanan],
                type: 'military'
            });

            this.player2.pass();
            this.player1.pass();

            expect(this.player1).toHavePrompt('Action Window');
        });
    });
});
