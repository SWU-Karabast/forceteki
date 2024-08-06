describe('Dark Moto', function () {
    integration(function () {
        beforeEach(function () {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['dark-moto', 'doji-whisperer']
                },
                player2: {
                    inPlay: ['daidoji-uji', 'marauding-oni', 'brash-samurai']
                }
            });
            this.moto = this.player1.findCardByName('dark-moto');
            this.whisperer = this.player1.findCardByName('doji-whisperer');
            this.daidojiUji = this.player2.findCardByName('daidoji-uji');
            this.maraudingOni = this.player2.findCardByName('marauding-oni');
            this.samurai = this.player2.findCardByName('brash-samurai');
            this.noMoreActions();
        });

        it('should trigger and get a fate and not bow as a result of resolution after winning a conflict', function () {
            this.initiateConflict({
                attackers: [this.moto],
                defenders: [this.samurai]
            });
            let pFate = this.player1.fate;
            let mFate = this.moto.fate;

            this.player2.pass();
            this.player1.pass();
            expect(this.player1).toHavePrompt('Triggered Abilities');
            expect(this.player1).toBeAbleToSelect(this.moto);
            this.player1.clickCard(this.moto);
            expect(this.moto.fate).toBe(mFate + 1);
            expect(this.player1.fate).toBe(pFate - 1);
            expect(this.getChatLogs(5)).toContain('player1 uses Dark Moto to place a fate on and prevent Dark Moto from bowing as a result of conflict resolution');
            this.player1.clickPrompt('Don\'t Resolve');
            expect(this.moto.bowed).toBe(false);
            expect(this.samurai.bowed).toBe(true);
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
                attackers: [this.moto],
                defenders: [this.daidojiUji]
            });
            this.player2.pass();
            this.player1.pass();
            expect(this.player1).not.toHavePrompt('Triggered Abilities');
        });
    });
});
