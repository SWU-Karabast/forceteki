describe('Shiba-sha Heiden', function () {
    integration(function () {
        describe('Province fill reaction', function () {
            beforeEach(function () {
                this.setupTest({
                    phase: 'fate',
                    player1: {
                        dynastyDeck: ['shiba-sha-heiden'],
                        provinces: ['pilgrimage'],
                        dynastyDiscard: ['doji-whisperer']
                    }
                });

                this.shibaShaHeiden = this.player1.placeCardInProvince('shiba-sha-heiden', 'province 1');
                this.shibaShaHeiden.facedown = false;

                this.prov1 = this.player1.findCardByName('pilgrimage');
                this.dojiWhisperer = this.player1.moveCard('doji-whisperer', 'dynasty deck');
            });

            it('fills province with extra card on dynasty phase start', function () {
                this.noMoreActions();
                this.player1.clickPrompt('Done');
                this.player2.clickPrompt('Done');
                this.player2.clickPrompt('End Round');
                this.player1.clickPrompt('End Round');
                expect(this.player1).toHavePrompt('Triggered Abilities');

                this.player1.clickCard(this.shibaShaHeiden);
                expect(this.dojiWhisperer.location).toBe('province 1');
                expect(this.getChatLogs(5)).toContain('player1 uses Shiba-sha Heiden to fill its province with 1 card');
                expect(this.player2).toHavePrompt('Play cards from provinces');
            });
        });

        describe('Resource Swap action', function () {
            beforeEach(function () {
                this.setupTest({
                    player1: {
                        hand: ['fine-katana', 'ornate-fan'],
                        dynastyDeck: ['shiba-sha-heiden']
                    }
                });

                this.fineKatana = this.player1.findCardByName('fine-katana');
                this.shibaShaHeiden = this.player1.placeCardInProvince('shiba-sha-heiden', 'province 1');
                this.shibaShaHeiden.facedown = false;
            });

            it('trades cards for fate', function () {
                const initialFate = this.player1.fate;
                const initialHandSize = this.player1.hand.length;
                this.player1.clickCard(this.shibaShaHeiden);
                expect(this.player1).toHavePrompt('Shiba-sha Heiden');
                expect(this.player1).toHavePromptButton('Pay 1 fate to draw a card');
                expect(this.player1).toHavePromptButton('Discard a card to gain 1 fate');
                expect(this.player1).toHavePromptButton('Discard a card to draw a card');

                this.player1.clickPrompt('Discard a card to gain 1 fate');
                this.player1.clickCard(this.fineKatana);

                expect(this.fineKatana.location).toBe('conflict discard pile');
                expect(this.player1.fate).toBe(initialFate + 1);
                expect(this.player1.hand.length).toBe(initialHandSize - 1);
                expect(this.getChatLogs(5)).toContain(
                    'player1 uses Shiba-sha Heiden, discarding Fine Katana to gain 1 fate'
                );
            });

            it('trades fate for cards', function () {
                const initialFate = this.player1.fate;
                const initialHandSize = this.player1.hand.length;
                this.player1.clickCard(this.shibaShaHeiden);
                expect(this.player1).toHavePrompt('Shiba-sha Heiden');
                expect(this.player1).toHavePromptButton('Pay 1 fate to draw a card');
                expect(this.player1).toHavePromptButton('Discard a card to gain 1 fate');
                expect(this.player1).toHavePromptButton('Discard a card to draw a card');

                this.player1.clickPrompt('Pay 1 fate to draw a card');
                expect(this.player1.fate).toBe(initialFate - 1);
                expect(this.player1.hand.length).toBe(initialHandSize + 1);
                expect(this.getChatLogs(5)).toContain('player1 uses Shiba-sha Heiden, spending 1 fate to draw 1 card');
            });

            it('trades cards for cards', function () {
                const initialFate = this.player1.fate;
                const initialHandSize = this.player1.hand.length;
                this.player1.clickCard(this.shibaShaHeiden);
                expect(this.player1).toHavePrompt('Shiba-sha Heiden');
                expect(this.player1).toHavePromptButton('Pay 1 fate to draw a card');
                expect(this.player1).toHavePromptButton('Discard a card to gain 1 fate');
                expect(this.player1).toHavePromptButton('Discard a card to draw a card');

                this.player1.clickPrompt('Discard a card to draw a card');
                this.player1.clickCard(this.fineKatana);

                expect(this.fineKatana.location).toBe('conflict discard pile');
                expect(this.player1.fate).toBe(initialFate);
                expect(this.player1.hand.length).toBe(initialHandSize);
                expect(this.getChatLogs(5)).toContain(
                    'player1 uses Shiba-sha Heiden, discarding Fine Katana to draw 1 card'
                );
            });

            it('cannot use multiples at same round', function () {
                this.player1.clickCard(this.shibaShaHeiden);
                expect(this.player1).toHavePrompt('Shiba-sha Heiden');
                this.player1.clickPrompt('Discard a card to draw a card');
                this.player1.clickCard(this.fineKatana);

                this.player2.pass();

                this.player1.clickCard(this.shibaShaHeiden);
                expect(this.player1).not.toHavePrompt('Shiba-sha Heiden');
            });
        });
    });
});
