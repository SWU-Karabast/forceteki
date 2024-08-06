describe('Sato', function () {
    integration(function () {
        beforeEach(function () {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['wandering-ronin'],
                    hand: ['sato']
                },
                player2: {
                    inPlay: ['adept-of-the-waves'],
                    hand: ['let-go', 'banzai']
                }
            });
            this.wanderingRonin = this.player1.findCardByName('wandering-ronin');
            this.sato = this.player1.findCardByName('sato');

            this.adeptOfTheWaves = this.player2.findCardByName('adept-of-the-waves');
            this.letGo = this.player2.findCardByName('let-go');
            this.banzai = this.player2.findCardByName('banzai');
        });

        it('should attach to a character you do not control', function () {
            this.player1.clickCard(this.sato);
            expect(this.player1).toHavePrompt('Sato');
            expect(this.player1).not.toBeAbleToSelect(this.wanderingRonin);
            expect(this.player1).toBeAbleToSelect(this.adeptOfTheWaves);
            this.player1.clickCard(this.adeptOfTheWaves);
            expect(this.adeptOfTheWaves.attachments).toContain(this.sato);
        });

        it('should trigger when your opponent plays a card when attached character is participating', function () {
            this.player1.clickCard(this.sato);
            this.player1.clickCard(this.adeptOfTheWaves);

            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.wanderingRonin],
                defenders: [this.adeptOfTheWaves]
            });
            this.player2.clickCard(this.banzai);
            this.player2.clickCard(this.adeptOfTheWaves);
            this.player2.clickPrompt('Done');
            expect(this.player1).toHavePrompt('Triggered Abilities');
            expect(this.player1).toBeAbleToSelect(this.sato);
        });

        it('should make you opponent lose 1 honor', function () {
            this.player1.clickCard(this.sato);
            this.player1.clickCard(this.adeptOfTheWaves);

            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.wanderingRonin],
                defenders: [this.adeptOfTheWaves]
            });
            let honor = this.player2.player.honor;
            this.player2.clickCard(this.banzai);
            this.player2.clickCard(this.adeptOfTheWaves);
            this.player2.clickPrompt('Done');
            this.player1.clickCard(this.sato);
            expect(this.player2.player.honor).toBe(honor - 1);
        });

        it('should not trigger before let go places it in the discard pile', function () {
            this.player1.clickCard(this.sato);
            this.player1.clickCard(this.adeptOfTheWaves);

            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.wanderingRonin],
                defenders: [this.adeptOfTheWaves]
            });
            this.player2.clickCard(this.letGo);
            this.player2.clickCard(this.sato);
            expect(this.sato.location).toBe('conflict discard pile');
            expect(this.player1).toHavePrompt('Conflict Action Window');
        });
    });
});