describe('Talk With the Servants', function () {
    integration(function () {
        beforeEach(function () {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['bayushi-liar', 'miya-mystic'],
                    hand: ['talk-with-the-servants']
                },
                player2: {
                    hand: ['fine-katana', 'ornate-fan', 'finger-of-jade', 'elegant-tessen']
                }
            });
            this.bayushiLiar = this.player1.findCardByName('bayushi-liar');
            this.miyaMystic = this.player1.findCardByName('miya-mystic');
            this.talkWithTheServants = this.player1.findCardByName('talk-with-the-servants');

            this.katana = this.player2.findCardByName('fine-katana');
            this.fan = this.player2.findCardByName('ornate-fan');
            this.finger = this.player2.findCardByName('finger-of-jade');

            this.noMoreActions();
        });

        it('forces chosen discard without dishonoring a character', function () {
            this.initiateConflict({
                type: 'political',
                attackers: [this.bayushiLiar],
                defenders: [],
                jumpTo: 'afterConflict'
            });
            expect(this.player1).toHavePrompt('Any reactions?');
            expect(this.player1).toBeAbleToSelect(this.talkWithTheServants);

            this.player1.clickCard(this.talkWithTheServants);
            expect(this.player1).toHavePrompt('Select character to dishonor');
            expect(this.player1).toBeAbleToSelect(this.bayushiLiar);
            expect(this.player1).not.toBeAbleToSelect(this.miyaMystic);
            expect(this.player1).toHavePromptButton('Done');

            this.player1.clickPrompt('Done');
            expect(this.player2).toHavePrompt('Choose 2 cards to discard');

            this.player2.clickCard(this.katana);
            this.player2.clickCard(this.fan);
            this.player2.clickCard(this.finger);
            this.player2.clickPrompt('Done');
            expect(this.getChatLogs(5)).toContain(
                'player1 plays Talk With the Servants to make player2 discard 2 cards'
            );
        });

        it('forces random discard by dishonoring a courtier', function () {
            this.initiateConflict({
                type: 'political',
                attackers: [this.bayushiLiar],
                defenders: [],
                jumpTo: 'afterConflict'
            });
            expect(this.player1).toHavePrompt('Any reactions?');
            expect(this.player1).toBeAbleToSelect(this.talkWithTheServants);

            this.player1.clickCard(this.talkWithTheServants);
            expect(this.player1).toHavePrompt('Select character to dishonor');
            expect(this.player1).toBeAbleToSelect(this.bayushiLiar);
            expect(this.player1).not.toBeAbleToSelect(this.miyaMystic);
            expect(this.player1).toHavePromptButton('Done');

            this.player1.clickCard(this.bayushiLiar);
            expect(this.getChatLogs(5)).toContain(
                'player1 plays Talk With the Servants, dishonoring Bayushi Liar to make player2 discard 2 cards at random'
            );
        });
    });
});
