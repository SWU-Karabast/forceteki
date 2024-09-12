describe('Grit keyword', function() {
    integration(function() {
        describe('When a unit with the Grit keyword', function() {
            beforeEach(function () {
                this.setupTest({
                    phase: 'action',
                    player1: {
                        groundArena: [{ card: 'scout-bike-pursuer', damage: 2 }],
                    },
                    player2: {
                        groundArena: ['regional-governor'],
                    }
                });
            });

            it('is damaged, power should be increased by damage amount', function () {
                expect(this.scoutBikePursuer.power).toBe(3);

                this.player2.setActivePlayer();
                this.player2.clickCard(this.regionalGovernor);
                this.player2.clickCard(this.scoutBikePursuer);

                expect(this.regionalGovernor.damage).toBe(3);
            });

            it('has no damage, it should not have increased power', function () {
                this.scoutBikePursuer.damage = 0;
                expect(this.scoutBikePursuer.power).toBe(1);
            });
        });

        describe('When a unit with the Grit keyword', function() {
            beforeEach(function () {
                this.setupTest({
                    phase: 'action',
                    player1: {
                        groundArena: ['sabine-wren#explosives-artist'],
                    },
                    player2: {
                        groundArena: ['wookiee-warrior'],
                    }
                });
            });

            it('gains damage when the attack is declared', function () {
                this.player1.clickCard(this.sabineWren);
                this.player1.clickCard(this.wookieeWarrior);
                expect(this.player1).toBeAbleToSelectExactly([this.wookieeWarrior, this.p1Base, this.p2Base]);
                this.player1.clickCard(this.wookieeWarrior);
                expect(this.sabineWren).toBeInLocation('discard');
                expect(this.wookieeWarrior.damage).toBe(3);
                expect(this.wookieeWarrior.power).toBe(5);
            });
        });
    });
});
