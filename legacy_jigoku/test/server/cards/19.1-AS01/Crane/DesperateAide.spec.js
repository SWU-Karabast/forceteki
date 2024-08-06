describe('Desperate Aide', function () {
    integration(function () {
        beforeEach(function () {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['doji-diplomat', 'brash-samurai', 'isawa-tadaka']
                },
                player2: {
                    inPlay: ['kakita-yoshi', 'desperate-aide']
                }
            });

            this.brash = this.player1.findCardByName('brash-samurai');
            this.diplomat = this.player1.findCardByName('doji-diplomat');
            this.tadaka = this.player1.findCardByName('isawa-tadaka');

            this.yoshi = this.player2.findCardByName('kakita-yoshi');
            this.aide = this.player2.findCardByName('desperate-aide');

            this.player1.player.showBid = 5;
            this.player2.player.showBid = 5;
        });

        it('should do nothing without composure', function () {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.diplomat, this.brash, this.tadaka],
                defenders: [this.aide]
            });

            expect(this.player2).toHavePrompt('Conflict Action Window');
            this.player2.clickCard(this.aide);
            expect(this.player2).toHavePrompt('Conflict Action Window');
        });

        it('should draw with composure but not gain honor if not winning conflict', function () {
            this.player2.player.showBid = 1;
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.diplomat, this.brash, this.tadaka],
                defenders: [this.aide]
            });

            let hand = this.player2.hand.length;
            let honor = this.player2.honor;
            this.player2.clickCard(this.aide);
            expect(this.player2.hand.length).toBe(hand + 1);
            expect(this.player2.honor).toBe(honor);
            expect(this.getChatLogs(5)).toContain('player2 uses Desperate Aide to draw 1 card');
        });

        it('should gain honor if winning', function () {
            this.player2.player.showBid = 1;
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.diplomat, this.brash, this.tadaka],
                defenders: [this.yoshi, this.aide],
                type: 'political'
            });

            let hand = this.player2.hand.length;
            let honor = this.player2.honor;
            this.player2.clickCard(this.aide);
            expect(this.player2.hand.length).toBe(hand + 1);
            expect(this.player2.honor).toBe(honor + 1);
            expect(this.getChatLogs(5)).toContain('player2 uses Desperate Aide to draw 1 card and gain 1 honor');
        });

        it('gains honor when counting more POL during a MIL conflict ', function () {
            this.player2.player.showBid = 1;
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.diplomat, this.brash, this.tadaka],
                defenders: [this.yoshi, this.aide],
                type: 'military'
            });

            let hand = this.player2.hand.length;
            let honor = this.player2.honor;
            this.player2.clickCard(this.aide);
            expect(this.player2.hand.length).toBe(hand + 1);
            expect(this.player2.honor).toBe(honor + 1);
            expect(this.getChatLogs(5)).toContain('player2 uses Desperate Aide to draw 1 card and gain 1 honor');
        });
    });
});
