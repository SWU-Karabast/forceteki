describe('Seven Fold Palace', function() {
    integration(function() {
        beforeEach(function() {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    stronghold: 'seven-fold-palace',
                    inPlay: ['callow-delegate', 'kakita-yoshi']
                },
                player2: {
                    inPlay: ['doji-challenger']
                }
            });

            this.sevenFoldPalace = this.player1.findCardByName('seven-fold-palace');
            this.callow = this.player1.findCardByName('callow-delegate');
            this.yoshi = this.player1.findCardByName('kakita-yoshi');

            this.challenger = this.player2.findCardByName('doji-challenger');
        });

        it('should trigger when you win a conflict with an honored attacking character', function() {
            this.callow.honor();
            this.noMoreActions();
            this.initiateConflict({
                type: 'political',
                attackers: [this.callow],
                defenders: []
            });

            this.noMoreActions();
            let honor = this.player1.honor;

            expect(this.player1).toHavePrompt('Triggered Abilities');
            expect(this.player1).toBeAbleToSelect(this.sevenFoldPalace);
            this.player1.clickCard(this.sevenFoldPalace);
            expect(this.player1.honor).toBe(honor + 2);

            expect(this.getChatLogs(10)).toContain('player1 uses Seven Fold Palace, bowing Seven Fold Palace to gain 2 honor');
        });

        it('should trigger when you lose a conflict with an honored attacking character', function() {
            this.callow.honor();
            this.noMoreActions();
            this.initiateConflict({
                type: 'political',
                attackers: [this.callow],
                defenders: [this.challenger]
            });
            this.noMoreActions();
            expect(this.player1).not.toHavePrompt('Triggered Abilities');
        });

        it('should not trigger when you win a conflict without an honored character', function() {
            this.noMoreActions();
            this.initiateConflict({
                type: 'political',
                attackers: [this.callow],
                defenders: []
            });
            this.noMoreActions();
            expect(this.player1).not.toHavePrompt('Triggered Abilities');
        });

        it('should not trigger when you win a conflict on defense', function() {
            this.yoshi.honor();
            this.noMoreActions();
            this.player1.passConflict();
            this.noMoreActions();
            this.initiateConflict({
                type: 'political',
                attackers: [this.challenger],
                defenders: [this.yoshi]
            });
            this.noMoreActions();
            expect(this.player1).not.toHavePrompt('Triggered Abilities');
        });
    });
});
