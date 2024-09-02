describe('Repair', function() {
    integration(function() {
        describe('Repair\'s ability', function() {
            beforeEach(function () {
                this.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['repair'],
                        groundArena: ['pyke-sentinel'],
                        spaceArena: ['cartel-spacer']
                    },
                    player2: {
                        groundArena: ['wampa'],
                        spaceArena: ['imperial-interceptor']
                    }
                });
            });

            it('can heal a unit', function () {
                this.wampa.damage = 3;
                this.player1.clickCard(this.repair);
                expect(this.player1).toBeAbleToSelectExactly([this.pykeSentinel, this.cartelSpacer, this.p1Base, this.wampa, this.imperialInterceptor, this.p2Base]);

                this.player1.clickCard(this.wampa);
                expect(this.wampa.damage).toBe(0);
            });

            it('can heal a base', function () {
                this.p1Base.damage = 3;

                this.player1.clickCard(this.repair);
                expect(this.player1).toBeAbleToSelectExactly([this.pykeSentinel, this.cartelSpacer, this.p1Base, this.wampa, this.imperialInterceptor, this.p2Base]);

                this.player1.clickCard(this.p1Base);
                expect(this.p1Base.damage).toBe(0);
            });

            it('can select a target with no damage', function () {
                this.player1.clickCard(this.repair);
                expect(this.player1).toBeAbleToSelectExactly([this.pykeSentinel, this.cartelSpacer, this.p1Base, this.wampa, this.imperialInterceptor, this.p2Base]);

                this.player1.clickCard(this.p1Base);
                expect(this.p1Base.damage).toBe(0);
            });

            it('will heal a target with 1 or 2 damage to full', function () {
                this.p1Base.damage = 2;

                this.player1.clickCard(this.repair);
                expect(this.player1).toBeAbleToSelectExactly([this.pykeSentinel, this.cartelSpacer, this.p1Base, this.wampa, this.imperialInterceptor, this.p2Base]);

                this.player1.clickCard(this.p1Base);
                expect(this.p1Base.damage).toBe(0);
            });
        });
    });
});
