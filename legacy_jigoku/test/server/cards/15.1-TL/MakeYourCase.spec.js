describe('Make Your Case', function() {
    integration(function() {
        beforeEach(function() {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    honor:10,
                    inPlay: ['border-rider', 'hida-yakamo'],
                    hand: ['fan-of-command', 'ornate-fan']
                },
                player2: {
                    honor:14,
                    inPlay: ['kakita-yoshi'],
                    hand: ['make-your-case', 'fan-of-command', 'mirumoto-s-fury']
                }
            });

            this.borderRider = this.player1.findCardByName('border-rider');
            this.yakamo = this.player1.findCardByName('hida-yakamo');
            this.fanp1 = this.player1.findCardByName('fan-of-command');

            this.yoshi = this.player2.findCardByName('kakita-yoshi');
            this.fanp2 = this.player2.findCardByName('fan-of-command');
            this.fury = this.player2.findCardByName('mirumoto-s-fury');
            this.case = this.player2.findCardByName('make-your-case');

            this.player1.playAttachment(this.fanp1, this.borderRider);
            this.player2.playAttachment(this.fanp2, this.yoshi);
            this.player1.playAttachment('ornate-fan', this.borderRider);
        });

        it('chat message', function() {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.borderRider],
                defenders: [this.yoshi],
                type: 'political'
            });

            this.player2.clickCard(this.case);
            this.player2.clickCard(this.yoshi);
            this.player1.clickCard(this.borderRider);
            this.player2.clickPrompt('1');
            this.player1.clickPrompt('1');

            expect(this.getChatLogs(4)).toContain('Kakita Yoshi: 8 vs 5: Border Rider');
            expect(this.getChatLogs(3)).toContain('Duel Effect: Kakita Yoshi gains a fate');
        });

        it('nothing should happen on a tie', function() {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.borderRider],
                defenders: [this.yoshi],
                type: 'political'
            });

            this.player2.clickCard(this.fury);
            this.player2.clickCard(this.borderRider);
            expect(this.borderRider.bowed).toBe(true);
            this.player1.pass();

            this.player2.clickCard(this.case);
            this.player2.clickCard(this.yoshi);
            this.player1.clickCard(this.borderRider);
            this.player2.clickPrompt('1');
            this.player1.clickPrompt('4');

            expect(this.getChatLogs(4)).toContain('The duel ends in a draw');
            expect(this.getChatLogs(3)).toContain('The duel has no effect');
        });

        it('should place a fate on the winner of the duel', function() {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.borderRider],
                defenders: [this.yoshi],
                type: 'political'
            });
            let yoshiFate = this.yoshi.fate;
            this.player2.clickCard(this.case);
            this.player2.clickCard(this.yoshi);
            this.player1.clickCard(this.borderRider);
            this.player2.clickPrompt('1');
            this.player1.clickPrompt('1');
            expect(this.yoshi.fate).toBe(yoshiFate + 1);
        });
    });
});
