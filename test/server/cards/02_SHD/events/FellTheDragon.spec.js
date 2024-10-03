describe('Fell the Dragon', function() {
    integration(function() {
        describe('Fell the Dragon\'s ability', function() {
            beforeEach(function () {
                this.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['fell-the-dragon'],
                        groundArena: ['pyke-sentinel', { card: 'scout-bike-pursuer', upgrades: ['academy-training'], damage: 4 }, 'avenger#hunting-star-destroyer'],
                    },
                    player2: {
                        groundArena: ['atst', 'isb-agent'],
                        spaceArena: ['cartel-spacer'],
                        leader: { card: 'darth-vader#dark-lord-of-the-sith', deployed: true }
                    }
                });
            });

            it('should defeat a ennemy', function () {
                this.player1.clickCard(this.fellTheDragon);
                expect(this.player1).toBeAbleToSelectExactly([this.avenger, this.atst, this.scoutBikePursuer]);

                this.player1.clickCard(this.atst);
                expect(this.atst).toBeInLocation('discard');
            });

            it('should defeat an ally', function () {
                this.player1.clickCard(this.fellTheDragon);
                expect(this.player1).toBeAbleToSelectExactly([this.avenger, this.atst, this.scoutBikePursuer]);

                this.player1.clickCard(this.avenger);
                expect(this.avenger).toBeInLocation('discard');
            });
        });
    });
});
