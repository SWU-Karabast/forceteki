describe('Commune With the Spirits', function() {
    integration(function() {
        beforeEach(function() {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    hand: ['commune-with-the-spirits']
                },
                player2: {
                    inPlay: []
                }
            });

            this.spirits = this.player1.findCardByName('commune-with-the-spirits');
            this.game.rings.air.fate = 5;
            this.player1.claimRing('fire');
            this.player2.claimRing('water');
            this.game.checkGameState(true);
        });

        it('should prompt you to select an unclaimed ring', function() {
            this.player1.clickCard(this.spirits);
            expect(this.player1).toBeAbleToSelectRing('air');
            expect(this.player1).toBeAbleToSelectRing('earth');
            expect(this.player1).not.toBeAbleToSelectRing('fire');
            expect(this.player1).not.toBeAbleToSelectRing('water');
            expect(this.player1).toBeAbleToSelectRing('void');
        });

        it('should discard the fate and claim the ring as political', function() {
            let fate = this.player1.fate;
            this.player1.clickCard(this.spirits);
            this.player1.clickRing('air');
            expect(this.game.rings.air.conflictType).toBe('political');
            expect(this.game.rings.air.fate).toBe(0);
            expect(this.game.rings.air.isClaimed()).toBe(true);
            expect(this.player1.fate).toBe(fate - 1);
        });

        it('should not resolve the ring effect', function() {
            this.player1.clickCard(this.spirits);
            this.player1.clickRing('air');
            expect(this.player1).not.toHavePrompt('Air Ring');
            expect(this.getChatLogs(5)).toContain('player1 plays Commune with the Spirits to discard all fate from the Air Ring and claim it as a political ring');
        });
    });
});
