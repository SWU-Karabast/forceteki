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

                this.daringRaid = this.player1.findCardByName('daring-raid');
                this.pykeSentinel = this.player1.findCardByName('pyke-sentinel');
                this.cartelSpacer = this.player1.findCardByName('cartel-spacer');

                this.wampa = this.player2.findCardByName('wampa');
                this.interceptor = this.player2.findCardByName('imperial-interceptor');

                this.p1Base = this.player1.base;
                this.p2Base = this.player2.base;
            });

            it('can deal damage to a unit', function () {
                this.player1.clickCard(this.daringRaid);
                expect(this.player1).toBeAbleToSelectExactly([this.pykeSentinel, this.cartelSpacer, this.p1Base, this.wampa, this.interceptor, this.p2Base]);

                this.player1.clickCard(this.wampa);
                expect(this.wampa.damage).toBe(2);
            });

            it('can deal damage to a base', function () {
                this.player1.clickCard(this.daringRaid);
                expect(this.player1).toBeAbleToSelectExactly([this.pykeSentinel, this.cartelSpacer, this.p1Base, this.wampa, this.interceptor, this.p2Base]);

                this.player1.clickCard(this.p1Base);
                expect(this.p1Base.damage).toBe(2);
            });
        });
    });
});
