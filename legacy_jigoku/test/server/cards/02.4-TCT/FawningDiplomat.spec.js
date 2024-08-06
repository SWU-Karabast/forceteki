describe('Fawning Diplomat', function() {
    integration(function() {
        describe('Fawning Diplomat\'s ability', function() {
            beforeEach(function () {
                this.setupTest({
                    phase: 'conflict',
                    player1: {
                        inPlay: ['fawning-diplomat', 'sinister-soshi'],
                        dynastyDiscard: ['shosuro-ibuki'],
                        hand: ['cloud-the-mind']
                    }
                });
                this.fawningDiplomat = this.player1.findCardByName('fawning-diplomat');
                this.cloud = this.player1.findCardByName('cloud-the-mind');
                this.soshuroIbuki = this.player1.placeCardInProvince('shosuro-ibuki', 'province 1');
            });

            it('should allow to claim the favor after she leaves play during the fate phase', function () {
                expect(this.player1.player.imperialFavor).toBe('');

                this.flow.finishConflictPhase();
                this.player1.clickPrompt('Done');

                expect(this.player1).toHavePrompt('Triggered Abilities');
                expect(this.player1).toBeAbleToSelect(this.fawningDiplomat);

                this.player1.clickCard(this.fawningDiplomat);
                this.player1.clickPrompt('military');
                expect(this.player1.player.imperialFavor).toBe('military');
                expect(this.getChatLogs(10)).toContain('player1 claims the Emperor\'s military favor!');
            });

            it('should allow to claim the favor if Diplomat with Cloud the Mind gets disguised', function () {
                expect(this.player1.player.imperialFavor).toBe('');

                this.player1.clickCard(this.cloud);
                this.player1.clickCard(this.fawningDiplomat);

                expect(this.cloud.parent).toBe(this.fawningDiplomat);

                this.player2.pass();

                this.player1.clickCard(this.soshuroIbuki);
                this.player1.clickCard(this.fawningDiplomat);

                expect(this.player1).toHavePrompt('Triggered Abilities');
                expect(this.player1).toBeAbleToSelect(this.fawningDiplomat);

                this.player1.clickCard(this.fawningDiplomat);
                this.player1.clickPrompt('military');
                expect(this.player1.player.imperialFavor).toBe('military');
                expect(this.getChatLogs(10)).toContain('player1 claims the Emperor\'s military favor!');
            });
        });
    });
});

