describe('Cleanse the Empire', function() {
    integration(function() {
        beforeEach(function () {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['doji-kuwanan', 'brash-samurai'],
                    hand: ['cleanse-the-empire']
                },
                player2: {
                    inPlay: ['doji-challenger', 'doji-whisperer', 'ancient-master']
                }
            });

            this.kuwanan = this.player1.findCardByName('doji-kuwanan');
            this.brash = this.player1.findCardByName('brash-samurai');
            this.cleanse = this.player1.findCardByName('cleanse-the-empire');

            this.challenger = this.player2.findCardByName('doji-challenger');
            this.whisperer = this.player2.findCardByName('doji-whisperer');
            this.master = this.player2.findCardByName('ancient-master');

            this.challenger.fate = 2;
            this.whisperer.fate = 1;
            this.master.fate = 0;
            this.kuwanan.fate = 1;
        });

        it('should trigger if you win on attack', function () {
            this.noMoreActions();
            this.initiateConflict({
                type: 'military',
                attackers: [this.kuwanan],
                defenders: [this.challenger]
            });

            this.noMoreActions();
            expect(this.player1).toHavePrompt('Triggered Abilities');
            expect(this.player1).toBeAbleToSelect(this.cleanse);
        });

        it('should not trigger if you win on defense', function () {
            this.noMoreActions();
            this.player1.passConflict();
            this.noMoreActions();
            this.initiateConflict({
                type: 'military',
                attackers: [this.challenger],
                defenders: [this.kuwanan]
            });

            this.noMoreActions();
            expect(this.player1).toHavePrompt('Action Window');
        });

        it('should not trigger if you lose on attack', function () {
            this.noMoreActions();
            this.initiateConflict({
                type: 'political',
                attackers: [this.kuwanan],
                defenders: [this.challenger, this.whisperer]
            });

            this.noMoreActions();
            expect(this.player1).toHavePrompt('Action Window');
        });

        it('should remove one fate from all opponent\'s characters with fate then prompt you to bow one without fate', function () {
            this.noMoreActions();
            this.initiateConflict({
                type: 'military',
                attackers: [this.kuwanan],
                defenders: [this.challenger]
            });

            this.noMoreActions();
            this.player1.clickCard(this.cleanse);
            expect(this.kuwanan.fate).toBe(1);
            expect(this.challenger.fate).toBe(1);
            expect(this.whisperer.fate).toBe(0);
            expect(this.master.fate).toBe(0);

            expect(this.player1).toHavePrompt('Choose a character to bow');
            expect(this.player1).not.toBeAbleToSelect(this.kuwanan);
            expect(this.player1).not.toBeAbleToSelect(this.brash);
            expect(this.player1).not.toBeAbleToSelect(this.challenger);
            expect(this.player1).toBeAbleToSelect(this.whisperer);
            expect(this.player1).toBeAbleToSelect(this.master);

            expect(this.master.bowed).toBe(false);
            this.player1.clickCard(this.master);
            expect(this.master.bowed).toBe(true);

            expect(this.getChatLogs(5)).toContain('player1 plays Cleanse the Empire to remove 1 fate from Ancient Master, Doji Challenger and Doji Whisperer');
            expect(this.getChatLogs(5)).toContain('player1 chooses to bow Ancient Master');
        });

        it('should be playable when no one has fate', function () {
            this.whisperer.fate = 0;
            this.challenger.fate = 0;
            this.master.fate = 0;

            this.noMoreActions();
            this.initiateConflict({
                type: 'military',
                attackers: [this.kuwanan],
                defenders: [this.challenger]
            });

            this.noMoreActions();
            this.player1.clickCard(this.cleanse);
            this.player1.clickCard(this.master);
            expect(this.master.bowed).toBe(true);

            expect(this.getChatLogs(5)).toContain('player1 plays Cleanse the Empire to remove 1 fate from Ancient Master, Doji Challenger and Doji Whisperer');
            expect(this.getChatLogs(5)).toContain('player1 chooses to bow Ancient Master');
        });

        it('should not prompt you to bow if there are no valid targets', function () {
            this.whisperer.fate = 5;
            this.challenger.fate = 5;
            this.master.fate = 5;

            this.noMoreActions();
            this.initiateConflict({
                type: 'military',
                attackers: [this.kuwanan],
                defenders: [this.challenger]
            });

            this.noMoreActions();
            this.player1.clickCard(this.cleanse);
            expect(this.player1).not.toHavePrompt('Choose a character to bow');

            expect(this.getChatLogs(5)).toContain('player1 plays Cleanse the Empire to remove 1 fate from Ancient Master, Doji Challenger and Doji Whisperer');
        });
    });
});
