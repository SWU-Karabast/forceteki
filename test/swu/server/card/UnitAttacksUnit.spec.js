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
                    groundArena: ['wampa'],
                    resources: ['atst', 'atst']
                }
            });
            this.p1Wampa = this.player1.findCardByName('wampa');
            this.p2Wampa = this.player2.findCardByName('wampa');

            this.noMoreActions();
        });

        it('basic case', function () {
            this.player1.clickCard(this.p1Wampa);

            expect(this.p1Wampa.damage).toBe(4);
        });
    });
});
