describe('Shoju\'s Diviner', function() {
    integration(function() {
        beforeEach(function() {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['shoju-s-diviner'],
                    conflictDiscard: ['assassination', 'let-go', 'a-new-name', 'voice-of-honor', 'ornate-fan', 'fine-katana', 'seal-of-the-crane', 'fine-katana', 'ready-for-battle', 'way-of-the-scorpion'],
                    hand: ['way-of-the-crane']
                }
            });

            this.diviner = this.player1.findCardByName('shoju-s-diviner');

            this.assassination = this.player1.moveCard('assassination', 'conflict deck');
            this.letGo = this.player1.moveCard('let-go', 'conflict deck');
            this.ann = this.player1.moveCard('a-new-name', 'conflict deck');
            this.voice = this.player1.moveCard('voice-of-honor', 'conflict deck');
            this.fan = this.player1.moveCard('ornate-fan', 'conflict deck');
            this.katana = this.player1.filterCardsByName('fine-katana')[0];
            this.katana2 = this.player1.filterCardsByName('fine-katana')[1];
            this.player1.moveCard(this.katana, 'conflict deck');
            this.player1.moveCard(this.katana2, 'conflict deck');
            this.seal = this.player1.moveCard('seal-of-the-crane', 'conflict deck');
            this.readyForBattle = this.player1.moveCard('ready-for-battle', 'conflict deck');
            this.scorpion = this.player1.moveCard('way-of-the-scorpion', 'conflict deck');
        });

        it('should not work if it\'s not dire', function() {
            this.diviner.fate = 5;
            this.game.checkGameState(true);

            expect(this.player1).toHavePrompt('Action Window');
            this.player1.clickCard(this.diviner);
            expect(this.player1).toHavePrompt('Action Window');
        });

        it('should prompt you to select between the top 8 cards of your conflict deck when triggered', function() {
            this.player1.clickCard(this.diviner);
            expect(this.player1).toHavePrompt('Select the card to put on top of your deck');

            expect(this.player1).not.toHavePromptButton('Assassination');
            expect(this.player1).not.toHavePromptButton('Let Go');
            expect(this.player1).toHavePromptButton('A New Name');
            expect(this.player1).toHavePromptButton('Voice of Honor');
            expect(this.player1).toHavePromptButton('Ornate Fan');
            expect(this.player1).toHavePromptButton('Fine Katana (2)');
            expect(this.player1).toHavePromptButton('Seal of the Crane');
            expect(this.player1).toHavePromptButton('Ready for Battle');
            expect(this.player1).toHavePromptButton('Way of the Scorpion');
            expect(this.player1).toHavePromptButton('Discard the rest');

            expect(this.getChatLogs(10)).toContain('player1 uses Shoju\'s Diviner to look at the top 8 cards of their conflict deck');
        });

        it('should put the selected cards on the deck in the order selected and discard the rest', function() {
            this.player1.clickCard(this.diviner);
            expect(this.player1).toHavePrompt('Select the card to put on top of your deck');
            this.player1.clickPrompt('A New Name');
            expect(this.player1).toHavePrompt('Select the card to put under A New Name');
            expect(this.player1).not.toHavePromptButton('A New Name');
            this.player1.clickPrompt('Ornate Fan');
            this.player1.clickPrompt('Way of the Scorpion');
            this.player1.clickPrompt('Discard the rest');

            expect(this.ann.location).toBe('conflict deck');
            expect(this.fan.location).toBe('conflict deck');
            expect(this.scorpion.location).toBe('conflict deck');

            expect(this.seal.location).toBe('conflict discard pile');
            expect(this.katana.location).toBe('conflict discard pile');
            expect(this.katana2.location).toBe('conflict discard pile');
            expect(this.readyForBattle.location).toBe('conflict discard pile');
            expect(this.voice.location).toBe('conflict discard pile');

            expect(this.player1.conflictDeck[0]).toBe(this.ann);
            expect(this.player1.conflictDeck[1]).toBe(this.fan);
            expect(this.player1.conflictDeck[2]).toBe(this.scorpion);
            expect(this.player1.conflictDeck[3]).toBe(this.letGo);

            expect(this.getChatLogs(10)).toContain('player1 uses Shoju\'s Diviner to look at the top 8 cards of their conflict deck');
            expect(this.getChatLogs(10)).toContain('player1 discards Ready for Battle, Seal of the Crane, Fine Katana, Fine Katana and Voice of Honor');
            expect(this.getChatLogs(10)).toContain('player1 places 3 cards on top of their deck');
        });

        it('should work if you discard everything', function() {
            this.player1.clickCard(this.diviner);
            expect(this.player1).toHavePrompt('Select the card to put on top of your deck');
            this.player1.clickPrompt('Discard the rest');

            expect(this.ann.location).toBe('conflict discard pile');
            expect(this.fan.location).toBe('conflict discard pile');
            expect(this.scorpion.location).toBe('conflict discard pile');

            expect(this.seal.location).toBe('conflict discard pile');
            expect(this.katana.location).toBe('conflict discard pile');
            expect(this.katana2.location).toBe('conflict discard pile');
            expect(this.readyForBattle.location).toBe('conflict discard pile');
            expect(this.voice.location).toBe('conflict discard pile');

            expect(this.player1.conflictDeck[0]).toBe(this.letGo);

            expect(this.getChatLogs(10)).toContain('player1 uses Shoju\'s Diviner to look at the top 8 cards of their conflict deck');
            expect(this.getChatLogs(10)).toContain('player1 discards Way of the Scorpion, Ready for Battle, Seal of the Crane, Fine Katana, Fine Katana, Ornate Fan, Voice of Honor and A New Name');
        });

        it('should work if you discard nothing', function() {
            this.player1.clickCard(this.diviner);
            expect(this.player1).toHavePrompt('Select the card to put on top of your deck');
            this.player1.clickPrompt('A New Name');
            this.player1.clickPrompt('Fine Katana (2)');
            this.player1.clickPrompt('Fine Katana');
            this.player1.clickPrompt('Ornate Fan');
            this.player1.clickPrompt('Way of the Scorpion');
            this.player1.clickPrompt('Voice of Honor');
            this.player1.clickPrompt('Ready for Battle');
            this.player1.clickPrompt('Seal of the Crane');

            expect(this.ann.location).toBe('conflict deck');
            expect(this.fan.location).toBe('conflict deck');
            expect(this.scorpion.location).toBe('conflict deck');

            expect(this.seal.location).toBe('conflict deck');
            expect(this.katana.location).toBe('conflict deck');
            expect(this.katana2.location).toBe('conflict deck');
            expect(this.readyForBattle.location).toBe('conflict deck');
            expect(this.voice.location).toBe('conflict deck');

            expect(this.player1.conflictDeck[0]).toBe(this.ann);

            const areKatanasInPlace = (this.player1.conflictDeck[1] === this.katana && this.player1.conflictDeck[2] === this.katana2) ||
                (this.player1.conflictDeck[2] === this.katana && this.player1.conflictDeck[1] === this.katana2);

            expect(areKatanasInPlace).toBe(true);
            expect(this.player1.conflictDeck[3]).toBe(this.fan);
            expect(this.player1.conflictDeck[4]).toBe(this.scorpion);
            expect(this.player1.conflictDeck[5]).toBe(this.voice);
            expect(this.player1.conflictDeck[6]).toBe(this.readyForBattle);
            expect(this.player1.conflictDeck[7]).toBe(this.seal);
            expect(this.player1.conflictDeck[8]).toBe(this.letGo);

            expect(this.getChatLogs(10)).toContain('player1 uses Shoju\'s Diviner to look at the top 8 cards of their conflict deck');
            expect(this.getChatLogs(10)).toContain('player1 places 8 cards on top of their deck');
        });
    });
});
