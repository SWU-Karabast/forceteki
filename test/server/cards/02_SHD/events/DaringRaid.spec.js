describe('Daring Raid', function() {
    integration(function() {
        describe('Daring Raid\'s ability', function() {
            beforeEach(function () {
                this.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['daring-raid'],
                        groundArena: ['pyke-sentinel'],
                        spaceArena: ['cartel-spacer']
                    },
                    player2: {
                        groundArena: ['wampa'],
                        spaceArena: ['imperial-interceptor']
                    }
                });
            });

            it('can deal damage to a unit', function () {
                this.player1.clickCard(this.daringRaid);
                expect(this.player1).toBeAbleToSelectExactly([this.pykeSentinel, this.cartelSpacer, this.p1Base, this.wampa, this.imperialInterceptor, this.p2Base]);

                this.player1.clickCard(this.wampa);
                expect(this.wampa.damage).toBe(2);
            });

            it('can deal damage to a base', function () {
                this.player1.clickCard(this.daringRaid);
                expect(this.player1).toBeAbleToSelectExactly([this.pykeSentinel, this.cartelSpacer, this.p1Base, this.wampa, this.imperialInterceptor, this.p2Base]);

                this.player1.clickCard(this.p1Base);
                expect(this.p1Base.damage).toBe(2);
            });
        });
    });
});
