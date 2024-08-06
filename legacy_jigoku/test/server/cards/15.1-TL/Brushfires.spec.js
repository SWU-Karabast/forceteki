describe('Brushfires', function() {
    integration(function() {
        beforeEach(function() {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['doji-challenger', 'brash-samurai', 'doji-whisperer'],
                    dynastyDiscard: ['bayushi-shoju', 'shiba-tsukune', 'imperial-storehouse', 'windswept-yurt', 'dispatch-to-nowhere', 'daidoji-netsu']
                },
                player2: {
                    role: ['keeper-of-void'],
                    inPlay: ['doji-whisperer', 'daidoji-uji'],
                    provinces: ['brushfires']
                }
            });

            this.challenger = this.player1.findCardByName('doji-challenger');
            this.brash = this.player1.findCardByName('brash-samurai');
            this.whisperer = this.player1.findCardByName('doji-whisperer');
            this.challenger.fate = 2;
            this.brash.fate = 1;
            this.whisperer.fate = 0;
            this.brush = this.player2.findCardByName('brushfires');


        });
        it('should remove two fate from an attacking player', function() {
            this.noMoreActions();
            expect(this.brush.facedown).toBe(true);
            this.initiateConflict({
                attackers: [this.challenger],
                province: this.brush
            });
            let challengerFate = this.challenger.fate;
            expect(this.player2).toHavePrompt('Triggered Abilities');
            expect(this.player2).toBeAbleToSelect(this.brush);
            this.player2.clickCard(this.brush);
            this.player2.clickCard(this.challenger);
            expect(this.challenger.fate).toBe(challengerFate - 2);
            expect(this.getChatLogs(5)).toContain('player2 uses Brushfires to remove 2 fate from Doji Challenger');
        });


        it('can remove 1 fate', function() {
            this.noMoreActions();
            expect(this.brush.facedown).toBe(true);
            this.initiateConflict({
                attackers: [this.brash],
                province: this.brush
            });
            let brashFate = this.brash.fate;
            expect(this.player2).toHavePrompt('Triggered Abilities');
            expect(this.player2).toBeAbleToSelect(this.brush);
            this.player2.clickCard(this.brush);
            this.player2.clickCard(this.brash);
            expect(this.brash.fate).toBe(brashFate - 1);
        });

        it('cannot choose an unfated character', function() {
            this.noMoreActions();
            expect(this.brush.facedown).toBe(true);
            this.initiateConflict({
                attackers: [this.whisperer, this.challenger],
                province: this.brush
            });

            expect(this.player2).toHavePrompt('Triggered Abilities');
            expect(this.player2).toBeAbleToSelect(this.brush);
            this.player2.clickCard(this.brush);
            expect(this.player2).not.toBeAbleToSelect(this.whisperer);
        });

        it('can only choose an attacking character', function() {
            this.noMoreActions();
            expect(this.brush.facedown).toBe(true);
            this.initiateConflict({
                attackers: [this.challenger],
                province: this.brush
            });

            expect(this.player2).toHavePrompt('Triggered Abilities');
            expect(this.player2).toBeAbleToSelect(this.brush);
            this.player2.clickCard(this.brush);
            expect(this.player2).not.toBeAbleToSelect(this.brash);
        });
    });
});
