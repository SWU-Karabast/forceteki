describe('Setting the Standard', function() {
    integration(function() {
        beforeEach(function () {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['doji-challenger', 'brash-samurai'],
                    hand: ['setting-the-standard', 'assassination', 'fine-katana'],
                    conflictDiscard: ['ornate-fan', 'let-go']
                },
                player2: {
                    inPlay: ['bayushi-kachiko']
                }
            });


            this.brash = this.player1.findCardByName('brash-samurai');
            this.challenger = this.player1.findCardByName('doji-challenger');
            this.standard = this.player1.findCardByName('setting-the-standard');
            this.assassination = this.player1.findCardByName('assassination');
            this.katana = this.player1.findCardByName('fine-katana');
            this.fan = this.player1.findCardByName('ornate-fan');
            this.letGo = this.player1.findCardByName('let-go');

            this.kachiko = this.player2.findCardByName('bayushi-kachiko');
            this.player1.moveCard(this.fan, 'conflict deck');
            this.player1.moveCard(this.letGo, 'conflict deck');
            this.player1.playAttachment(this.standard, this.challenger);
        });

        it('should react on the character winning', function () {
            this.noMoreActions();
            this.initiateConflict({
                type: 'political',
                attackers: [this.challenger],
                defenders: []
            });

            this.initialHandSize = this.player1.hand.length;
            this.noMoreActions();
            expect(this.player1).toHavePrompt('Triggered Abilities');
            expect(this.player1).toBeAbleToSelect(this.challenger);
            expect(this.player1).not.toBeAbleToSelect(this.standard);
        });

        it('should draw 2 and discard 1', function () {
            this.noMoreActions();
            this.initiateConflict({
                type: 'political',
                attackers: [this.challenger],
                defenders: []
            });

            this.initialHandSize = this.player1.hand.length;
            this.noMoreActions();
            this.player1.clickCard(this.challenger);
            expect(this.getChatLogs(10)).toContain('player1 uses Doji Challenger\'s gained ability from Setting the Standard to draw 2 cards, then discard 1');
            expect(this.player1.hand.length).toBe(this.initialHandSize + 2);
            expect(this.fan.location).toBe('hand');
            expect(this.letGo.location).toBe('hand');
            expect(this.player1).toHavePrompt('Choose a card to discard');
            expect(this.player1).toBeAbleToSelect(this.fan);
            expect(this.player1).toBeAbleToSelect(this.letGo);
            expect(this.player1).toBeAbleToSelect(this.assassination);
            expect(this.player1).toBeAbleToSelect(this.katana);

            this.player1.clickCard(this.letGo);
            expect(this.letGo.location).toBe('conflict discard pile');
            expect(this.getChatLogs(5)).toContain('player1 discards Let Go');
            expect(this.player1.hand.length).toBe(this.initialHandSize + 1);
        });

        it('should not react on the character losing', function () {
            this.noMoreActions();
            this.initiateConflict({
                type: 'political',
                attackers: [this.challenger],
                defenders: [this.kachiko]
            });

            this.noMoreActions();
            expect(this.player1).not.toHavePrompt('Triggered Abilities');
            expect(this.player1).toHavePrompt('Action Window');
        });

        it('should not react of character is not participating', function () {
            this.noMoreActions();
            this.initiateConflict({
                type: 'political',
                attackers: [this.brash],
                defenders: []
            });

            this.noMoreActions();
            expect(this.player1).not.toHavePrompt('Triggered Abilities');
            expect(this.player1).toHavePrompt('Air Ring');
        });
    });
});
