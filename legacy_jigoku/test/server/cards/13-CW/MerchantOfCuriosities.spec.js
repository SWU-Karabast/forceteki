describe('Merchant of Curiosities', function() {
    integration(function() {
        beforeEach(function() {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    honor: 10,
                    inPlay: ['merchant-of-curiosities'],
                    hand: ['voice-of-honor', 'way-of-the-crane']
                },
                player2: {
                    honor: 10,
                    inPlay: ['righteous-magistrate'],
                    hand: ['fine-katana', 'ornate-fan']
                }
            });

            this.merchant = this.player1.findCardByName('merchant-of-curiosities');
            this.voice = this.player1.findCardByName('voice-of-honor');
            this.crane = this.player1.findCardByName('way-of-the-crane');

            this.katana = this.player2.findCardByName('fine-katana');
            this.fan = this.player2.findCardByName('ornate-fan');
            this.magistrate = this.player2.findCardByName('righteous-magistrate');

            this.player1.moveCard(this.crane, 'conflict deck');
            this.player2.moveCard(this.fan, 'conflict deck');
        });

        it('should allow you to discard a card', function() {
            this.player1.clickCard(this.merchant);
            expect(this.player1).toHavePrompt('Select card to discard');
            expect(this.player1).toBeAbleToSelect(this.voice);
        });

        it('should prompt opponent to choose to discard a card', function() {
            this.player1.clickCard(this.merchant);
            this.player1.clickCard(this.voice);
            expect(this.player2).toHavePrompt('Give an honor and discard a card?');
            expect(this.player2).toHavePromptButton('Yes');
            expect(this.player2).toHavePromptButton('No');
            expect(this.player2).not.toHavePromptButton('Cancel');
        });

        it('should allow opponent to choose to discard a card', function() {
            this.player1.clickCard(this.merchant);
            this.player1.clickCard(this.voice);
            this.player2.clickPrompt('Yes');
            expect(this.player2).toHavePrompt('Choose a card to discard');
            expect(this.player2).toBeAbleToSelect(this.katana);
        });

        it('should discard both cards, give an honor, and then draw a card for each player', function() {
            this.player1.clickCard(this.merchant);
            this.player1.clickCard(this.voice);
            this.player2.clickPrompt('Yes');
            this.player2.clickCard(this.katana);

            expect(this.voice.location).toBe('conflict discard pile');
            expect(this.katana.location).toBe('conflict discard pile');

            expect(this.crane.location).toBe('hand');
            expect(this.fan.location).toBe('hand');

            expect(this.player1.honor).toBe(11);
            expect(this.player2.honor).toBe(9);

            expect(this.getChatLogs(2)).toContain('player2 chooses to discard a card and give player1 1 honor');
            expect(this.getChatLogs(1)).toContain('player1 uses Merchant of Curiosities, discarding Voice of Honor to draw a card.  player2 gives player1 1 honor to discard Fine Katana and draw a card');
        });

        it('should work if opponent chooses not to take the action', function() {
            this.player1.clickCard(this.merchant);
            this.player1.clickCard(this.voice);
            this.player2.clickPrompt('No');

            expect(this.voice.location).toBe('conflict discard pile');
            expect(this.crane.location).toBe('hand');
            expect(this.fan.location).toBe('conflict deck');

            expect(this.player1.honor).toBe(10);
            expect(this.player2.honor).toBe(10);

            expect(this.getChatLogs(1)).toContain('player1 uses Merchant of Curiosities, discarding Voice of Honor to draw a card');
        });

        it('should not give your opponent an option if they cannot give the honor', function() {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.merchant],
                defenders: [this.magistrate],
                type: 'military'
            });

            this.player2.pass();
            this.player1.clickCard(this.merchant);
            this.player1.clickCard(this.voice);

            expect(this.voice.location).toBe('conflict discard pile');
            expect(this.crane.location).toBe('hand');
            expect(this.fan.location).toBe('conflict deck');

            expect(this.player1.honor).toBe(10);
            expect(this.player2.honor).toBe(10);

            expect(this.player2).toHavePrompt('Conflict Action Window');
        });

        it('should not work if I have no cards', function() {
            this.player1.moveCard(this.voice, 'conflict deck');

            expect(this.player1).toHavePrompt('Action Window');
            this.player1.clickCard(this.merchant);
            expect(this.player1).toHavePrompt('Action Window');
        });

        it('should work if opponent has no cards and they shouldn\'t be given the choice to pay the honor', function() {
            this.player2.moveCard(this.katana, 'conflict deck');

            this.player1.clickCard(this.merchant);
            this.player1.clickCard(this.voice);

            expect(this.voice.location).toBe('conflict discard pile');
            expect(this.crane.location).toBe('hand');

            expect(this.player1.honor).toBe(10);
            expect(this.player2.honor).toBe(10);

            expect(this.player2).toHavePrompt('Action Window');
        });
    });
});
