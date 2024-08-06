describe('Revered Ikoma', function() {
    integration(function() {
        beforeEach(function() {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['revered-ikoma']
                }
            });

            this.reveredIkoma = this.player1.findCardByName('revered-ikoma');
            this.reveredIkoma.fate = 1;
        });

        it('should not trigger if you haven\'t gained 2 honor this phase yet', function() {
            const playerFate = this.player1.fate;

            this.player1.clickCard(this.reveredIkoma);
            expect(this.player1.fate).toBe(playerFate);
            expect(this.player1).toHavePrompt('Action Window');
        });

        it('should not trigger if you have gained only 1 honor this phase', function() {
            const playerFate = this.player1.fate;

            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.reveredIkoma],
                defenders: [],
                type: 'political'
            });

            this.player2.pass();
            this.player1.pass();
            this.player1.clickPrompt('Take 1 Honor from opponent');

            this.player1.clickCard(this.reveredIkoma);
            expect(this.player1.fate).toBe(playerFate);
        });

        it('should trigger if you have gained 2 honor this phase', function() {
            const playerFate = this.player1.fate;

            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.reveredIkoma],
                defenders: [],
                type: 'political'
            });

            this.player2.pass();
            this.player1.pass();
            this.player1.clickPrompt('Gain 2 Honor');

            this.player1.clickCard(this.reveredIkoma);
            expect(this.player1.fate).toBe(playerFate + 1);
        });

        it('should take into account a new phase', function() {
            const playerFate = this.player1.fate;

            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.reveredIkoma],
                defenders: [],
                type: 'political'
            });

            this.player2.pass();
            this.player1.pass();
            this.player1.clickPrompt('Gain 2 Honor');
            this.flow.finishConflictPhase();
            this.player1.clickPrompt('Done');
            this.player2.clickPrompt('Done');

            expect(this.reveredIkoma.location).toBe('play area');
            this.player1.clickCard(this.reveredIkoma);
            expect(this.player1.fate).toBe(playerFate);
        });

        it('cannot receive dishonored status tokens', function() {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.reveredIkoma],
                defenders: [],
                ring: 'fire',
                type: 'political'
            });

            this.player2.pass();
            this.player1.pass();
            this.player1.clickCard(this.reveredIkoma);

            expect(this.player1).toHavePromptButton('Honor Revered Ikoma');
            expect(this.player1).not.toHavePromptButton('Dishonor Revered Ikoma');
        });
    });
});
