describe('Heresy', function() {
    integration(function() {
        beforeEach(function() {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    honor: 10,
                    inPlay: ['doji-challenger', 'hida-yakamo']
                },
                player2: {
                    honor: 15,
                    inPlay: ['kakita-yoshi', 'kakita-toshimoko'],
                    hand: ['heresy']
                }
            });

            this.challenger = this.player1.findCardByName('doji-challenger');
            this.yakamo = this.player1.findCardByName('hida-yakamo');

            this.yoshi = this.player2.findCardByName('kakita-yoshi');
            this.toshimoko = this.player2.findCardByName('kakita-toshimoko');
            this.heresy = this.player2.findCardByName('heresy');

            this.yoshi.fate = 2;
            this.yakamo.fate = 2;
            this.challenger.fate = 0;
        });

        it('should let each player choose their opponent\'s duelist', function() {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.challenger, this.yakamo],
                defenders: [this.yoshi, this.toshimoko],
                type: 'political'
            });
            this.player2.clickCard(this.heresy);

            expect(this.player1).toHavePrompt('Choose a character');
            expect(this.player1).toBeAbleToSelect(this.yoshi);
            expect(this.player1).toBeAbleToSelect(this.toshimoko);
            expect(this.player1).not.toBeAbleToSelect(this.yakamo);
            expect(this.player1).not.toBeAbleToSelect(this.challenger);
            this.player1.clickCard(this.yoshi);
            expect(this.player2).toHavePrompt('Choose a character');
            expect(this.player2).not.toBeAbleToSelect(this.yoshi);
            expect(this.player2).not.toBeAbleToSelect(this.toshimoko);
            expect(this.player2).toBeAbleToSelect(this.yakamo);
            expect(this.player2).toBeAbleToSelect(this.challenger);
            this.player2.clickCard(this.challenger);

            expect(this.player1).toHavePrompt('Honor Bid');
            expect(this.player2).toHavePrompt('Honor Bid');
        });

        it('should remove a fate from the loser', function() {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.challenger, this.yakamo],
                defenders: [this.yoshi, this.toshimoko],
                type: 'political'
            });
            let fate = this.yoshi.fate;
            this.player2.clickCard(this.heresy);
            this.player1.clickCard(this.yoshi);
            this.player2.clickCard(this.challenger);

            this.player1.clickPrompt('5');
            this.player2.clickPrompt('1');
            expect(this.yoshi.fate).toBe(fate - 1);
            expect(this.getChatLogs(10)).toContain('Duel Effect: remove a fate from Kakita Yoshi');
        });

        it('should do nothing if the loser has no fate', function() {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.challenger, this.yakamo],
                defenders: [this.yoshi, this.toshimoko],
                type: 'political'
            });
            this.player2.clickCard(this.heresy);
            this.player1.clickCard(this.yoshi);
            this.player2.clickCard(this.challenger);

            this.player1.clickPrompt('1');
            this.player2.clickPrompt('1');
            expect(this.getChatLogs(10)).toContain('The duel has no effect');
        });

        it('should do nothing on a tie', function() {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.challenger, this.yakamo],
                defenders: [this.yoshi, this.toshimoko],
                type: 'political'
            });
            this.player2.clickCard(this.heresy);
            this.player1.clickCard(this.yoshi);
            this.player2.clickCard(this.challenger);

            this.player1.clickPrompt('4');
            this.player2.clickPrompt('1');
            expect(this.getChatLogs(10)).toContain('The duel ends in a draw');
            expect(this.getChatLogs(10)).toContain('The duel has no effect');
        });

        it('should do nothing if Yakamo loses', function() {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.challenger, this.yakamo],
                defenders: [this.yoshi, this.toshimoko],
                type: 'political'
            });
            let fate = this.yakamo.fate;
            this.player2.clickCard(this.heresy);
            this.player1.clickCard(this.yoshi);
            this.player2.clickCard(this.yakamo);

            this.player1.clickPrompt('1');
            this.player2.clickPrompt('1');
            expect(this.getChatLogs(10)).toContain('Kakita Yoshi: 7 vs 3: Hida Yakamo');
            expect(this.getChatLogs(10)).toContain('The duel has no effect');
            expect(this.yakamo.fate).toBe(fate);
        });
    });
});
