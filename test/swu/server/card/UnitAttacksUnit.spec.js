describe('Unit attacks unit', function() {
    integration(function() {
        beforeEach(function () {
            this.setupTest({
                phase: 'action',
                player1: {
                    groundArena: ['wampa'],
                    resources: ['atst', 'atst'],
                },
                player2: {
                    groundArena: ['frontier-atrt'],
                    resources: ['atst', 'atst']     // TODO: allow resources to be optionally be as a number instead of naming specific cards (i.e., 2 resources)
                }
            });
            this.wampa = this.player1.findCardByName('wampa');
            this.atrt = this.player2.findCardByName('frontier-atrt');

            this.noMoreActions();
        });

        it('basic case', function () {
            this.player1.clickCard(this.wampa);

            expect(this.wampa.damage).toBe(3);
            expect(this.atrt.damage).toBe(4);
            expect(this.wampa.exhausted).toBe(true);
        });
    });
});
