describe('Twin Sister Blades', function() {
    integration(function() {
        beforeEach(function() {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['hida-yakamo', 'matsu-berserker', 'kakita-yoshi'],
                    hand: ['twin-sister-blades','fine-katana','ornate-fan']
                },
                player2: {
                    inPlay: ['doji-whisperer', 'kakita-toshimoko']
                }
            });
            this.yakamo = this.player1.findCardByName('hida-yakamo');
            this.berserker = this.player1.findCardByName('matsu-berserker');
            this.yoshi = this.player1.findCardByName('kakita-yoshi');

            this.mirumotoDaisho = this.player1.findCardByName('twin-sister-blades');
            this.fineKatana = this.player1.findCardByName('fine-katana');
            this.ornateFan = this.player1.findCardByName('ornate-fan');
            this.dojiWhisperer = this.player2.findCardByName('doji-whisperer');
            this.toshimoko = this.player2.findCardByName('kakita-toshimoko');
        });

        it('should draw a card on a duelist if not outnumbered', function() {
            this.player1.clickCard(this.mirumotoDaisho);
            this.player1.clickCard(this.yakamo);
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.yakamo],
                defenders: [this.dojiWhisperer]
            });
            let hand = this.player1.hand.length;

            this.player2.pass();
            this.player1.clickCard(this.yakamo);

            expect(this.player1.hand.length).toBe(hand + 1);
            expect(this.getChatLogs(5)).toContain("player1 uses Hida Yakamo's gained ability from Twin Sister Blades to draw a card");
        });

        it('should draw a card on a bushi if not outnumbered', function() {
            this.player1.clickCard(this.mirumotoDaisho);
            this.player1.clickCard(this.berserker);
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.berserker],
                defenders: [this.dojiWhisperer]
            });
            let hand = this.player1.hand.length;

            this.player2.pass();
            this.player1.clickCard(this.berserker);

            expect(this.player1.hand.length).toBe(hand + 1);
            expect(this.getChatLogs(5)).toContain("player1 uses Matsu Berserker's gained ability from Twin Sister Blades to draw a card");
        });

        it('should not draw on a non-bushi', function() {
            this.player1.clickCard(this.mirumotoDaisho);
            this.player1.clickCard(this.yoshi);
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.yoshi],
                defenders: [this.dojiWhisperer]
            });
            let hand = this.player1.hand.length;

            this.player2.pass();
            expect(this.player1).toHavePrompt('Conflict Action Window');
            this.player1.clickCard(this.yoshi);
            expect(this.player1).toHavePrompt('Conflict Action Window');
        });

        it('should draw 2 cards on a duelist if outnumbered', function() {
            this.player1.clickCard(this.mirumotoDaisho);
            this.player1.clickCard(this.yakamo);
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.yakamo],
                defenders: [this.dojiWhisperer, this.toshimoko]
            });
            let hand = this.player1.hand.length;

            this.player2.pass();
            this.player1.clickCard(this.yakamo);

            expect(this.player1.hand.length).toBe(hand + 2);
            expect(this.getChatLogs(5)).toContain("player1 uses Hida Yakamo's gained ability from Twin Sister Blades to draw 2 cards");
        });

        it('should draw a card on a bushi non-duelist if outnumbered', function() {
            this.player1.clickCard(this.mirumotoDaisho);
            this.player1.clickCard(this.berserker);
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.berserker],
                defenders: [this.dojiWhisperer, this.toshimoko]
            });
            let hand = this.player1.hand.length;

            this.player2.pass();
            this.player1.clickCard(this.berserker);

            expect(this.player1.hand.length).toBe(hand + 1);
            expect(this.getChatLogs(5)).toContain("player1 uses Matsu Berserker's gained ability from Twin Sister Blades to draw a card");
        });
    });
});
