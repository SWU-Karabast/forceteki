describe('The Perfect Gift', function () {
    integration(function () {
        beforeEach(function () {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    hand: ['the-perfect-gift'],
                    conflictDiscard: ['fine-katana', 'assassination', 'censure', 'against-the-waves']
                },
                player2: {
                    conflictDiscard: ['ornate-fan', 'shinjo-ambusher', 'watch-commander', 'walking-the-way']
                }
            });
            this.gift = this.player1.findCardByName('the-perfect-gift');

            this.player1.reduceDeckToNumber('conflict deck', 0);
            this.player2.reduceDeckToNumber('conflict deck', 0);

            this.katana = this.player1.moveCard('fine-katana', 'conflict deck');
            this.assassination = this.player1.moveCard('assassination', 'conflict deck');
            this.censure = this.player1.moveCard('censure', 'conflict deck');
            this.againstTheWaves = this.player1.moveCard('against-the-waves', 'conflict deck');

            this.fan = this.player2.moveCard('ornate-fan', 'conflict deck');
            this.ambusher = this.player2.moveCard('shinjo-ambusher', 'conflict deck');
            this.commander = this.player2.moveCard('watch-commander', 'conflict deck');
            this.walkingTheWay = this.player2.moveCard('walking-the-way', 'conflict deck');
        });

        it('should prompt you to pick a card for each player', function () {
            this.player1.clickCard(this.gift);
            expect(this.player1).toHavePrompt('Choose a card to give to yourself');
            expect(this.player1).toHavePromptButton('Against the Waves');
            expect(this.player1).toHavePromptButton('Censure');
            expect(this.player1).toHavePromptButton('Assassination');
            expect(this.player1).toHavePromptButton('Fine Katana');

            this.player1.clickPrompt('Assassination');

            expect(this.player1).toHavePrompt('Choose a card to give your opponent');
            expect(this.player1).toHavePromptButton('Ornate Fan');
            expect(this.player1).toHavePromptButton('Shinjo Ambusher');
            expect(this.player1).toHavePromptButton('Watch Commander');
            expect(this.player1).toHavePromptButton('Walking the Way');

            this.player1.clickPrompt('Watch Commander');
        });

        it('should put the cards into hands', function () {
            this.player1.clickCard(this.gift);
            this.player1.clickPrompt('Assassination');
            this.player1.clickPrompt('Watch Commander');

            expect(this.assassination.location).toBe('hand');
            expect(this.commander.location).toBe('hand');
        });

        it('should shuffle the decks', function () {
            this.player1.clickCard(this.gift);
            this.player1.clickPrompt('Assassination');
            this.player1.clickPrompt('Watch Commander');

            expect(this.getChatLogs(10)).toContain('player1 is shuffling their conflict deck');
            expect(this.getChatLogs(10)).toContain('player2 is shuffling their conflict deck');
        });
    });
});
