describe("Fukurokushi's Blessing", function () {
    integration(function () {
        beforeEach(function () {
            this.setupTest({
                phase: 'draw',
                player1: {
                    inPlay: ['doji-kuwanan'],
                    hand: ['fukurokushi-s-blessing']
                },
                player2: {
                    hand: ['feeding-an-army'],
                    provinces: ['midnight-revels', 'cycle-of-vengeance'],
                    inPlay: ['solemn-scholar']
                }
            });

            this.kuwanan = this.player1.findCardByName('doji-kuwanan');
            this.blessing = this.player1.findCardByName('fukurokushi-s-blessing');

            this.feeding = this.player2.findCardByName('feeding-an-army');
            this.revels = this.player2.findCardByName('midnight-revels', 'province 1');
            this.cycleOfVengeance = this.player2.findCardByName('cycle-of-vengeance', 'province 2');
            this.revels.facedown = false;
            this.cycleOfVengeance.facedown = false;

            this.player1.clickPrompt('1');
            this.player2.clickPrompt('1');
        });

        it('does not work outside conflicts', function () {
            this.noMoreActions();

            this.player2.clickCard(this.feeding);
            this.player2.clickCard(this.cycleOfVengeance);
            this.player2.clickCard(this.cycleOfVengeance);

            expect(this.player1).not.toHavePrompt('Triggered Abilities');
            expect(this.player1).not.toBeAbleToSelect(this.blessing);

            this.player2.clickCard(this.kuwanan);
            expect(this.getChatLogs(10)).toContain(
                'player2 uses Cycle of Vengeance to honor and place a fate on Doji Kuwanan'
            );
            expect(this.cycleOfVengeance.isBroken).toBe(true);
        });

        it('cancels provinces on attack', function () {
            this.noMoreActions();
            this.player2.clickPrompt('Pass');
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.kuwanan],
                type: 'military',
                province: this.revels
            });

            this.player2.clickCard(this.revels);
            this.player2.clickCard(this.kuwanan);
            expect(this.getChatLogs(10)).toContain('player2 uses Midnight Revels to bow Doji Kuwanan');
            expect(this.player1).toHavePrompt('Triggered Abilities');
            expect(this.player1).toBeAbleToSelect(this.blessing);

            this.player1.clickCard(this.blessing);
            expect(this.getChatLogs(10)).toContain(
                "player1 plays Fukurokushi's Blessing to cancel the effects of Midnight Revels's ability"
            );
            expect(this.kuwanan.bowed).toBe(false);
        });
    });
});