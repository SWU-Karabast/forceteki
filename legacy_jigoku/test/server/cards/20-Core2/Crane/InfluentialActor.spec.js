xdescribe('Influential Actor', function () {
    integration(function () {
        beforeEach(function () {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['influential-actor', 'doji-whisperer', 'brash-samurai']
                },
                player2: {
                    inPlay: ['bayushi-liar']
                }
            });
            this.actor = this.player1.findCardByName('influential-actor');
            this.brash = this.player1.findCardByName('brash-samurai');
            this.whisperer = this.player1.findCardByName('doji-whisperer');
            this.bayushiLiar = this.player2.findCardByName('bayushi-liar');

            this.actor.honor();
            this.actor.taint();
        });

        it('should target another character you control', function () {
            this.player1.clickCard(this.actor);
            expect(this.player1).toBeAbleToSelect(this.whisperer);
            expect(this.player1).toBeAbleToSelect(this.brash);
            expect(this.player1).not.toBeAbleToSelect(this.actor);
            expect(this.player1).not.toBeAbleToSelect(this.bayushiLiar);
        });

        it('should prompt to choose a status token', function () {
            this.player1.clickCard(this.actor);
            this.player1.clickCard(this.whisperer);
            expect(this.player1).toHavePrompt('Which token do you wish to move?');
            expect(this.player1).toHavePromptButton('Honored Token');
            expect(this.player1).toHavePromptButton('Tainted Token');
            this.player1.clickPrompt('Tainted Token');

            expect(this.whisperer.isTainted).toBe(true);
            expect(this.actor.isTainted).toBe(false);
        });

        it("should not let you target someone you can't move a token to", function () {
            this.brash.honor();
            this.brash.taint();
            this.player1.clickCard(this.actor);

            expect(this.player1).toBeAbleToSelect(this.whisperer);
            expect(this.player1).not.toBeAbleToSelect(this.brash);
            expect(this.player1).not.toBeAbleToSelect(this.actor);
            expect(this.player1).not.toBeAbleToSelect(this.bayushiLiar);
        });

        it('should not let you move a token target already has', function () {
            this.brash.taint();
            this.player1.clickCard(this.actor);
            this.player1.clickCard(this.brash);
            expect(this.player1).not.toHavePrompt('Which token do you wish to move?');
            expect(this.brash.isHonored).toBe(true);
            expect(this.actor.isHonored).toBe(false);

            expect(this.getChatLogs(5)).toContain(
                'player1 uses Influential Actor to move a status token on it to Brash Samurai'
            );
            expect(this.getChatLogs(5)).toContain('player1 moves Honored Token to Brash Samurai');
        });
    });
});
