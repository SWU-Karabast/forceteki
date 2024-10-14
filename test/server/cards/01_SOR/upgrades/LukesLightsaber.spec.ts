describe('Luke\'s Lightsaber', function() {
    integration(function() {
        describe('Luke\'s Lightsaber\'s ability', function() {
            beforeEach(function () {
                this.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['lukes-lightsaber'],
                        groundArena: [{ card: 'luke-skywalker#jedi-knight', damage: 5, upgrades: ['shield'] }, { card: 'battlefield-marine', damage: 2 }, 'reinforcement-walker'],
                        leader: { card: 'luke-skywalker#faithful-friend', deployed: true }
                    }
                });
            });

            it('should heal all damage from and give a shield to its holder when played, only if that unit is Luke Skywalker', function () {
                this.player1.clickCard(this.lukesLightsaber);
                expect(this.player1).toBeAbleToSelectExactly([this.lukeSkywalkerJediKnight, this.lukeSkywalkerFaithfulFriend, this.battlefieldMarine]);

                this.player1.clickCard(this.lukeSkywalkerJediKnight);

                expect(this.lukeSkywalkerJediKnight.damage).toBe(0);
                expect(this.lukeSkywalkerJediKnight).toHaveExactUpgradeNames(['lukes-lightsaber', 'shield', 'shield']);
            });

            it('should give a shield to Luke when played on him even if it doesn\'t heal any damage', function () {
                this.player1.clickCard(this.lukesLightsaber);
                expect(this.player1).toBeAbleToSelectExactly([this.lukeSkywalkerJediKnight, this.lukeSkywalkerFaithfulFriend, this.battlefieldMarine]);

                this.player1.clickCard(this.lukeSkywalkerFaithfulFriend);

                expect(this.lukeSkywalkerFaithfulFriend).toHaveExactUpgradeNames(['lukes-lightsaber', 'shield']);
            });

            it('should have no effect on any unit other than Luke Skywalker', function () {
                this.player1.clickCard(this.lukesLightsaber);
                expect(this.player1).toBeAbleToSelectExactly([this.lukeSkywalkerJediKnight, this.lukeSkywalkerFaithfulFriend, this.battlefieldMarine]);

                this.player1.clickCard(this.battlefieldMarine);

                expect(this.battlefieldMarine.damage).toBe(2);
                expect(this.battlefieldMarine).toHaveExactUpgradeNames(['lukes-lightsaber']);
            });
        });
    });
});
