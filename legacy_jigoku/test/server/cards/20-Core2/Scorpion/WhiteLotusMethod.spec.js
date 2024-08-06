describe('White Lotus Method', function () {
    integration(function () {
        beforeEach(function () {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['alibi-artist', 'bayushi-liar', 'bayushi-manipulator'],
                    hand: ['white-lotus-method']
                },
                player2: {
                    inPlay: ['doji-whisperer', 'doji-hotaru'],
                    hand: []
                }
            });

            this.whiteLotusMethod = this.player1.findCardByName('white-lotus-method');
            this.bayushiLiar = this.player1.findCardByName('bayushi-liar');
            this.bayushiManipulator = this.player1.findCardByName('bayushi-manipulator');
            this.bayushiManipulator.dishonor();
            this.alibiArtist = this.player1.findCardByName('alibi-artist');
            this.alibiArtist.dishonor();

            this.dojiWhisperer = this.player2.findCardByName('doji-whisperer');
            this.dojiHotaru = this.player2.findCardByName('doji-hotaru');
            this.dojiHotaru.honor();
        });

        it('moves token around own characters', function () {
            this.player1.clickCard(this.whiteLotusMethod);
            expect(this.player1).toHavePrompt('Choose the status token to move');
            expect(this.player1).not.toBeAbleToSelect(this.bayushiLiar);
            expect(this.player1).toBeAbleToSelect(this.bayushiManipulator);
            expect(this.player1).toBeAbleToSelect(this.alibiArtist);
            expect(this.player1).not.toBeAbleToSelect(this.dojiWhisperer);
            expect(this.player1).not.toBeAbleToSelect(this.dojiHotaru);

            this.player1.clickCard(this.bayushiManipulator);
            expect(this.player1).toHavePrompt('Choose a Character to receive the token');
            expect(this.player1).toBeAbleToSelect(this.bayushiLiar);
            expect(this.player1).not.toBeAbleToSelect(this.bayushiManipulator);
            expect(this.player1).not.toBeAbleToSelect(this.alibiArtist);
            expect(this.player1).toBeAbleToSelect(this.dojiWhisperer);
            expect(this.player1).not.toBeAbleToSelect(this.dojiHotaru);

            this.player1.clickCard(this.bayushiLiar);
            expect(this.bayushiManipulator.isDishonored).toBe(false);
            expect(this.bayushiLiar.isDishonored).toBe(true);
            expect(this.player1.hand.length).toBe(0);
            expect(this.getChatLogs(5)).toContain(
                'player1 plays White Lotus Method to move a status token to Bayushi Liar'
            );
        });

        it('moves token to opponents characters', function () {
            this.player1.clickCard(this.whiteLotusMethod);
            expect(this.player1).toHavePrompt('Choose the status token to move');
            expect(this.player1).not.toBeAbleToSelect(this.bayushiLiar);
            expect(this.player1).toBeAbleToSelect(this.bayushiManipulator);
            expect(this.player1).toBeAbleToSelect(this.alibiArtist);
            expect(this.player1).not.toBeAbleToSelect(this.dojiWhisperer);
            expect(this.player1).not.toBeAbleToSelect(this.dojiHotaru);

            this.player1.clickCard(this.bayushiManipulator);
            expect(this.player1).toHavePrompt('Choose a Character to receive the token');
            expect(this.player1).toBeAbleToSelect(this.bayushiLiar);
            expect(this.player1).not.toBeAbleToSelect(this.bayushiManipulator);
            expect(this.player1).not.toBeAbleToSelect(this.alibiArtist);
            expect(this.player1).toBeAbleToSelect(this.dojiWhisperer);
            expect(this.player1).not.toBeAbleToSelect(this.dojiHotaru);

            this.player1.clickCard(this.dojiWhisperer);
            expect(this.bayushiManipulator.isDishonored).toBe(false);
            expect(this.dojiWhisperer.isDishonored).toBe(true);
            expect(this.player2.hand.length).toBe(1);
            expect(this.getChatLogs(5)).toContain(
                'player1 plays White Lotus Method to move a status token to Doji Whisperer, their controller draws a card'
            );
        });
    });
});
