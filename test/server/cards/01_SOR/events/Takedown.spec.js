describe('Takedown', function() {
    integration(function() {
        describe('Takedown\'s ability', function() {
            beforeEach(function () {
                this.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['takedown', 'supreme-leader-snoke#shadow-ruler'],
                        groundArena: ['pyke-sentinel', { card: 'gideon-hask#ruthless-loyalist', upgrades: ['entrenched'] }],
                        leader: { card: 'boba-fett#daimyo', deployed: true, damage: 4 }
                    },
                    player2: {
                        groundArena: ['atst', 'isb-agent'],
                        spaceArena: ['cartel-spacer'],
                        leader: { card: 'sabine-wren#galvanized-revolutionary', deployed: true }
                    }
                });
            });

            it('should defeat an ennemy', function () {
                this.player1.clickCard(this.takedown);
                expect(this.player1).toBeAbleToSelectExactly([this.pykeSentinel, this.isbAgent, this.cartelSpacer, this.bobaFett, this.sabineWren]);

                this.player1.clickCard(this.isbAgent);
                expect(this.isbAgent).toBeInLocation('discard');
            });

            it('should defeat an ally', function () {
                this.player1.clickCard(this.takedown);
                expect(this.player1).toBeAbleToSelectExactly([this.pykeSentinel, this.isbAgent, this.cartelSpacer, this.bobaFett, this.sabineWren]);

                this.player1.clickCard(this.pykeSentinel);
                expect(this.pykeSentinel).toBeInLocation('discard');
            });

            it('should defeat an leader', function () {
                this.player1.clickCard(this.takedown);
                expect(this.player1).toBeAbleToSelectExactly([this.pykeSentinel, this.isbAgent, this.cartelSpacer, this.bobaFett, this.sabineWren]);

                this.player1.clickCard(this.sabineWren);
                expect(this.sabineWren.deployed).toBeFalse();
            });

            it('should defeat an downgrade unit', function () {
                //snoke should add at-st on targets
                this.player1.clickCard(this.supremeLeaderSnoke);
                this.player2.passAction();
                this.player1.clickCard(this.takedown);
                expect(this.player1).toBeAbleToSelectExactly([this.pykeSentinel, this.atst, this.isbAgent, this.cartelSpacer, this.bobaFett, this.sabineWren]);

                this.player1.clickCard(this.atst);
                expect(this.atst).toBeInLocation('discard');
            });
        });
    });
});
