describe('Lost Samurai', function () {
    integration(function () {
        beforeEach(function () {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['lost-samurai', 'doji-whisperer']
                },
                player2: {
                    inPlay: ['daidoji-uji', 'bog-hag', 'doji-challenger']
                }
            });
            this.lost = this.player1.findCardByName('lost-samurai');
            this.whisperer = this.player1.findCardByName('doji-whisperer');
            this.daidojiUji = this.player2.findCardByName('daidoji-uji');
            this.hag = this.player2.findCardByName('bog-hag');
            this.challenger = this.player2.findCardByName('doji-challenger');
            this.noMoreActions();
        });

        it('should trigger and dishonor a participating character after winning a conflict', function () {
            this.initiateConflict({
                attackers: [this.lost, this.whisperer],
                defenders: [this.daidojiUji, this.hag]
            });
            this.daidojiUji.bow();
            this.player2.pass();
            this.player1.pass();
            expect(this.player1).toHavePrompt('Triggered Abilities');
            expect(this.player1).toBeAbleToSelect(this.lost);
            this.player1.clickCard(this.lost);
            expect(this.player1).not.toBeAbleToSelect(this.lost);
            expect(this.player1).toBeAbleToSelect(this.whisperer);
            expect(this.player1).toBeAbleToSelect(this.daidojiUji);
            expect(this.player1).not.toBeAbleToSelect(this.hag);
            expect(this.player1).not.toBeAbleToSelect(this.challenger);
            this.player1.clickCard(this.daidojiUji);
            expect(this.daidojiUji.isDishonored).toBe(true);
            expect(this.getChatLogs(5)).toContain('player1 uses Lost Samurai to dishonor Daidoji Uji');
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
                attackers: [this.lost],
                defenders: [this.daidojiUji]
            });
            this.player2.pass();
            this.player1.pass();
            expect(this.player1).not.toHavePrompt('Triggered Abilities');
        });
    });
});
