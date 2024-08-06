describe('Protected Merchant', function () {
    integration(function () {
        beforeEach(function () {
            this.setupTest({
                player1: {
                    dynastyDiscard: ['hidden-moon-dojo', 'karada-district', 'chisei-district'],
                    inPlay: ['protected-merchant']
                },
                player2: {
                    dynastyDiscard: ['imperial-storehouse']
                }
            });

            this.merchant = this.player1.findCardByName('protected-merchant');
            this.player2.placeCardInProvince('imperial-storehouse', 'province 1');
        });

        it('gains 1 glory per holding you control', function () {
            expect(this.merchant.glory).toBe(0);

            this.player1.placeCardInProvince('hidden-moon-dojo', 'province 1');
            expect(this.merchant.glory).toBe(1);

            this.player1.placeCardInProvince('karada-district', 'province 2');
            expect(this.merchant.glory).toBe(2);
        });

        it('has a max of 2 glory gained through effect', function () {
            this.player1.placeCardInProvince('hidden-moon-dojo', 'province 1');
            this.player1.placeCardInProvince('karada-district', 'province 2');
            this.player1.placeCardInProvince('chisei-district', 'province 3');
            expect(this.merchant.glory).toBe(2);
        });
    });
});
