describe('Insatiable Gaki', function () {
    integration(function () {
        beforeEach(function () {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['insatiable-gaki', 'doji-whisperer']
                },
                player2: {
                    inPlay: ['daidoji-uji', 'marauding-oni'],
                    hand: ['fine-katana', 'assassination', 'ornate-fan']
                }
            });
            this.gaki = this.player1.findCardByName('insatiable-gaki');
            this.whisperer = this.player1.findCardByName('doji-whisperer');
            this.daidojiUji = this.player2.findCardByName('daidoji-uji');
            this.maraudingOni = this.player2.findCardByName('marauding-oni');
            this.katana = this.player2.findCardByName('fine-katana');
            this.assassination = this.player2.findCardByName('assassination');
            this.fan = this.player2.findCardByName('ornate-fan');

            this.gaki.taint();
            this.noMoreActions();
        });

        it('should trigger and force opponent to discard a card after winning a conflict', function () {
            this.initiateConflict({
                attackers: [this.gaki],
                defenders: []
            });
            this.player2.pass();
            this.player1.pass();
            expect(this.player1).toHavePrompt('Triggered Abilities');
            expect(this.player1).toBeAbleToSelect(this.gaki);
            this.player1.clickCard(this.gaki);
            expect(this.player2).toBeAbleToSelect(this.katana);
            expect(this.player2).toBeAbleToSelect(this.assassination);
            expect(this.player2).toBeAbleToSelect(this.fan);
            this.player2.clickCard(this.assassination);
            expect(this.assassination.location).toBe('conflict discard pile');
            expect(this.getChatLogs(5)).toContain('player1 uses Insatiable Gaki to make player2 discard 1 cards');
            expect(this.getChatLogs(5)).toContain('player2 discards Assassination');
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
                attackers: [this.gaki],
                defenders: [this.daidojiUji]
            });
            this.player2.pass();
            this.player1.pass();
            expect(this.player1).not.toHavePrompt('Triggered Abilities');
        });
    });
});
