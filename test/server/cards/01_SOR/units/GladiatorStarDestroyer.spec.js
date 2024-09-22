describe('Gladiator Star Destroyer', function() {
    integration(function() {
        describe('Gladiator Star Destroyer\'s when played ability', function() {
            beforeEach(function () {
                this.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['gladiator-star-destroyer'],
                        leader: { card: 'director-krennic#aspiring-to-authority', deployed: true }
                    },
                    player2: {
                        groundArena: ['wampa'],
                        spaceArena: ['cartel-spacer']
                    }
                });
            });

            it('should give any one target unit sentinel for the rest of the phase', function () {
                this.player1.clickCard(this.gladiatorStarDestroyer);
                expect(this.player1).toBeAbleToSelectExactly([this.gladiatorStarDestroyer, this.directorKrennic, this.wampa, this.cartelSpacer]);

                this.player1.clickCard(this.directorKrennic);

                this.player2.clickCard(this.wampa);
                //Krennic automatically attacked due to sentinel
                expect(this.directorKrennic.damage).toBe(4);
                expect(this.wampa.damage).toBe(2);

                this.moveToNextActionPhase();

                //should no longer have sentinel
                this.player1.pass();
                this.player2.clickCard(this.wampa);
                expect(this.player2).toBeAbleToSelectExactly([this.directorKrennic, this.p1Base]);
            });
        });
    });
});
