describe('Kuni Silencer', function () {
    integration(function () {
        beforeEach(function () {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['adept-of-the-waves']
                },
                player2: {
                    inPlay: ['kuni-silencer', 'kakita-toshimoko']
                }
            });
            this.game.rings['water'].claimRing(this.player1);
            this.game.rings['fire'].claimRing(this.player2);
            this.adept = this.player1.findCardByName('adept-of-the-waves');
            this.kuni = this.player2.findCardByName('kuni-silencer');
            this.toshimoko = this.player2.findCardByName('kakita-toshimoko');
            this.noMoreActions();
        });

        it('should trigger when it wins a conflict as the defender', function () {
            this.initiateConflict({
                type: 'military',
                attackers: [this.adept],
                defenders: [this.kuni]
            });
            this.noMoreActions();
            expect(this.player2).toBeAbleToSelect(this.kuni);
        });

        it('should not trigger when it wins a conflict as the attacker', function () {
            this.player1.passConflict();
            this.noMoreActions();
            this.initiateConflict({
                type: 'military',
                attackers: [this.kuni],
                defenders: [this.adept],
                ring: 'air'
            });
            this.noMoreActions();
            expect(this.player2).not.toHavePrompt('Triggered Abilities');
            expect(this.player2).toHavePrompt('Air Ring');
        });

        it('should not trigger when it loses a conflict', function () {
            this.initiateConflict({
                type: 'military',
                attackers: [this.adept],
                defenders: [this.kuni],
                ring: 'air'
            });
            this.kuni.bowed = true;
            this.noMoreActions();
            expect(this.player1).toHavePrompt('Air Ring');
        });

        it('should not trigger when a conflict is won that roving michibiku is not present at', function () {
            this.initiateConflict({
                type: 'military',
                attackers: [this.adept],
                defenders: [this.toshimoko]
            });
            this.noMoreActions();
            expect(this.player1).toHavePrompt('Action Window');
        });

        describe('when it is triggered', function () {
            beforeEach(function () {
                this.initiateConflict({
                    type: 'military',
                    attackers: [this.adept],
                    defenders: [this.kuni]
                });
                this.noMoreActions();
                this.player2.clickCard(this.kuni);
            });

            it('should take a ring from the opponent\'s claimed pool', function () {
                expect(this.player1).toHavePrompt('Choose a ring to return');
                this.player1.clickRing('water');
                expect(this.game.rings.water.claimed).toBe(false);
                expect(this.player1).toHavePrompt('Action Window');
            });

            it('should not be able to take from the unclaimed pool', function () {
                expect(this.player1).toHavePrompt('Choose a ring to return');
                this.player1.clickRing('earth');
                expect(this.player1).toHavePrompt('Choose a ring to return');
            });

            it('should not be able to take from the player\'s own claimed pool', function () {
                expect(this.player1).toHavePrompt('Choose a ring to return');
                this.player1.clickRing('fire');
                expect(this.player1).toHavePrompt('Choose a ring to return');
            });
        });
    });
});
