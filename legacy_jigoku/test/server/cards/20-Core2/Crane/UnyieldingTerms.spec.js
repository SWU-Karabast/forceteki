describe('Unyielding Terms', function () {
    integration(function () {
        beforeEach(function () {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    fate: 20,
                    inPlay: ['daidoji-akikore', 'brash-samurai', 'doji-challenger'],
                    hand: ['unyielding-terms']
                },
                player2: {
                    inPlay: ['isawa-atsuko', 'solemn-scholar'],
                    hand: ['let-go', 'fine-katana', 'a-new-name', 'assassination', 'against-the-waves']
                }
            });

            this.akikore = this.player1.findCardByName('daidoji-akikore');
            this.brash = this.player1.findCardByName('brash-samurai');
            this.challenger = this.player1.findCardByName('doji-challenger');
            this.unyieldingTerms = this.player1.findCardByName('unyielding-terms');

            this.atsuko = this.player2.findCardByName('isawa-atsuko');
            this.scholar = this.player2.findCardByName('solemn-scholar');
            this.letgo = this.player2.findCardByName('let-go');
            this.katana = this.player2.findCardByName('fine-katana');
            this.ann = this.player2.findCardByName('a-new-name');
            this.assassination = this.player2.findCardByName('assassination');
            this.atw = this.player2.findCardByName('against-the-waves');
        });

        it('should give opportunity to refuse', function () {
            this.player1.clickCard(this.unyieldingTerms);
            this.player1.clickCard(this.akikore);
            this.player1.clickCard(this.atsuko);
            expect(this.player2).toHavePrompt('Do you wish to refuse the duel?');
            expect(this.player2).toHavePromptButton('Yes');
            expect(this.player2).toHavePromptButton('No');
        });

        it('should discard half your hand rounded down to refuse', function () {
            this.player1.clickCard(this.unyieldingTerms);
            this.player1.clickCard(this.akikore);
            this.player1.clickCard(this.atsuko);

            this.player2.clickPrompt('Yes');
            expect(this.player2).toBeAbleToSelect(this.letgo);
            expect(this.player2).toBeAbleToSelect(this.katana);
            expect(this.player2).toBeAbleToSelect(this.assassination);
            expect(this.player2).toBeAbleToSelect(this.ann);
            expect(this.player2).toBeAbleToSelect(this.atw);

            expect(this.player2).toHavePrompt('Choose 2 cards to discard');
            expect(this.getChatLogs(5)).toContain(
                'player2 chooses to refuse the duel and discard 2 cards from their hand'
            );

            this.player2.clickCard(this.letgo);
            expect(this.player2).not.toHavePromptButton('Done');
            this.player2.clickCard(this.katana);
            expect(this.player2).toHavePromptButton('Done');
            this.player2.clickPrompt('Done');

            expect(this.letgo.location).toBe('conflict discard pile');
            expect(this.katana.location).toBe('conflict discard pile');

            expect(this.getChatLogs(5)).toContain('player2 discards Let Go and Fine Katana');
            expect(this.player2).toHavePrompt('Action Window');
        });

        it('should bow the loser & remove a fate if winner is a duelist', function () {
            this.atsuko.fate = 2;

            this.player1.clickCard(this.unyieldingTerms);
            this.player1.clickCard(this.akikore);
            this.player1.clickCard(this.atsuko);
            this.player2.clickPrompt('No');

            expect(this.player1).toHavePrompt('Honor Bid');
            this.player1.clickPrompt('5');
            this.player2.clickPrompt('1');

            expect(this.getChatLogs(10)).toContain('Duel Effect: bow and remove 1 fate from Isawa Atsuko');
            expect(this.atsuko.bowed).toBe(true);
            expect(this.atsuko.fate).toBe(1);
        });

        it('should not remove fate if winner is not a duelist', function () {
            this.atsuko.fate = 2;

            this.player1.clickCard(this.unyieldingTerms);
            this.player1.clickCard(this.brash);
            this.player1.clickCard(this.atsuko);
            this.player2.clickPrompt('No');

            this.player1.clickPrompt('5');
            this.player2.clickPrompt('1');

            expect(this.getChatLogs(10)).toContain('Duel Effect: bow Isawa Atsuko');
            expect(this.atsuko.bowed).toBe(true);
            expect(this.atsuko.fate).toBe(2);
        });

        it('during a conflict should let you pick a mix of participating and not', function () {
            this.challenger.ready();
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.brash, this.challenger],
                defenders: [this.atsuko]
            });

            this.player2.pass();

            this.player1.clickCard(this.unyieldingTerms);
            expect(this.player1).toBeAbleToSelect(this.akikore);
            expect(this.player1).toBeAbleToSelect(this.challenger);
            this.player1.clickCard(this.akikore);
            expect(this.player1).toBeAbleToSelect(this.atsuko);
            expect(this.player1).toBeAbleToSelect(this.scholar);
        });
    });
});