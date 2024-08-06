describe('Endless Archives', function() {
    integration(function() {
        beforeEach(function() {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['brash-samurai'],
                    dynastyDiscard: ['endless-archives'],
                    hand: ['fine-katana', 'assassination']
                },
                player2: {
                    inPlay: ['dazzling-duelist'],
                    hand: ['ornate-fan', 'let-go', 'duelist-training', 'way-of-the-crane', 'way-of-the-scorpion', 'against-the-waves']
                }
            });

            this.samurai = this.player1.findCardByName('brash-samurai');
            this.archives = this.player1.moveCard('endless-archives', 'province 1');
            this.duelist = this.player2.findCardByName('dazzling-duelist');

            this.katana = this.player1.findCardByName('fine-katana');
            this.assassination = this.player1.findCardByName('assassination');

            this.fan = this.player2.findCardByName('ornate-fan');
            this.letGo = this.player2.findCardByName('let-go');
            this.duelistTraining = this.player2.findCardByName('duelist-training');
            this.crane = this.player2.findCardByName('way-of-the-crane');
            this.scorpion = this.player2.findCardByName('way-of-the-scorpion');
            this.atw = this.player2.findCardByName('against-the-waves');
        });

        it('should trigger when a player passes a conflict declaration', function() {
            this.noMoreActions();
            this.player1.passConflict();
            expect(this.player1).toHavePrompt('Triggered Abilities');
            expect(this.player1).toBeAbleToSelect(this.archives);
        });

        it('if triggered, should place an honor token on the holding and then prompt you to select a card', function() {
            let cards = this.player1.hand.length;
            this.noMoreActions();
            this.player1.passConflict();
            this.player1.clickCard(this.archives);
            expect(this.archives.getTokenCount('honor')).toBe(1);
            expect(this.player1).toHavePrompt('Choose a card to return to your deck');
            expect(this.player1).toBeAbleToSelect(this.katana);
            expect(this.player1).toBeAbleToSelect(this.assassination);
            this.player1.clickCard(this.katana);
            expect(this.katana.location).toBe('conflict deck');
            expect(this.player1.conflictDeck[this.player1.conflictDeck.length - 1]).toBe(this.katana);
            expect(this.player1).toHavePrompt('Action Window');
            expect(this.player1.hand.length).toBe(cards);
            expect(this.getChatLogs(5)).toContain('player1 uses Endless Archives to place an honor token on Endless Archives and exchange cards from their hand');
            expect(this.getChatLogs(5)).toContain('player1 returns 1 card to the bottom of their deck');
        });

        it('should trigger for both players', function() {
            this.noMoreActions();
            this.player1.passConflict();
            expect(this.player1).toHavePrompt('Triggered Abilities');
            expect(this.player1).toBeAbleToSelect(this.archives);
            this.player1.clickCard(this.archives);
            this.player1.clickCard(this.katana);
            this.noMoreActions();
            this.player2.passConflict();
            expect(this.player2).toHavePrompt('Triggered Abilities');
            expect(this.player2).toBeAbleToSelect(this.archives);
        });

        it('should incrementally have you pick cards', function() {
            let cards = this.player2.hand.length;
            this.noMoreActions();
            this.player1.passConflict();
            this.player1.clickCard(this.archives);
            this.player1.clickCard(this.katana);
            this.noMoreActions();
            this.player2.passConflict();
            this.player2.clickCard(this.archives);
            expect(this.archives.getTokenCount('honor')).toBe(2);
            expect(this.player2).toHavePrompt('Choose 2 cards to return to your deck');
            expect(this.player2).toBeAbleToSelect(this.crane);
            expect(this.player2).toBeAbleToSelect(this.scorpion);
            this.player2.clickCard(this.crane);
            this.player2.clickCard(this.scorpion);
            this.player2.clickPrompt('Done');
            expect(this.crane.location).toBe('conflict deck');
            expect(this.scorpion.location).toBe('conflict deck');
            expect(this.player1).toHavePrompt('Action Window');
            expect(this.player2.hand.length).toBe(cards);
            expect(this.getChatLogs(5)).toContain('player2 uses Endless Archives to place an honor token on Endless Archives and exchange cards from their hand');
            expect(this.getChatLogs(5)).toContain('player2 returns 2 cards to the bottom of their deck');
        });

        it('if you have fewer than X cards should only draw X', function() {
            let cards = this.player1.hand.length;
            this.noMoreActions();
            this.player1.passConflict();
            this.player1.clickCard(this.archives);
            this.player1.clickCard(this.katana);
            this.noMoreActions();
            this.player2.passConflict();
            this.player2.clickCard(this.archives);
            this.player2.clickCard(this.crane);
            this.player2.clickCard(this.scorpion);
            this.player2.clickPrompt('Done');
            expect(this.player1).toHavePrompt('Action Window');
            this.noMoreActions();
            this.player1.passConflict();
            this.player1.clickCard(this.archives);
            expect(this.player1.hand.length).toBe(cards);
            expect(this.getChatLogs(5)).toContain('player1 uses Endless Archives to place an honor token on Endless Archives and exchange cards from their hand');
            expect(this.getChatLogs(5)).toContain('player1 returns 2 cards to the bottom of their deck');
        });
    });
});
