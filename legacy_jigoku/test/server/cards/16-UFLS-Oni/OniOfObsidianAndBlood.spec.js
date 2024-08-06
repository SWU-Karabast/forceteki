describe('Oni of Obsidian and Blood', function () {
    integration(function () {
        beforeEach(function () {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['oni-of-obsidian-and-blood', 'doji-whisperer'],
                    hand: ['fine-katana']
                },
                player2: {
                    inPlay: ['daidoji-uji', 'marauding-oni']
                }
            });
            this.oni = this.player1.findCardByName('oni-of-obsidian-and-blood');
            this.whisperer = this.player1.findCardByName('doji-whisperer');
            this.daidojiUji = this.player2.findCardByName('daidoji-uji');
            this.maraudingOni = this.player2.findCardByName('marauding-oni');
            this.katana = this.player1.findCardByName('fine-katana');

            this.whisperer.taint();
            this.daidojiUji.taint();
        });

        it('No attachments', function () {
            this.player1.clickCard(this.katana);
            expect(this.player1).not.toBeAbleToSelect(this.oni);
            expect(this.player1).toBeAbleToSelect(this.whisperer);
            expect(this.player1).toBeAbleToSelect(this.daidojiUji);
            expect(this.player1).toBeAbleToSelect(this.maraudingOni);
        });

        it('should trigger and discard a tainted character after winning a conflict', function () {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.oni],
                defenders: []
            });
            this.player2.pass();
            this.player1.pass();
            expect(this.player1).toHavePrompt('Triggered Abilities');
            expect(this.player1).toBeAbleToSelect(this.oni);
            this.player1.clickCard(this.oni);
            expect(this.player1).not.toBeAbleToSelect(this.oni);
            expect(this.player1).not.toBeAbleToSelect(this.whisperer);
            expect(this.player1).toBeAbleToSelect(this.daidojiUji);
            expect(this.player1).not.toBeAbleToSelect(this.maraudingOni);
            this.player1.clickCard(this.daidojiUji);
            expect(this.daidojiUji.location).toBe('dynasty discard pile');
            expect(this.getChatLogs(5)).toContain('player1 uses Oni of Obsidian and Blood to discard Daidoji Uji');
        });

        it('should not trigger if not participating', function () {
            this.noMoreActions();
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
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.oni],
                defenders: [this.daidojiUji, this.maraudingOni]
            });
            this.player2.pass();
            this.player1.pass();
            expect(this.player1).not.toHavePrompt('Triggered Abilities');
        });
    });
});
