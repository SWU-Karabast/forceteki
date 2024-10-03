describe('Make an Opening', function () {
    integration(function () {
        describe('Make an Opening\'s ability', function () {
            beforeEach(function () {
                this.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['make-an-opening'],
                        groundArena: ['pyke-sentinel'],
                    },
                    player2: {
                        groundArena: ['isb-agent'],
                        spaceArena: ['cartel-spacer'],
                        leader: { card: 'sabine-wren#galvanized-revolutionary', deployed: true }
                    }
                });
            });

            it('should reduce hp to a unit and heal your base', function () {
                this.p1Base.damage = 5;
                this.player1.clickCard(this.makeAnOpening);
                expect(this.player1).toBeAbleToSelectExactly([this.pykeSentinel, this.isbAgent, this.cartelSpacer, this.sabineWren]);

                this.player1.clickCard(this.isbAgent);
                expect(this.isbAgent.getPower()).toBe(0);
                expect(this.isbAgent.remainingHp).toBe(1);

                expect(this.p1Base.damage).toBe(3);
            });
        });
    });
});
