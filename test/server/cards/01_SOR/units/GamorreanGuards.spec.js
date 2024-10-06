describe('Gamorrean Guards', function() {
    integration(function() {
        describe('Gamorrean Guards\'s ability', function() {
            beforeEach(function () {
                this.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['strafing-gunship'],
                        groundArena: ['gamorrean-guards'],
                    },
                    player2: {
                        groundArena: ['wampa', 'battlefield-marine'],
                    }
                });
            });

            it('should give it sentinel while he has a Cunning ally', function () {
                this.player1.pass();
                this.player2.clickCard(this.wampa);
                this.player2.clickCard(this.p1Base);
                expect(this.p1Base.damage).toBe(4);

                this.player1.clickCard(this.strafingGunship);
                expect(this.strafingGunship.location).toBe('space arena');
                expect(this.player2).toBeActivePlayer();

                this.player2.clickCard(this.battlefieldMarine);
                // Gamorrean Guards automatically selected due to sentinel
                expect(this.battlefieldMarine.location).toBe('discard');
                expect(this.player1).toBeActivePlayer();
                expect(this.gamorreanGuards.damage).toBe(3);
            });
        });
    });
});
