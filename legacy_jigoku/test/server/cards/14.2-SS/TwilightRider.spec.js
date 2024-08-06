describe('Twilight Rider', function() {
    integration(function() {
        beforeEach(function () {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['twilight-rider', 'doji-whisperer', 'doji-kuwanan', 'moto-juro'],
                    hand: ['favored-mount']
                },
                player2: {
                    inPlay: ['kakita-toshimoko']
                }
            });

            this.rider = this.player1.findCardByName('twilight-rider');
            this.whisperer = this.player1.findCardByName('doji-whisperer');
            this.kuwanan = this.player1.findCardByName('doji-kuwanan');
            this.mount = this.player1.findCardByName('favored-mount');
            this.toshimoko = this.player2.findCardByName('kakita-toshimoko');
            this.juro = this.player1.findCardByName('moto-juro');

            this.whisperer.bowed = true;
            this.toshimoko.bowed = true;

            this.player1.playAttachment(this.mount, this.rider);
        });

        it('should not trigger on assignment', function() {
            this.noMoreActions();
            this.initiateConflict({
                type: 'military',
                attackers: [this.rider],
                defenders: []
            });

            expect(this.player2).toHavePrompt('Conflict Action Window');
        });

        it('should prompt you to ready someone once the character moves in', function() {
            this.rider.bowed = true;
            this.noMoreActions();
            this.initiateConflict({
                type: 'military',
                attackers: [this.kuwanan],
                defenders: []
            });

            this.player2.pass();
            this.player1.clickCard(this.mount);
            expect(this.player1).toHavePrompt('Triggered Abilities');
            expect(this.player1).toBeAbleToSelect(this.rider);
            this.player1.clickCard(this.rider);
            expect(this.player1).toHavePrompt('Choose a character');
            expect(this.player1).not.toBeAbleToSelect(this.kuwanan);
            expect(this.player1).toBeAbleToSelect(this.whisperer);
            expect(this.player1).toBeAbleToSelect(this.rider);
            expect(this.player1).toBeAbleToSelect(this.toshimoko);
            this.player1.clickCard(this.toshimoko);
            expect(this.getChatLogs(3)).toContain('player1 uses Twilight Rider to ready Kakita Toshimoko');
            expect(this.toshimoko.bowed).toBe(false);
        });

        it('should not prompt you to ready someone if another character moves in', function() {
            this.rider.bowed = true;
            this.noMoreActions();
            this.initiateConflict({
                type: 'military',
                attackers: [this.kuwanan],
                defenders: []
            });

            this.player2.pass();
            this.player1.clickCard(this.juro);
            expect(this.player1).not.toHavePrompt('Triggered Abilities');
            expect(this.player2).toHavePrompt('Conflict Action Window');
        });
    });
});
