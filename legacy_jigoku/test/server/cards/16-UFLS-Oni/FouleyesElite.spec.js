describe('Fouleye\'s Elite', function () {
    integration(function () {
        beforeEach(function () {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['fouleye-s-elite', 'doji-whisperer']
                },
                player2: {
                    inPlay: ['daidoji-uji', 'marauding-oni']
                }
            });
            this.elite = this.player1.findCardByName('fouleye-s-elite');
            this.whisperer = this.player1.findCardByName('doji-whisperer');
            this.daidojiUji = this.player2.findCardByName('daidoji-uji');
            this.maraudingOni = this.player2.findCardByName('marauding-oni');
            this.noMoreActions();
        });

        it('should trigger and bow an opponent\'s character with equal to or lower military skill after winning a conflict', function () {
            this.initiateConflict({
                attackers: [this.elite],
                defenders: []
            });
            this.player2.pass();
            this.player1.pass();
            expect(this.player1).toHavePrompt('Triggered Abilities');
            expect(this.player1).toBeAbleToSelect(this.elite);
            this.player1.clickCard(this.elite);
            expect(this.player1).not.toBeAbleToSelect(this.elite);
            expect(this.player1).not.toBeAbleToSelect(this.whisperer);
            expect(this.player1).not.toBeAbleToSelect(this.daidojiUji);
            expect(this.player1).toBeAbleToSelect(this.maraudingOni);
            this.player1.clickCard(this.maraudingOni);
            expect(this.maraudingOni.bowed).toBe(true);
            expect(this.getChatLogs(5)).toContain('player1 uses Fouleye\'s Elite to bow Marauding Oni');
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
                attackers: [this.elite],
                defenders: [this.daidojiUji]
            });
            this.player2.pass();
            this.player1.pass();
            expect(this.player1).not.toHavePrompt('Triggered Abilities');
        });
    });
});
