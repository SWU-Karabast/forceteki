describe('Bayushi Truthseeker', function () {
    integration(function () {
        beforeEach(function () {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['bayushi-truthseeker'],
                    hand: []
                },
                player2: {
                    inPlay: ['shinjo-outrider'],
                    hand: ['ornate-fan', 'shrine-maiden']
                }
            });
            this.fan = this.player2.findCardByName('ornate-fan');
            this.shrineMaiden = this.player2.findCardByName('shrine-maiden');
            this.player2.moveCard(this.fan, 'conflict deck');
            this.player2.moveCard(this.shrineMaiden, 'conflict deck');
            this.bayushiTruthseeker = this.player1.findCardByName('bayushi-truthseeker');
            this.noMoreActions();
            this.initiateConflict({
                type: 'military',
                attackers: ['bayushi-truthseeker'],
                defenders: []
            });
        });

        it('should let you discard one of the top two cards of your opponents deck', function () {
            this.noMoreActions();
            this.player1.clickCard(this.bayushiTruthseeker);
            expect(this.player1).toHavePrompt('Which card do you want to discard?');
            this.player1.clickPrompt('Ornate Fan');
            expect(this.fan.location).toBe('conflict discard pile');
            expect(this.shrineMaiden.location).toBe('conflict deck');
        });

        it('should let you keep both cards on top of your opponents deck', function () {
            this.noMoreActions();
            this.player1.clickCard(this.bayushiTruthseeker);
            expect(this.player1).toHavePrompt('Which card do you want to discard?');
            this.player1.clickPrompt('Do not discard either card.');
            expect(this.fan.location).toBe('conflict deck');
            expect(this.shrineMaiden.location).toBe('conflict deck');
        });
    });
});
