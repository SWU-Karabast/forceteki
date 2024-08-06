describe('Exposed Secrets', function () {
    integration(function () {
        beforeEach(function () {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['doji-kuwanan', 'kakita-yoshi']
                },
                player2: {
                    inPlay: ['callow-delegate', 'lion-s-pride-brawler', 'border-rider'],
                    hand: ['exposed-secrets']
                }
            });

            this.player1.player.showBid = 5;
            this.player2.player.showBid = 1;

            this.kuwanan = this.player1.findCardByName('doji-kuwanan');
            this.yoshi = this.player1.findCardByName('kakita-yoshi');

            this.delegate = this.player2.findCardByName('callow-delegate');
            this.rider = this.player2.findCardByName('border-rider');
            this.brawler = this.player2.findCardByName('lion-s-pride-brawler');
            this.secrets = this.player2.findCardByName('exposed-secrets');
        });

        it('should allow you to bow participating characters with political skill less than or equal to their bid', function() {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.kuwanan, this.yoshi],
                defenders: [this.brawler, this.rider],
                type: 'political'
            });

            this.player2.clickCard(this.secrets);
            expect(this.player2).toBeAbleToSelect(this.kuwanan);
            expect(this.player2).not.toBeAbleToSelect(this.yoshi);
            expect(this.player2).not.toBeAbleToSelect(this.brawler);
            expect(this.player2).toBeAbleToSelect(this.rider);
            expect(this.player2).not.toBeAbleToSelect(this.delegate);
            this.player2.clickCard(this.kuwanan);
            expect(this.kuwanan.bowed).toBe(true);
            expect(this.getChatLogs(5)).toContain('player2 plays Exposed Secrets to bow Doji Kuwanan');
        });

        it('should not work in mil conflicts', function() {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.kuwanan, this.yoshi],
                defenders: [this.brawler, this.rider],
                type: 'military'
            });

            expect(this.player2).toHavePrompt('Conflict Action Window');
            this.player2.clickCard(this.secrets);
            expect(this.player2).toHavePrompt('Conflict Action Window');
        });

        it('should not work out of conflicts', function() {
            this.player1.pass();
            expect(this.player2).toHavePrompt('Action Window');
            this.player2.clickCard(this.secrets);
            expect(this.player2).toHavePrompt('Action Window');
        });
    });
});
