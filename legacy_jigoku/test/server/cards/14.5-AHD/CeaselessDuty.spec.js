describe('Ceaseless Duty', function() {
    integration(function() {
        beforeEach(function() {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['doji-whisperer', 'brash-samurai', 'doji-challenger', 'kakita-toshimoko', 'kakita-yoshi', 'isawa-tadaka-2'],
                    hand: ['ceaseless-duty', 'assassination', 'fine-katana'],
                    dynastyDiscard: ['doji-diplomat', 'eager-scout']
                },
                player2: {
                    inPlay: ['dazzling-duelist'],
                    hand: ['i-can-swim', 'let-go']
                }
            });

            this.diplomat = this.player1.findCardByName('doji-diplomat');
            this.scout = this.player1.findCardByName('eager-scout');
            this.tadaka = this.player1.findCardByName('isawa-tadaka-2');

            this.f1 = this.player1.findCardByName('doji-whisperer');
            this.f2 = this.player1.findCardByName('brash-samurai');
            this.f3 = this.player1.findCardByName('doji-challenger');
            this.f4 = this.player1.findCardByName('kakita-toshimoko');
            this.f5 = this.player1.findCardByName('kakita-yoshi');
            this.duty = this.player1.findCardByName('ceaseless-duty');
            this.assassination = this.player1.findCardByName('assassination');
            this.katana = this.player1.findCardByName('fine-katana');

            this.f1.dishonor();
            this.f2.dishonor();
            this.f3.dishonor();
            this.f4.dishonor();
            this.f5.dishonor();

            this.dazzling = this.player2.findCardByName('dazzling-duelist');
            this.swim = this.player2.findCardByName('i-can-swim');
            this.letGo = this.player2.findCardByName('let-go');
            this.sd1 = this.player1.findCardByName('shameful-display', 'province 1');
            this.sd2 = this.player1.findCardByName('shameful-display', 'province 2');
            this.sd3 = this.player1.findCardByName('shameful-display', 'province 3');
            this.sd4 = this.player1.findCardByName('shameful-display', 'province 4');
            this.sd5 = this.player1.findCardByName('shameful-display', 'stronghold province');

            this.sd3.isBroken = true;
            this.sd4.isBroken = true;

            this.player1.player.showBid = 1;
            this.player2.player.showBid = 5;

            this.player1.playAttachment(this.katana, this.f2);

            this.noMoreActions();

            this.initiateConflict({
                attackers: [this.f1, this.f2, this.f3, this.f4, this.f5],
                defenders: [this.dazzling],
                type: 'military'
            });
        });

        it('should interrupt when a character with cost equal to your unbroken provinces leaves play', function() {
            this.player2.clickCard(this.swim);
            this.player2.clickCard(this.f3);
            expect(this.player1).toHavePrompt('Triggered Abilities');
            expect(this.player1).toBeAbleToSelect(this.duty);

            this.player1.clickCard(this.duty);
            expect(this.f3.location).toBe('play area');
            expect(this.duty.location).toBe('conflict discard pile');
        });

        it('should interrupt when a character with cost less than your unbroken provinces leaves play', function() {
            this.player2.clickCard(this.swim);
            this.player2.clickCard(this.f1);
            expect(this.player1).toHavePrompt('Triggered Abilities');
            expect(this.player1).toBeAbleToSelect(this.duty);

            this.player1.clickCard(this.duty);
            expect(this.f1.location).toBe('play area');
            expect(this.duty.location).toBe('conflict discard pile');
        });

        it('should not interrupt when a character with cost greater than your unbroken provinces leaves play', function() {
            this.player2.clickCard(this.swim);
            this.player2.clickCard(this.f4);
            expect(this.player1).not.toHavePrompt('Triggered Abilities');
            expect(this.f4.location).toBe('dynasty discard pile');
        });

        it('should interrupt when an opponent\'s character leaves play', function() {
            this.player2.pass();
            this.player1.clickCard(this.assassination);
            this.player1.clickCard(this.dazzling);
            expect(this.player1).toHavePrompt('Triggered Abilities');
            expect(this.player1).toBeAbleToSelect(this.duty);

            this.player1.clickCard(this.duty);
            expect(this.dazzling.location).toBe('play area');
            expect(this.duty.location).toBe('conflict discard pile');
        });

        it('should use your provinces even if it\'s an opponent\'s character', function() {
            this.sd1.isBroken = true;
            this.sd2.isBroken = true;
            this.sd3.isBroken = true;
            this.sd4.isBroken = true;

            this.player2.pass();
            this.player1.clickCard(this.assassination);
            this.player1.clickCard(this.dazzling);
            expect(this.player1).not.toHavePrompt('Triggered Abilities');
            expect(this.dazzling.location).toBe('dynasty discard pile');
        });

        it('should not interrupt when a non-character leaves play', function() {
            this.player2.clickCard(this.letGo);
            this.player2.clickCard(this.katana);
            expect(this.player1).not.toHavePrompt('Triggered Abilities');
            expect(this.katana.location).toBe('conflict discard pile');
        });

        it('chat messages', function() {
            this.player2.clickCard(this.swim);
            this.player2.clickCard(this.f3);
            this.player1.clickCard(this.duty);
            expect(this.getChatLogs(5)).toContain('player1 plays Ceaseless Duty to prevent Doji Challenger from leaving play');
        });

        it('reported bug - Tadaka2 remove from game', function() {
            this.player2.pass();
            this.player1.clickCard(this.tadaka);
            this.player1.clickCard(this.diplomat);
            this.player1.clickCard(this.scout);
            this.player1.clickPrompt('Done');
            expect(this.player1).not.toHavePrompt('Triggered Abilities');
            expect(this.player1).toHavePrompt('Isawa Tadaka');
        });
    });
});
