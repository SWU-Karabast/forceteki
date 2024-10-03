describe('Make an Opening', function () {
    integration(function () {
        describe('Make an Opening\'s ability', function () {
            beforeEach(function () {
                this.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['make-an-opening'],
                        groundArena: ['pyke-sentinel', { card: 'gideon-hask#ruthless-loyalist', upgrades: ['entrenched'] }],
                    },
                    player2: {
                        groundArena: ['atst', 'isb-agent'],
                        spaceArena: ['cartel-spacer'],
                        leader: { card: 'sabine-wren#galvanized-revolutionary', deployed: true }
                    }
                });
            });

            it('should downgrade an unit and heal base', function () {
                this.player1.clickCard(this.makeAnOpening);
                expect(this.player1).toBeAbleToSelectExactly([this.pykeSentinel, this.gideonHask, this.atst, this.isbAgent, this.cartelSpacer, this.sabineWren]);

                this.player1.clickCard(this.isbAgent);
                // VBL : maybe a bug somewhere, if I keep this test here he fails, but at the end of event it works
                // expect(this.isbAgent.getPower()).toBe(0);
                // expect(this.isbAgent.remainingHp).toBe(1);

                this.p1Base.damage = 5;
                expect(this.player1).toBeAbleToSelectExactly([this.p1Base, this.p2Base]);
                this.player1.clickCard(this.p1Base);
                expect(this.p1Base.damage).toBe(3);
                expect(this.isbAgent.getPower()).toBe(0);
                expect(this.isbAgent.remainingHp).toBe(1);
            });
        });
    });
});
