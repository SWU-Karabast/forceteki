describe('Onikage Rider', function () {
    integration(function () {
        beforeEach(function () {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['onikage-rider', 'doji-whisperer']
                },
                player2: {
                    inPlay: ['daidoji-uji', 'marauding-oni']
                }
            });
            this.rider = this.player1.findCardByName('onikage-rider');
            this.whisperer = this.player1.findCardByName('doji-whisperer');
            this.daidojiUji = this.player2.findCardByName('daidoji-uji');
            this.maraudingOni = this.player2.findCardByName('marauding-oni');
            this.noMoreActions();
        });

        it('should trigger and bow an opponent\'s character with equal to or lower military skill after winning a conflict', function () {
            this.initiateConflict({
                attackers: [this.rider],
                defenders: []
            });
            this.player2.pass();
            this.player1.pass();
            expect(this.player1).toHavePrompt('Triggered Abilities');
            expect(this.player1).toBeAbleToSelect(this.rider);
            this.player1.clickCard(this.rider);
            expect(this.player2.player.dynastyDiscardPile.size()).toBe(4);
            expect(this.player1.player.dynastyDiscardPile.size()).toBe(0);
            expect(this.getChatLogs(5)).toContain('player1 uses Onikage Rider to discard Adept of the Waves, Adept of the Waves, Adept of the Waves and Adept of the Waves');
        });

        it('should not trigger if not participating', function () {
            this.initiateConflict({
                attackers: [this.whisperer],
                defenders: [],
                type: 'political'
            });
            this.player2.pass();
            this.player1.pass();
            expect(this.player1).not.toHavePrompt('Triggered Abilities');
        });

        it('should not trigger after losing the conflict', function () {
            this.initiateConflict({
                attackers: [this.rider],
                defenders: [this.daidojiUji]
            });
            this.player2.pass();
            this.player1.pass();
            expect(this.player1).not.toHavePrompt('Triggered Abilities');
        });
    });
});
