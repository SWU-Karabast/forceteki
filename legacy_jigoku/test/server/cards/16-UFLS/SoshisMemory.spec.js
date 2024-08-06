describe('Soshi\'s Memory', function() {
    integration(function() {
        beforeEach(function() {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['sinister-soshi', 'soshi-illusionist'],
                    hand: ['soshi-s-memory'],
                    dynastyDiscard: ['yogo-junzo'],
                    conflictDiscard: ['ornate-fan', 'fine-katana', 'banzai', 'assassination', 'charge']
                },
                player2: {
                    inPlay: ['asahina-artisan'],
                    conflictDiscard: ['ornate-fan', 'fine-katana', 'banzai', 'assassination', 'charge']
                }
            });

            this.player1.reduceDeckToNumber('conflict deck', 0);
            this.memory = this.player1.findCardByName('soshi-s-memory');
            this.junzo = this.player1.findCardByName('yogo-junzo');

            this.fan = this.player1.findCardByName('ornate-fan');
            this.katana = this.player1.findCardByName('fine-katana');
            this.banzai = this.player1.findCardByName('banzai');
            this.assassination = this.player1.findCardByName('assassination');
            this.charge = this.player1.findCardByName('charge');

            this.fan2 = this.player2.findCardByName('ornate-fan');
            this.katana2 = this.player2.findCardByName('fine-katana');
            this.banzai2 = this.player2.findCardByName('banzai');
            this.assassination2 = this.player2.findCardByName('assassination');
            this.charge2 = this.player2.findCardByName('charge');

            this.player1.moveCard(this.charge, 'conflict deck');
            this.player1.moveCard(this.assassination, 'conflict deck');
            this.player1.moveCard(this.banzai, 'conflict deck');
            this.player1.moveCard(this.katana, 'conflict deck');
            this.player1.moveCard(this.fan, 'conflict deck');

            this.player2.moveCard(this.fan2, 'conflict deck');
            this.player2.moveCard(this.katana2, 'conflict deck');
            this.player2.moveCard(this.banzai2, 'conflict deck');
            this.player2.moveCard(this.assassination2, 'conflict deck');
            this.player2.moveCard(this.charge2, 'conflict deck');
        });

        it('should prompt you to pick a player', function() {
            this.player1.clickCard(this.memory);
            expect(this.player1).toHavePromptButton('player1');
            expect(this.player1).toHavePromptButton('player2');
        });

        it('should show you a number of cards equal to shugenja you control (2) and put that card into your hand without revealing, player1 selected', function() {
            this.player1.clickCard(this.memory);
            this.player1.clickPrompt('player1');
            expect(this.player1).toHavePrompt('Choose a card to put into your hand');
            expect(this.player1).toHavePromptButton('Ornate Fan');
            expect(this.player1).toHavePromptButton('Fine Katana');
            expect(this.player1).not.toHavePromptButton('Banzai!');
            this.player1.clickPrompt('Ornate Fan');
            expect(this.fan.location).toBe('hand');
            expect(this.getChatLogs(10)).toContain('player1 plays Soshi\'s Memory to let player1 look at the top 2 cards of their conflict deck');
            expect(this.getChatLogs(10)).toContain('player1 takes 1 card');
            expect(this.getChatLogs(10)).toContain('player1 is shuffling their conflict deck');
        });

        it('should show your opponent a number of cards equal to shugenja you control (2), player2 selected', function() {
            this.player1.clickCard(this.memory);
            this.player1.clickPrompt('player2');
            expect(this.player1).not.toHavePrompt('Choose a card to put into your hand');
            expect(this.player2).toHavePrompt('Choose a card to put into your hand');
            expect(this.player2).toHavePromptButton('Charge!');
            expect(this.player2).toHavePromptButton('Assassination');
            expect(this.player2).not.toHavePromptButton('Banzai!');
            this.player2.clickPrompt('Charge!');
            expect(this.charge2.location).toBe('hand');
            expect(this.getChatLogs(10)).toContain('player1 plays Soshi\'s Memory to let player2 look at the top 2 cards of their conflict deck');
            expect(this.getChatLogs(10)).toContain('player2 takes 1 card');
            expect(this.getChatLogs(10)).toContain('player2 is shuffling their conflict deck');
        });

        it('should show you a number of cards equal to characters without fate (3)', function() {
            this.player1.moveCard(this.junzo, 'play area');
            this.game.checkGameState(true);
            this.player1.clickCard(this.memory);
            this.player1.clickPrompt('player1');
            expect(this.player1).toHavePrompt('Choose a card to put into your hand');
            expect(this.player1).toHavePromptButton('Ornate Fan');
            expect(this.player1).toHavePromptButton('Fine Katana');
            expect(this.player1).toHavePromptButton('Banzai!');
        });
    });
});
