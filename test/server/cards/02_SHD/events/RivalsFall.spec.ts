describe('Rival\'s Fall', function() {
    integration(function() {
        describe('Rival\'s Fall\'s ability', function() {
            beforeEach(function () {
                this.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['rivals-fall'],
                        groundArena: ['pyke-sentinel'],
                    },
                    player2: {
                        groundArena: ['atst', 'isb-agent'],
                        spaceArena: ['cartel-spacer'],
                        leader: { card: 'boba-fett#daimyo', deployed: true }
                    }
                });
            });

            it('should defeat a enemy', function () {
                this.player1.clickCard(this.rivalsFall);
                expect(this.player1).toBeAbleToSelectExactly([this.pykeSentinel, this.atst, this.isbAgent, this.cartelSpacer, this.bobaFett]);

                this.player1.clickCard(this.atst);
                expect(this.atst).toBeInLocation('discard');
            });

            it('should defeat an ally', function () {
                this.player1.clickCard(this.rivalsFall);
                expect(this.player1).toBeAbleToSelectExactly([this.pykeSentinel, this.atst, this.isbAgent, this.cartelSpacer, this.bobaFett]);

                this.player1.clickCard(this.pykeSentinel);
                expect(this.pykeSentinel).toBeInLocation('discard');
            });

            it('should defeat a leader', function () {
                this.player1.clickCard(this.rivalsFall);
                expect(this.player1).toBeAbleToSelectExactly([this.pykeSentinel, this.atst, this.isbAgent, this.cartelSpacer, this.bobaFett]);

                this.player1.clickCard(this.bobaFett);
                expect(this.bobaFett.deployed).toBeFalse();
            });
        });
    });
});
