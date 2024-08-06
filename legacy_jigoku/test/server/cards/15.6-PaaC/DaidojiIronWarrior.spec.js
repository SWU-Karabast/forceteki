describe('Daidoji Iron Warrior', function() {
    integration(function() {
        beforeEach(function() {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['daidoji-iron-warrior', 'doji-challenger'],
                    hand: [
                        'against-the-waves', 'fine-katana', 'ornate-fan', 'honored-blade',
                        'magnificent-kimono', 'assassination', 'banzai', 'charge'
                    ]
                },
                player2: {
                    inPlay: ['daidoji-kageyu'],
                    hand: [
                        'against-the-waves', 'fine-katana', 'ornate-fan', 'honored-blade',
                        'magnificent-kimono', 'assassination', 'banzai', 'charge'
                    ]
                }
            });
            this.challenger = this.player1.findCardByName('doji-challenger');
            this.warrior = this.player1.findCardByName('daidoji-iron-warrior');
            this.kageyu = this.player2.findCardByName('daidoji-kageyu');

            this.atw = this.player1.findCardByName('against-the-waves');
            this.katana = this.player1.findCardByName('fine-katana');
            this.fan = this.player1.findCardByName('ornate-fan');
            this.blade = this.player1.findCardByName('honored-blade');
            this.kimono = this.player1.findCardByName('magnificent-kimono');
            this.assassination = this.player1.findCardByName('assassination');
            this.banzai = this.player1.findCardByName('banzai');
            this.charge = this.player1.findCardByName('charge');

            this.atw2 = this.player2.findCardByName('against-the-waves');
            this.katana2 = this.player2.findCardByName('fine-katana');
            this.fan2 = this.player2.findCardByName('ornate-fan');
            this.blade2 = this.player2.findCardByName('honored-blade');
            this.kimono2 = this.player2.findCardByName('magnificent-kimono');
            this.assassination2 = this.player2.findCardByName('assassination');
            this.banzai2 = this.player2.findCardByName('banzai');
            this.charge2 = this.player2.findCardByName('charge');
        });

        it('should trigger on winning a conflict on attack', function() {
            this.noMoreActions();
            this.initiateConflict({
                type: 'military',
                attackers: [this.warrior],
                defenders: [this.kageyu]
            });
            this.noMoreActions();
            expect(this.player1).toHavePrompt('Triggered Abilities');
            expect(this.player1).toBeAbleToSelect(this.warrior);
        });

        it('should not trigger on losing a conflict on attack', function() {
            this.kageyu.honor();
            this.noMoreActions();
            this.initiateConflict({
                type: 'military',
                attackers: [this.warrior],
                defenders: [this.kageyu]
            });
            this.noMoreActions();
            expect(this.player1).not.toHavePrompt('Triggered Abilities');
        });

        it('should not trigger when winning a conflict on attack without being participating', function() {
            this.noMoreActions();
            this.initiateConflict({
                type: 'military',
                attackers: [this.challenger],
                defenders: [this.kageyu]
            });
            this.noMoreActions();
            expect(this.player1).not.toHavePrompt('Triggered Abilities');
        });

        it('should trigger on winning a conflict on defense', function() {
            this.noMoreActions();
            this.player1.passConflict();
            this.noMoreActions();
            this.initiateConflict({
                type: 'military',
                attackers: [this.kageyu],
                defenders: [this.warrior]
            });
            this.noMoreActions();
            expect(this.player1).toHavePrompt('Triggered Abilities');
            expect(this.player1).toBeAbleToSelect(this.warrior);
        });

        it('should not trigger on losing a conflict on attack', function() {
            this.kageyu.honor();
            this.noMoreActions();
            this.player1.passConflict();
            this.noMoreActions();
            this.initiateConflict({
                type: 'military',
                attackers: [this.kageyu],
                defenders: [this.warrior]
            });
            this.noMoreActions();
            expect(this.player1).not.toHavePrompt('Triggered Abilities');
        });

        it('should prompt both players to discard down to four cards', function() {
            this.noMoreActions();
            this.initiateConflict({
                type: 'military',
                attackers: [this.warrior],
                defenders: [this.kageyu]
            });
            this.noMoreActions();
            this.player1.clickCard(this.warrior);
            expect(this.player2).toHavePrompt('Choose 4 cards to discard');
            expect(this.player2).toBeAbleToSelect(this.assassination2);
            expect(this.player2).toBeAbleToSelect(this.charge2);

            this.player2.clickCard(this.assassination2);
            this.player2.clickCard(this.atw2);
            this.player2.clickCard(this.kimono2);
            this.player2.clickCard(this.katana2);
            this.player2.clickPrompt('Done');

            expect(this.getChatLogs(5)).not.toContain('player2 discards Assassination, Against the Waves, Magnificent Kimono and Fine Katana');

            expect(this.player1).toHavePrompt('Choose 4 cards to discard');
            this.player1.clickCard(this.fan);
            this.player1.clickCard(this.atw);
            this.player1.clickCard(this.charge);
            this.player1.clickCard(this.banzai);
            this.player1.clickPrompt('Done');

            expect(this.getChatLogs(5)).toContain('player2 discards Assassination, Against the Waves, Magnificent Kimono and Fine Katana');
            expect(this.getChatLogs(5)).toContain('player1 discards Ornate Fan, Against the Waves, Charge! and Banzai!');

            expect(this.assassination2.location).toBe('conflict discard pile');
            expect(this.atw2.location).toBe('conflict discard pile');
            expect(this.kimono2.location).toBe('conflict discard pile');
            expect(this.katana2.location).toBe('conflict discard pile');

            expect(this.fan.location).toBe('conflict discard pile');
            expect(this.atw.location).toBe('conflict discard pile');
            expect(this.charge.location).toBe('conflict discard pile');
            expect(this.banzai.location).toBe('conflict discard pile');
        });
    });
});
