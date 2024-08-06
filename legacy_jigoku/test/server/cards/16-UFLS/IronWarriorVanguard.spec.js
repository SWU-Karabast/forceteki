describe('Iron Warrior Vanguard', function () {
    integration(function () {
        beforeEach(function () {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['iron-warrior-vanguard', 'shiba-tsukune']
                },
                player2: {
                    inPlay: ['daidoji-uji', 'marauding-oni']
                }
            });
            this.vanguard = this.player1.findCardByName('iron-warrior-vanguard');
            this.shibaTsukune = this.player1.findCardByName('shiba-tsukune');
            this.daidojiUji = this.player2.findCardByName('daidoji-uji');
            this.maraudingOni = this.player2.findCardByName('marauding-oni');
            this.noMoreActions();
        });

        it('should trigger and honor a character after winning a conflict', function () {
            this.initiateConflict({
                attackers: [this.vanguard],
                defenders: []
            });
            this.player2.pass();
            this.player1.pass();
            expect(this.player1).toHavePrompt('Triggered Abilities');
            expect(this.player1).toBeAbleToSelect(this.vanguard);
            this.player1.clickCard(this.vanguard);
            expect(this.player1).toBeAbleToSelect(this.vanguard);
            expect(this.player1).toBeAbleToSelect(this.shibaTsukune);
            expect(this.player1).toBeAbleToSelect(this.daidojiUji);
            expect(this.player1).not.toBeAbleToSelect(this.maraudingOni);
            this.player1.clickCard(this.shibaTsukune);
            expect(this.shibaTsukune.isHonored).toBe(true);
            expect(this.getChatLogs(5)).toContain('player1 uses Iron Warrior Vanguard to honor Shiba Tsukune');
        });

        it('should not trigger if not participating', function () {
            this.initiateConflict({
                attackers: [this.shibaTsukune],
                defenders: []
            });
            this.player2.pass();
            this.player1.pass();
            expect(this.player1).not.toHavePrompt('Triggered Abilities');
        });

        it('should not trigger after losing the conflict', function () {
            this.initiateConflict({
                attackers: [this.vanguard],
                defenders: [this.daidojiUji]
            });
            this.player2.pass();
            this.player1.pass();
            expect(this.player1).not.toHavePrompt('Triggered Abilities');
        });
    });
});
