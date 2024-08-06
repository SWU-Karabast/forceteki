describe('Seize The Day', function() {
    integration(function() {
        beforeEach(function() {
            this.setupTest({
                phase: 'draw',
                player1: {
                    conflictDiscard: ['seize-the-day', 'way-of-the-unicorn']
                },
                player2: {
                    conflictDiscard: ['seize-the-day']
                }
            });
            this.seizeP1 = this.player1.findCardByName('seize-the-day');
            this.seizeP2 = this.player2.findCardByName('seize-the-day');
            this.unicorn = this.player1.findCardByName('way-of-the-unicorn');

            this.player1.clickPrompt('1');
            this.player2.clickPrompt('1');
        });

        it('should trigger at start of the conflict phase if you are 2nd player', function() {
            this.player2.moveCard(this.seizeP2, 'hand');
            this.noMoreActions();
            expect(this.player2).toHavePrompt('Triggered Abilities');
            expect(this.player2).toBeAbleToSelect(this.seizeP2);
        });

        it('should not trigger at start of the conflict phase if you are 1st player', function() {
            this.player1.moveCard(this.seizeP1, 'hand');
            this.noMoreActions();
            expect(this.player1).not.toHavePrompt('Triggered Abilities');
            expect(this.player1).toHavePrompt('Action Window');
        });

        it('should make you the first player', function() {
            this.player2.moveCard(this.seizeP2, 'hand');
            this.noMoreActions();
            expect(this.player2).toHavePrompt('Triggered Abilities');
            expect(this.player2).toBeAbleToSelect(this.seizeP2);
            this.player2.clickCard(this.seizeP2);
            expect(this.getChatLogs(1)).toContain('player2 plays Seize the Day to become first player!');
            expect(this.player2).toHavePrompt('Action Window');
            expect(this.player1).toHavePrompt('Waiting for opponent to take an action or pass');
        });

        it('should allow way of the unicorn to keep the first player token', function() {
            this.player2.moveCard(this.seizeP2, 'hand');
            this.player1.moveCard(this.unicorn, 'hand');
            this.noMoreActions();
            expect(this.player2).toHavePrompt('Triggered Abilities');
            expect(this.player2).toBeAbleToSelect(this.seizeP2);
            this.player2.clickCard(this.seizeP2);
            expect(this.getChatLogs(1)).toContain('player2 plays Seize the Day to become first player!');
            expect(this.player1).toHavePrompt('Triggered Abilities');
            expect(this.player1).toBeAbleToSelect(this.unicorn);
            this.player1.clickCard(this.unicorn);
            expect(this.getChatLogs(1)).toContain('player1 plays Way of the Unicorn to keep the first player token');
            expect(this.player1).toHavePrompt('Action Window');
            expect(this.player2).toHavePrompt('Waiting for opponent to take an action or pass');
        });

        it('should allow seize the day to be played in respones to seize the day', function() {
            this.player2.moveCard(this.seizeP2, 'hand');
            this.player1.moveCard(this.seizeP1, 'hand');
            this.noMoreActions();
            expect(this.player2).toHavePrompt('Triggered Abilities');
            expect(this.player2).toBeAbleToSelect(this.seizeP2);
            this.player2.clickCard(this.seizeP2);
            expect(this.getChatLogs(1)).toContain('player2 plays Seize the Day to become first player!');
            expect(this.player1).toHavePrompt('Triggered Abilities');
            expect(this.player1).toBeAbleToSelect(this.seizeP1);
            this.player1.clickCard(this.seizeP1);
            expect(this.getChatLogs(1)).toContain('player1 plays Seize the Day to become first player!');
            expect(this.player1).toHavePrompt('Action Window');
            expect(this.player2).toHavePrompt('Waiting for opponent to take an action or pass');
        });
    });
});
