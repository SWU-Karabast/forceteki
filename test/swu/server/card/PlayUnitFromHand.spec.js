describe('Play unit from hand', function() {
    integration(function() {
        beforeEach(function () {
            this.setupTest({
                phase: 'action',
                player1: {
                    hand: ['cartel-spacer'],
                    resources: ['atst', 'atst'],
                    leader: 'boba-fett#collecting-the-bounty'
                },
                player2: {
                    groundArena: ['wampa'],
                    resources: ['atst', 'atst']
                }
            });
            this.cartelSpacer = this.player1.findCardByName('cartel-spacer');
            this.wampa = this.player2.findCardByName('wampa');

            this.noMoreActions();
        });

        it('basic case', function () {
            this.player1.clickCard(this.cartelSpacer);

            expect(this.cartelSpacer.location).toBe('space arena');
            expect(this.cartelSpacer.exhausted).toBe(true);
            expect(this.player1.countSpendableResources()).toBe(0);
            expect(this.player1.countExhaustedResources()).toBe(2);
        });
    });
});
