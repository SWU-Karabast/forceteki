describe('Venerable Fortunist', function() {
    integration(function() {
        beforeEach(function() {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['venerable-fortunist'],
                    role: 'keeper-of-air'
                },
                player2: {
                }
            });

            this.fortunist = this.player1.findCardByName('venerable-fortunist');
        });

        it('should not work if you don\'t have any rings claimed', function() {
            expect(this.player1).toHavePrompt('Action Window');
            this.player1.clickCard(this.fortunist);
            expect(this.player1).toHavePrompt('Action Window');
        });

        it('should not work if you have claimed rings that aren\'t your role', function() {
            this.player1.claimRing('earth');
            this.player1.claimRing('fire');
            this.player1.claimRing('void');
            this.player1.claimRing('water');
            expect(this.player1).toHavePrompt('Action Window');
            this.player1.clickCard(this.fortunist);
            expect(this.player1).toHavePrompt('Action Window');
        });

        it('should work if you have claimed the ring of your role and force you to return that ring', function() {
            this.player1.claimRing('air');
            this.player1.claimRing('earth');
            this.player1.claimRing('fire');
            this.player1.claimRing('void');
            this.player1.claimRing('water');
            expect(this.player1).toHavePrompt('Action Window');
            this.player1.clickCard(this.fortunist);
            expect(this.player1).toHavePrompt('Choose a ring to return');
            expect(this.player1).toBeAbleToSelectRing('air');
            expect(this.player1).not.toBeAbleToSelectRing('earth');
            expect(this.player1).not.toBeAbleToSelectRing('fire');
            expect(this.player1).not.toBeAbleToSelectRing('void');
            expect(this.player1).not.toBeAbleToSelectRing('water');

            let fate = this.player1.fate;
            this.player1.clickRing('air');
            expect(this.player1.fate).toBe(fate + 2);
            expect(this.getChatLogs(1)).toContain('player1 uses Venerable Fortunist, returning the Air Ring to gain 2 fate');
        });
    });
});
