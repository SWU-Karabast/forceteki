describe('Experience', function() {
    integration(function() {
        describe('Experience\'s ability', function() {
            beforeEach(function () {
                this.setupTest({
                    phase: 'action',
                    player1: {
                        spaceArena: [{ card: 'cartel-spacer', upgrades: ['experience'] }]
                    },
                    player2: {
                        spaceArena: ['valiant-assault-ship']
                    }
                });

                this.cartelSpacer = this.player1.findCardByName('cartel-spacer');
                this.experience = this.player1.findCardByName('experience');
                this.assaultShip = this.player2.findCardByName('valiant-assault-ship');

                this.p2Base = this.player2.base;
            });

            it('should defeat itself to prevent damage to the attached unit', function () {
                this.player1.clickCard(this.cartelSpacer);
                this.player1.clickCard(this.assaultShip);

                expect(this.cartelSpacer.damage).toBe(3);
                expect(this.assaultShip.damage).toBe(3);

                // second attack to confirm that experience effect is still on
                this.player2.passAction();
                this.cartelSpacer.exhausted = false;

                this.player1.clickCard(this.cartelSpacer);
                this.player1.clickCard(this.p2Base);
                expect(this.p2Base.damage).toBe(3);

                // third attack to confirm that token goes to discard
                this.player2.passAction();
                this.cartelSpacer.exhausted = false;

                this.player1.clickCard(this.cartelSpacer);
                this.player1.clickCard(this.assaultShip);
                expect(this.cartelSpacer.location).toBe('discard');
                expect(this.assaultShip.location).toBe('discard');
                expect(this.experience.location).toBe('outside the game');
            });
        });
    });
});
