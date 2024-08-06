describe('Disaraging Challenge', function() {
    integration(function() {
        beforeEach(function() {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    honor: 10,
                    inPlay: ['border-rider', 'hida-yakamo', 'togashi-mitsu-2']
                },
                player2: {
                    honor: 14,
                    inPlay: ['kakita-toshimoko', 'kakita-yoshi'],
                    hand: ['disparaging-challenge']
                }
            });

            this.mitsu = this.player1.findCardByName('togashi-mitsu-2');
            this.borderRider = this.player1.findCardByName('border-rider');
            this.yakamo = this.player1.findCardByName('hida-yakamo');

            this.yoshi = this.player2.findCardByName('kakita-yoshi');
            this.toshimoko = this.player2.findCardByName('kakita-toshimoko');
            this.challenge = this.player2.findCardByName('disparaging-challenge');
        });

        it('should target an opponent\'s character at home', function() {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.borderRider],
                defenders: [this.toshimoko],
                type: 'political'
            });

            this.player2.clickCard(this.challenge);
            expect(this.player2).toBeAbleToSelect(this.toshimoko);
            expect(this.player2).not.toBeAbleToSelect(this.yoshi);
            this.player2.clickCard(this.toshimoko);
            expect(this.player2).toBeAbleToSelect(this.yakamo);
            expect(this.player2).toBeAbleToSelect(this.mitsu);
            expect(this.player2).not.toBeAbleToSelect(this.borderRider);
        });

        it('should move the loser to the conflict if the loser is at home', function() {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.yakamo],
                defenders: [this.toshimoko],
                type: 'political'
            });

            expect(this.borderRider.inConflict).toBe(false);

            this.player2.clickCard(this.challenge);
            this.player2.clickCard(this.toshimoko);
            this.player2.clickCard(this.borderRider);

            this.player1.clickPrompt('1');
            this.player2.clickPrompt('1');

            expect(this.borderRider.inConflict).toBe(true);
            expect(this.getChatLogs(5)).toContain('Duel Effect: move Border Rider into the conflict');
        });

        it('should move the loser home if the loser is in the conflict', function() {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.yakamo],
                defenders: [this.toshimoko],
                type: 'political'
            });

            expect(this.toshimoko.inConflict).toBe(true);

            this.player2.clickCard(this.challenge);
            this.player2.clickCard(this.toshimoko);
            this.player2.clickCard(this.mitsu);

            this.player1.clickPrompt('1');
            this.player2.clickPrompt('1');

            expect(this.toshimoko.inConflict).toBe(false);
            expect(this.getChatLogs(5)).toContain('Duel Effect: send Kakita Toshimoko home');
        });

        it('should do nothing if there is no loser', function() {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.mitsu],
                defenders: [this.toshimoko],
                type: 'political'
            });

            expect(this.yakamo.inConflict).toBe(false);

            this.player2.clickCard(this.challenge);
            this.player2.clickCard(this.toshimoko);
            this.player2.clickCard(this.yakamo);

            this.player1.clickPrompt('1');
            this.player2.clickPrompt('1');

            expect(this.yakamo.inConflict).toBe(false);
            expect(this.getChatLogs(5)).toContain('The duel has no effect');
        });
    });
});
