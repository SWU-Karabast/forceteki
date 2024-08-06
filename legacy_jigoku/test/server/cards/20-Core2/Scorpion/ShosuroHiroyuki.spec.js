describe('Shosuro Hiroyuki', function () {
    integration(function () {
        beforeEach(function () {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['shosuro-hiroyuki']
                },
                player2: {
                    inPlay: ['doji-challenger', 'doji-hotaru', 'doji-whisperer'],
                    hand: ['way-of-the-crane']
                }
            });
            this.shosuroHiroyuki = this.player1.findCardByName('shosuro-hiroyuki');
            this.dojiChallenger = this.player2.findCardByName('doji-challenger');
            this.hotaru = this.player2.findCardByName('doji-hotaru');
            this.whisperer = this.player2.findCardByName('doji-whisperer');

            this.noMoreActions();
            this.initiateConflict({
                type: 'political',
                attackers: [this.shosuroHiroyuki],
                defenders: [this.dojiChallenger, this.hotaru]
            });
            this.player2.pass();
        });

        it('chooses lower POL target in conflict', function () {
            this.player1.clickCard(this.shosuroHiroyuki);
            expect(this.player1).toBeAbleToSelect(this.dojiChallenger);
            expect(this.player1).not.toBeAbleToSelect(this.hotaru);
            expect(this.player1).not.toBeAbleToSelect(this.whisperer);
        });

        it('dishonor the target', function () {
            this.player1.clickCard(this.shosuroHiroyuki);
            this.player1.clickCard(this.dojiChallenger);
            expect(this.dojiChallenger.isDishonored).toBe(true);
            expect(this.getChatLogs(5)).toContain('player1 uses Shosuro Hiroyuki to dishonor Doji Challenger');
        });

        it('if the target is dishonored, forces discard', function () {
            this.dojiChallenger.dishonor();

            this.player1.clickCard(this.shosuroHiroyuki);
            this.player1.clickCard(this.dojiChallenger);
            expect(this.player2.hand.length).toBe(0);
            expect(this.getChatLogs(5)).toContain(
                'player1 uses Shosuro Hiroyuki to make player2 discard 1 card at random'
            );
        });
    });
});
