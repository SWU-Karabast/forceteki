describe('Shambling Servant', function () {
    integration(function () {
        beforeEach(function () {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['shambling-servant', 'doji-whisperer']
                },
                player2: {
                    inPlay: ['daidoji-uji', 'marauding-oni']
                }
            });
            this.servant = this.player1.findCardByName('shambling-servant');
            this.whisperer = this.player1.findCardByName('doji-whisperer');
            this.daidojiUji = this.player2.findCardByName('daidoji-uji');
            this.maraudingOni = this.player2.findCardByName('marauding-oni');
            this.noMoreActions();
        });

        it('should trigger and taint a participating character after winning a conflict', function () {
            this.initiateConflict({
                attackers: [this.servant, this.whisperer],
                defenders: [this.daidojiUji]
            });
            this.daidojiUji.bow();
            this.player2.pass();
            this.player1.pass();
            expect(this.player1).toHavePrompt('Triggered Abilities');
            expect(this.player1).toBeAbleToSelect(this.servant);
            this.player1.clickCard(this.servant);
            expect(this.player1).toBeAbleToSelect(this.servant);
            expect(this.player1).toBeAbleToSelect(this.whisperer);
            expect(this.player1).toBeAbleToSelect(this.daidojiUji);
            expect(this.player1).not.toBeAbleToSelect(this.maraudingOni);
            this.player1.clickCard(this.whisperer);
            expect(this.whisperer.isTainted).toBe(true);
            expect(this.getChatLogs(5)).toContain('player1 uses Shambling Servant to taint Doji Whisperer');
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
                attackers: [this.servant],
                defenders: [this.daidojiUji]
            });
            this.player2.pass();
            this.player1.pass();
            expect(this.player1).not.toHavePrompt('Triggered Abilities');
        });
    });
});
