describe('Lurking Affliction', function() {
    integration(function() {
        beforeEach(function() {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['togashi-initiate', 'kitsuki-shomon'],
                    hand: ['lurking-affliction']
                },
                player2: {
                    inPlay: ['doji-whisperer', 'daidoji-uji']
                }
            });
            this.togashiInitiate = this.player1.findCardByName('togashi-initiate');
            this.kitsukiShomon = this.player1.findCardByName('kitsuki-shomon');
            this.lurk = this.player1.findCardByName('lurking-affliction');
            this.dojiWhisperer = this.player2.findCardByName('doji-whisperer');
            this.daidojiUji = this.player2.findCardByName('daidoji-uji');
            this.kitsukiShomon.taint();
        });

        it('should not be playable outside of a conflict', function() {
            expect(this.player1).toHavePrompt('Action Window');
            this.player1.clickCard(this.lurk);
            expect(this.player1).toHavePrompt('Action Window');
        });

        it('should taint a participating character', function() {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.togashiInitiate, this.kitsukiShomon],
                defenders: [this.daidojiUji]
            });
            this.player2.pass();
            this.player1.clickCard(this.lurk);
            expect(this.player1).toBeAbleToSelect(this.togashiInitiate);
            expect(this.player1).not.toBeAbleToSelect(this.kitsukiShomon);
            expect(this.player1).toBeAbleToSelect(this.daidojiUji);
            expect(this.player1).not.toBeAbleToSelect(this.dojiWhisperer);

            this.player1.clickCard(this.daidojiUji);
            expect(this.daidojiUji.isTainted).toBe(true);
            expect(this.getChatLogs(5)).toContain('player1 plays Lurking Affliction to taint Daidoji Uji');
        });
    });
});
