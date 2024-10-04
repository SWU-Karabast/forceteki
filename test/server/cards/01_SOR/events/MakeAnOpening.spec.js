describe('Make an Opening', function () {
    integration(function () {
        describe('Make an Opening\'s ability', function () {
            beforeEach(function () {
                this.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['make-an-opening'],
                        groundArena: ['pyke-sentinel', 'atst'],
                    },
                    player2: {
                        groundArena: ['isb-agent'],
                        spaceArena: ['cartel-spacer'],
                        leader: { card: 'sabine-wren#galvanized-revolutionary', deployed: true }
                    }
                });
            });

            it('should fully-reduce hp to a unit and heal your base', function () {
                this.p1Base.damage = 5;
                this.player1.clickCard(this.makeAnOpening);
                expect(this.player1).toBeAbleToSelectExactly([this.pykeSentinel, this.atst, this.isbAgent, this.cartelSpacer, this.sabineWren]);

                this.player1.clickCard(this.isbAgent);
                expect(this.isbAgent.getPower()).toBe(0);
                expect(this.isbAgent.remainingHp).toBe(1);

                expect(this.p1Base.damage).toBe(3);
            });

            it('should reduce hp to a unit and heal your base', function () {
                this.p1Base.damage = 5;
                this.player1.clickCard(this.makeAnOpening);
                expect(this.player1).toBeAbleToSelectExactly([this.pykeSentinel, this.atst, this.isbAgent, this.cartelSpacer, this.sabineWren]);

                this.player1.clickCard(this.atst);
                expect(this.atst.getPower()).toBe(4);
                expect(this.atst.remainingHp).toBe(5);

                expect(this.p1Base.damage).toBe(3);
            });
        });
    });
});
