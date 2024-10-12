describe('Shoot First', function () {
    integration(function () {
        describe('Shoot First Ability', function () {
            beforeEach(function () {
                this.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['shoot-first'],
                        groundArena: ['consular-security-force', 'first-legion-snowtrooper'],
                    },
                    player2: {
                        groundArena: [{ card: 'r2d2#ignoring-protocol', damage: 1 }, { card: 'scout-bike-pursuer', upgrades: ['experience'] }],
                        base: { card: 'dagobah-swamp', damage: 0 }
                    }
                });
            });

            it('should initiate attack with +1/+0 and while attacking deal damage before the defender and overwhelm damage to base.', function () {
                this.player1.clickCard(this.shootFirst);
                expect(this.player1).toBeAbleToSelectExactly([this.consularSecurityForce, this.firstLegionSnowtrooper]);
                this.player1.clickCard(this.firstLegionSnowtrooper);
                this.player1.clickCard(this.r2d2);

                // check game state
                expect(this.r2d2.location).toBe('discard');
                expect(this.firstLegionSnowtrooper.damage).toBe(0);
                expect(this.shootFirst.location).toBe('discard');
                expect(this.p2Base.damage).toBe(2);
            });

            it('should initiate attack with +1/+0 and while attacking deal damage before the defender and giving the grit unit its effect before attacker receives damage.', function () {

                this.player1.clickCard(this.shootFirst);
                expect(this.player1).toBeAbleToSelectExactly([this.consularSecurityForce, this.firstLegionSnowtrooper]);
                this.player1.clickCard(this.consularSecurityForce);
                this.player1.clickCard(this.scoutBikePursuer);

                // check game state
                expect(this.consularSecurityForce.damage).toBe(6);
                expect(this.scoutBikePursuer.damage).toBe(4);
                expect(this.shootFirst.location).toBe('discard');
            });
        });
    });
});
