describe('Shiro Gisu', function() {
    integration(function() {
        beforeEach(function() {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['inquisitorial-initiate'],
                    conflictDiscard: ['ornate-fan', 'fine-katana', 'banzai', 'assassination', 'charge'],
                    stronghold: ['shiro-gisu']
                },
                player2: {
                    inPlay: ['doji-whisperer', 'border-rider', 'doji-challenger']
                }
            });

            this.player1.reduceDeckToNumber('conflict deck', 0);
            this.gisu = this.player1.findCardByName('shiro-gisu');
            this.whisperer = this.player2.findCardByName('doji-whisperer');
            this.challenger = this.player2.findCardByName('doji-challenger');
            this.rider = this.player2.findCardByName('border-rider');

            this.fan = this.player1.findCardByName('ornate-fan');
            this.katana = this.player1.findCardByName('fine-katana');
            this.banzai = this.player1.findCardByName('banzai');
            this.assassination = this.player1.findCardByName('assassination');
            this.charge = this.player1.findCardByName('charge');

            this.player1.moveCard(this.charge, 'conflict deck');
            this.player1.moveCard(this.assassination, 'conflict deck');
            this.player1.moveCard(this.banzai, 'conflict deck');
            this.player1.moveCard(this.katana, 'conflict deck');
            this.player1.moveCard(this.fan, 'conflict deck');

        });

        it('should show you a number of cards equal to characters without fate (2)', function() {
            this.whisperer.fate = 1;
            this.challenger.fate = 1;
            this.player1.clickCard(this.gisu);
            expect(this.player1).toHavePrompt('Choose a card to put in your hand');
            expect(this.player1).toHavePromptButton('Ornate Fan');
            expect(this.player1).not.toHavePromptButton('Fine Katana');
            expect(this.player1).not.toHavePromptButton('Banzai!');
        });

        it('should show you a number of cards equal to characters without fate (2)', function() {
            this.challenger.fate = 1;
            this.player1.clickCard(this.gisu);
            expect(this.player1).toHavePrompt('Choose a card to put in your hand');
            expect(this.player1).toHavePromptButton('Ornate Fan');
            expect(this.player1).toHavePromptButton('Fine Katana');
            expect(this.player1).not.toHavePromptButton('Banzai!');
        });

        it('should show you a number of cards equal to characters without fate (3)', function() {
            this.player1.clickCard(this.gisu);
            expect(this.player1).toHavePrompt('Choose a card to put in your hand');
            expect(this.player1).toHavePromptButton('Ornate Fan');
            expect(this.player1).toHavePromptButton('Fine Katana');
            expect(this.player1).toHavePromptButton('Banzai!');
        });

        it('should add the chosen card to your hand and put the other two on the bottom', function() {
            this.player1.clickCard(this.gisu);
            this.player1.clickPrompt('Banzai!');
            expect(this.banzai.location).toBe('hand');

            const deck = this.player1.conflictDeck;
            const L = this.player1.conflictDeck.length;
            const fanBottom = deck[L - 2] === this.fan || deck[L - 1] === this.fan;
            const katanaBottom = deck[L - 2] === this.katana || deck[L - 1] === this.katana;

            expect(fanBottom).toBe(true);
            expect(katanaBottom).toBe(true);

            expect(this.getChatLogs(5)).toContain('player1 uses Shiro Gisu, bowing Shiro Gisu to look at the top 3 cards of their conflict deck');
            expect(this.getChatLogs(5)).toContain('player1 takes 1 card');
            expect(this.getChatLogs(5)).toContain('player1 puts 2 cards on the bottom of their conflict deck');
        });
    });
});
