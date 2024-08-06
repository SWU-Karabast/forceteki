describe('Penanggalan', function () {
    integration(function () {
        beforeEach(function () {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['penanggalan', 'doji-whisperer']
                },
                player2: {
                    inPlay: ['daidoji-uji', 'marauding-oni', 'doji-challenger', 'doji-diplomat']
                }
            });
            this.penanggalan = this.player1.findCardByName('penanggalan');
            this.whisperer = this.player1.findCardByName('doji-whisperer');
            this.daidojiUji = this.player2.findCardByName('daidoji-uji');
            this.maraudingOni = this.player2.findCardByName('marauding-oni');
            this.challenger = this.player2.findCardByName('doji-challenger');
            this.diplomat = this.player2.findCardByName('doji-diplomat');

            this.whisperer.taint();
            this.whisperer.fate = 3;
            this.diplomat.taint();
            this.diplomat.fate = 4;
            this.challenger.fate = 4;
            this.daidojiUji.taint();
            this.maraudingOni.fate = 4;

            this.noMoreActions();
        });

        it('should trigger and take a fate from an opponent\'s tainted character after winning a conflict', function () {
            this.initiateConflict({
                attackers: [this.penanggalan, this.whisperer],
                defenders: [this.daidojiUji, this.challenger, this.diplomat]
            });

            this.daidojiUji.bow();
            this.challenger.bow();
            this.diplomat.bow();

            let fate = this.diplomat.fate;
            let pFate = this.penanggalan.fate;

            this.player2.pass();
            this.player1.pass();
            expect(this.player1).toHavePrompt('Triggered Abilities');
            expect(this.player1).toBeAbleToSelect(this.penanggalan);
            this.player1.clickCard(this.penanggalan);
            expect(this.player1).not.toBeAbleToSelect(this.penanggalan);
            expect(this.player1).not.toBeAbleToSelect(this.whisperer);
            expect(this.player1).not.toBeAbleToSelect(this.daidojiUji);
            expect(this.player1).not.toBeAbleToSelect(this.maraudingOni);
            expect(this.player1).not.toBeAbleToSelect(this.challenger);
            expect(this.player1).toBeAbleToSelect(this.diplomat);
            this.player1.clickCard(this.diplomat);
            expect(this.diplomat.fate).toBe(fate - 1);
            expect(this.penanggalan.fate).toBe(pFate + 1);
            expect(this.getChatLogs(5)).toContain('player1 uses Penanggalan to take a fate from Doji Diplomat and place it on Penanggalan');
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
                attackers: [this.penanggalan],
                defenders: [this.daidojiUji]
            });
            this.player2.pass();
            this.player1.pass();
            expect(this.player1).not.toHavePrompt('Triggered Abilities');
        });
    });
});
