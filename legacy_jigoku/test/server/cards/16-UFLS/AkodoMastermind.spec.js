describe('Akodo Mastermind', function() {
    integration(function() {
        beforeEach(function() {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['akodo-mastermind', 'doji-kuwanan', 'doomed-shugenja'],
                    conflictDiscard: ['logistics', 'battlefield-orders', 'by-any-means', 'even-the-odds', 'way-of-the-lion']
                },
                player2: {
                    inPlay: ['doji-whisperer']
                }
            });

            this.doomed = this.player1.findCardByName('doomed-shugenja');
            this.mastermind = this.player1.findCardByName('akodo-mastermind');
            this.kuwanan = this.player1.findCardByName('doji-kuwanan');
            this.whisperer = this.player2.findCardByName('doji-whisperer');

            this.tactic1 = this.player1.findCardByName('logistics');
            this.tactic2 = this.player1.findCardByName('battlefield-orders');
            this.tactic3 = this.player1.findCardByName('by-any-means');
            this.tactic4 = this.player1.findCardByName('even-the-odds');
            this.lion = this.player1.findCardByName('way-of-the-lion');
        });

        it('should not trigger out of conflict', function() {
            expect(this.player1).toHavePrompt('Action Window');
            this.player1.clickCard(this.mastermind);
            expect(this.player1).toHavePrompt('Action Window');
        });

        it('should not trigger if not participating', function() {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.kuwanan],
                defenders: [this.whisperer],
                type: 'military'
            });
            this.player2.pass();
            expect(this.player1).toHavePrompt('Conflict Action Window');
            this.player1.clickCard(this.mastermind);
            expect(this.player1).toHavePrompt('Conflict Action Window');
        });

        it('should prompt you to remove tactics', function() {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.kuwanan, this.mastermind],
                defenders: [this.whisperer],
                type: 'military'
            });
            this.player2.pass();
            this.player1.clickCard(this.mastermind);
            expect(this.player1).toHavePrompt('Select card to remove from game');
            expect(this.player1).toBeAbleToSelect(this.tactic1);
            expect(this.player1).toBeAbleToSelect(this.tactic2);
            expect(this.player1).toBeAbleToSelect(this.tactic3);
            expect(this.player1).toBeAbleToSelect(this.tactic4);
            expect(this.player1).not.toBeAbleToSelect(this.lion);
        });

        it('should prompt you to choose a participating character with glory <= tactics chosen', function() {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.kuwanan, this.mastermind],
                defenders: [this.whisperer],
                type: 'military'
            });
            this.player2.pass();
            this.player1.clickCard(this.mastermind);
            this.player1.clickCard(this.tactic1);
            this.player1.clickCard(this.tactic2);
            this.player1.clickPrompt('Done');
            expect(this.player1).toBeAbleToSelect(this.mastermind);
            expect(this.player1).not.toBeAbleToSelect(this.kuwanan);
            expect(this.player1).toBeAbleToSelect(this.whisperer);
            expect(this.player1).not.toBeAbleToSelect(this.doomed);

            this.player1.clickCard(this.whisperer);
            expect(this.whisperer.bowed).toBe(true);
            expect(this.tactic1.location).toBe('removed from game');
            expect(this.tactic2.location).toBe('removed from game');
            expect(this.tactic3.location).toBe('conflict discard pile');
            expect(this.getChatLogs(5)).toContain('player1 uses Akodo Mastermind, removing Logistics and Battlefield Orders from the game to bow Doji Whisperer');
        });

        it('if you remove too few cards should fizzle the effect', function() {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.kuwanan, this.mastermind],
                defenders: [],
                type: 'military'
            });
            this.player2.pass();
            this.player1.clickCard(this.mastermind);
            this.player1.clickCard(this.tactic1);
            this.player1.clickPrompt('Done');
            expect(this.tactic1.location).toBe('removed from game');
            expect(this.getChatLogs(5)).toContain('player1 attempted to use Akodo Mastermind, but there are insufficient legal targets');
            expect(this.player2).toHavePrompt('Conflict Action Window');
        });
    });
});
