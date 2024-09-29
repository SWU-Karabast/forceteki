describe('Supreme Leader Snoke, Shadow Ruler', function() {
    integration(function() {
        describe('Snoke\'s ability', function() {
            beforeEach(function () {
                this.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['supreme-leader-snoke#shadow-ruler'],
                        groundArena: ['battlefield-marine'],
                    },
                    player2: {
                        hand: ['death-star-stormtrooper'],
                        groundArena: ['wampa', 'specforce-soldier'],
                        spaceArena: ['cartel-spacer'],
                        leader: { card: 'jyn-erso#resisting-oppression', deployed: true }
                    }
                });
            });

            it('should give -2/-2 to all enemy non-leader units', function () {
                this.player1.clickCard(this.supremeLeaderSnoke);

                expect(this.battlefieldMarine.getPower()).toBe(3);
                expect(this.battlefieldMarine.getHp()).toBe(3);

                expect(this.wampa.getPower()).toBe(2);
                expect(this.wampa.getHp()).toBe(3);

                expect(this.cartelSpacer.getPower()).toBe(0);
                expect(this.cartelSpacer.getHp()).toBe(1);

                expect(this.specforceSoldier).toBeInLocation('discard');

                expect(this.jynErso.getPower()).toBe(4);
                expect(this.jynErso.getHp()).toBe(7);

                this.player2.clickCard(this.deathStarStormtrooper);
                expect(this.deathStarStormtrooper).toBeInLocation('discard');
            });
        });
    });
});
