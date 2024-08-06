describe('Thunder Guard Elite', function() {
    integration(function() {
        beforeEach(function() {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['thunder-guard-elite', 'bayushi-liar']
                },
                player2: {
                    hand: ['finger-of-jade', 'pacifism']
                }
            });

            this.thunderGuardElite = this.player1.findCardByName('thunder-guard-elite');
            this.liar = this.player1.findCardByName('bayushi-liar');
        });

        it('should not work outside a conflict', function() {
            this.player1.clickCard(this.thunderGuardElite);

            expect(this.player1).toHavePrompt('Action Window');
            expect(this.getChatLogs(4)).not.toContain('player1 uses Thunder Guard Elite, losing 1 honor to make player2 discard 1 card at random');
        });

        it('should not work while not participating', function() {
            this.noMoreActions();

            this.initiateConflict({
                attackers: [this.liar],
                defenders: [],
                type: 'political'
            });

            this.player2.pass();
            this.player1.clickCard(this.thunderGuardElite);
            expect(this.player1).toHavePrompt('Conflict Action Window');
            expect(this.getChatLogs(4)).not.toContain('player1 uses Thunder Guard Elite, losing 1 honor to make player2 discard 1 card at random');
        });

        it('should let you pay 1 honor to make the opponent discard a random card', function() {
            this.noMoreActions();

            this.initiateConflict({
                attackers: [this.thunderGuardElite],
                defenders: []
            });

            this.initialHonor = this.player1.honor;
            this.initialHandSize = this.player2.hand.length;
            this.player2.pass();

            this.player1.clickCard(this.thunderGuardElite);
            expect(this.getChatLogs(4)).toContain('player1 uses Thunder Guard Elite, losing 1 honor to make player2 discard 1 card at random');
            expect(this.player1.honor).toBe(this.initialHonor - 1);
            expect(this.player2.hand.length).toBe(this.initialHandSize - 1);
        });
    });
});
