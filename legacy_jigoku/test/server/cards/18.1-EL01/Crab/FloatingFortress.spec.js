describe('Floating Fortress', function () {
    integration(function () {
        beforeEach(function () {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['doji-diplomat']
                },
                player2: {
                    inPlay: ['brash-samurai'],
                    hand: ['fine-katana', 'ornate-fan'],
                    dynastyDiscard: ['floating-fortress', 'imperial-storehouse', 'fire-and-oil']
                }
            });

            this.diplomat = this.player1.findCardByName('doji-diplomat');
            this.brash = this.player2.findCardByName('brash-samurai');
            this.fortress = this.player2.findCardByName('floating-fortress');
            this.storehouse = this.player2.findCardByName('imperial-storehouse');
            this.oil = this.player2.findCardByName('fire-and-oil');

            this.fan = this.player2.findCardByName('ornate-fan');
            this.katana = this.player2.findCardByName('fine-katana');

            this.sd1 = this.player2.findCardByName('shameful-display', 'province 1');
            this.sd2 = this.player2.findCardByName('shameful-display', 'province 2');

            this.player2.placeCardInProvince(this.fortress, 'province 2');
            this.fortress.facedown = false;
        });

        it('becomes a copy of a holding', function () {
            let initialFate = this.player2.fate;
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.diplomat],
                defenders: [this.brash],
                province: this.sd1
            });

            this.player2.clickCard(this.fortress);
            expect(this.player2).toHavePrompt('Choose a holding');
            expect(this.player2).toBeAbleToSelect(this.oil);
            expect(this.player2).toBeAbleToSelect(this.storehouse);

            this.player2.clickCard(this.oil);
            expect(this.getChatLogs(4)).toContain(
                'player2 uses Floating Fortress, spending 1 fate to turn Floating Fortress into a copy of Fire and Oil'
            );

            expect(this.player2).toHavePrompt('Move the holding to into the attacked provinces?');
            expect(this.player2).toHavePromptButton('No');
            expect(this.player2).toHavePromptButton('Yes');

            this.player2.clickPrompt('Yes');
            expect(this.getChatLogs(4)).toContain('player2 moves Fire and Oil to Shameful Display');
            expect(this.player2.fate).toBe(initialFate - 1);
            expect(this.fortress.location).toBe('province 1');

            this.player1.pass();
            this.player2.clickCard(this.fortress);
            expect(this.player2).toHavePrompt('Choose a character');

            this.player2.clickCard(this.diplomat);
            expect(this.diplomat.isDishonored).toBe(true);
            expect(this.getChatLogs(3)).toContain(
                'player2 uses Fire and Oil, losing 1 honor to dishonor Doji Diplomat'
            );
        });

        it('should not work as the attacking player', function () {
            this.noMoreActions();
            this.player1.passConflict();
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.brash],
                defenders: [this.diplomat]
            });
            this.player1.pass();
            expect(this.player2).toHavePrompt('Conflict Action Window');
            this.player2.clickCard(this.fortress);
            expect(this.player2).toHavePrompt('Conflict Action Window');
        });
    });
});