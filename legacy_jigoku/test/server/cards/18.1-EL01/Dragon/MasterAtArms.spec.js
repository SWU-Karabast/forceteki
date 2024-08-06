describe('Master at Arms', function () {
    integration(function () {
        beforeEach(function () {
            this.setupTest({
                phase: 'dynasty',
                player1: {
                    hand: [],
                    dynastyDiscard: ['master-at-arms'],
                    conflictDiscard: ['fine-katana', 'ornate-fan']
                },
                player2: {
                    inPlay: ['moto-nergui']
                }
            });

            this.masterAtArms = this.player1.placeCardInProvince('master-at-arms');
            this.fineKatana = this.player1.findCardByName('fine-katana');
            this.ornateFan = this.player1.findCardByName('ornate-fan');
        });

        it('adds a weapon back to your hand', function () {
            this.player1.clickCard(this.masterAtArms);
            this.player1.clickPrompt('0');
            expect(this.player1).toHavePrompt(
                'Any reactions to Master at Arms being played or Master at Arms entering play?'
            );

            this.player1.clickCard(this.masterAtArms);
            expect(this.player1).toBeAbleToSelect(this.fineKatana);
            expect(this.player1).not.toBeAbleToSelect(this.ornateFan);

            this.player1.clickCard(this.fineKatana);
            expect(this.fineKatana.location).toBe('hand');
            expect(this.ornateFan.location).toBe('conflict discard pile');
        });
    });
});
