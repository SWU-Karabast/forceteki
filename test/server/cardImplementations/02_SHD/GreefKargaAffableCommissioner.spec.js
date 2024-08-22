describe('Greef Karga, Affable Commissioner', function() {
    integration(function() {
        describe('Greef Karga\'s Ability', function() {
            beforeEach(function () {
                this.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['greef-karga#affable-commissioner'],
                        deck: []
                    },
                });

                this.greefKarga = this.player1.findCardByName('greef-karga#affable-commissioner');

                this.noMoreActions();
            });

            it('', function () {
            });
        });
    });
});
