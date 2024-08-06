describe('Revered Ikoma', function() {
    integration(function() {
        beforeEach(function() {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['renowned-singer'],
                    conflictDiscard: ['let-go', 'assassination', 'fine-katana', 'hiruma-skirmisher']
                }
            });

            this.singer = this.player1.findCardByName('renowned-singer');
            this.letGo = this.player1.findCardByName('let-go');
            this.assassination = this.player1.findCardByName('assassination');
            this.katana = this.player1.findCardByName('fine-katana');
            this.skirmisher = this.player1.findCardByName('hiruma-skirmisher');
            this.singer.fate = 5;
        });

        it('should not trigger if you haven\'t gained 2 honor this phase yet', function() {
            expect(this.player1).toHavePrompt('Action Window');
            this.player1.clickCard(this.singer);
            expect(this.player1).toHavePrompt('Action Window');
        });

        it('should not trigger if you have gained only 1 honor this phase', function() {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.singer],
                defenders: [],
                type: 'political'
            });

            this.player2.pass();
            this.player1.pass();
            this.player1.clickPrompt('Take 1 Honor from opponent');

            expect(this.player1).toHavePrompt('Action Window');
            this.player1.clickCard(this.singer);
            expect(this.player1).toHavePrompt('Action Window');
        });

        it('should trigger if you have gained 2 honor this phase', function() {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.singer],
                defenders: [],
                type: 'political'
            });

            this.player2.pass();
            this.player1.pass();
            this.player1.clickPrompt('Gain 2 Honor');

            expect(this.player1).toHavePrompt('Action Window');
            this.player1.clickCard(this.singer);
            expect(this.player1).toHavePrompt('Choose two conflict cards');
            expect(this.player1).toBeAbleToSelect(this.letGo);
            expect(this.player1).toBeAbleToSelect(this.assassination);
            expect(this.player1).toBeAbleToSelect(this.katana);
            expect(this.player1).toBeAbleToSelect(this.skirmisher);
        });

        it('should prompt opponent to pick a card to put into your hand', function() {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.singer],
                defenders: [],
                type: 'political'
            });

            this.player2.pass();
            this.player1.pass();
            this.player1.clickPrompt('Gain 2 Honor');

            expect(this.player1).toHavePrompt('Action Window');
            this.player1.clickCard(this.singer);
            this.player1.clickCard(this.assassination);
            this.player1.clickCard(this.skirmisher);
            this.player1.clickPrompt('Done');
            expect(this.player2).toHavePrompt('Choose a card to add to your opponent\'s hand');
            expect(this.player2).toHavePromptButton('Assassination');
            expect(this.player2).toHavePromptButton('Hiruma Skirmisher');
            expect(this.player2).not.toHavePromptButton('Done');
        });

        it('should put the picked card in your hand and the other on the bottom of your deck', function() {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.singer],
                defenders: [],
                type: 'political'
            });

            this.player2.pass();
            this.player1.pass();
            this.player1.clickPrompt('Gain 2 Honor');

            let hand = this.player1.hand.length;
            let deck = this.player1.conflictDeck.length;

            expect(this.player1).toHavePrompt('Action Window');
            this.player1.clickCard(this.singer);
            this.player1.clickCard(this.assassination);
            this.player1.clickCard(this.skirmisher);
            this.player1.clickPrompt('Done');
            this.player2.clickPrompt('Assassination');
            expect(this.assassination.location).toBe('hand');
            expect(this.skirmisher.location).toBe('conflict deck');
            expect(this.player1.player.conflictDeck.last()).toBe(this.skirmisher);
            expect(this.player1.hand.length).toBe(hand + 1);
            expect(this.player1.conflictDeck.length).toBe(deck + 1);

            expect(this.getChatLogs(5)).toContain('player1 uses Renowned Singer to have player2 return one of Assassination and Hiruma Skirmisher to player1\'s hand');
            expect(this.getChatLogs(5)).toContain('player2 chooses Assassination to be put into player1\'s hand. Hiruma Skirmisher is put on the bottom of player1\'s conflict deck');
        });

        it('should take into account a new phase', function() {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.singer],
                defenders: [],
                type: 'political'
            });

            this.player1.player.promptedActionWindows.fate = true;
            this.player2.player.promptedActionWindows.fate = true;

            this.player2.pass();
            this.player1.pass();
            this.player1.clickPrompt('Gain 2 Honor');
            this.flow.finishConflictPhase();

            expect(this.player1).toHavePrompt('Action Window');
            this.player1.clickCard(this.singer);
            expect(this.player1).toHavePrompt('Action Window');
        });
    });
});
