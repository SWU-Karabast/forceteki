describe('Ancestral Sight', function() {
    integration(function() {
        beforeEach(function() {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['kitsu-spiritcaller', 'kakita-toshimoko', 'doji-challenger'],
                    dynastyDiscard: ['kakita-toshimoko', 'doji-challenger', 'miya-mystic', 'doji-whisperer', 'imperial-storehouse'],
                    hand: ['ancestral-sight']
                },
                player2: {
                    inPlay: ['miya-mystic', 'kakita-toshimoko']
                }
            });

            this.spiritcaller = this.player1.findCardByName('kitsu-spiritcaller');
            this.toshimoko = this.player1.findCardByName('kakita-toshimoko', 'play area');
            this.toshimoko2 = this.player1.findCardByName('kakita-toshimoko', 'dynasty discard pile');
            this.toshimoko3 = this.player2.findCardByName('kakita-toshimoko');
            this.challenger = this.player1.findCardByName('doji-challenger', 'play area');
            this.challenger2 = this.player1.findCardByName('doji-challenger', 'dynasty discard pile');
            this.whisperer = this.player1.findCardByName('doji-whisperer');
            this.mystic = this.player2.findCardByName('miya-mystic');
            this.mystic2 = this.player1.findCardByName('miya-mystic');
            this.storehouse = this.player1.findCardByName('imperial-storehouse');

            this.sight = this.player1.findCardByName('ancestral-sight');

        });

        it('should only attach to a shugenja', function() {
            this.player1.clickCard(this.sight);
            expect(this.player1).toBeAbleToSelect(this.spiritcaller);
            expect(this.player1).not.toBeAbleToSelect(this.toshimoko);
            expect(this.player1).not.toBeAbleToSelect(this.challenger);
            expect(this.player1).toBeAbleToSelect(this.mystic);
        });

        it('should give an ability to the attached character', function() {
            this.player1.clickCard(this.sight);
            this.player1.clickCard(this.spiritcaller);
            this.player2.pass();
            this.player1.clickCard(this.sight);
            expect(this.player1).toHavePrompt('Action Window');
            this.player1.clickCard(this.spiritcaller);
            expect(this.player1).toHavePrompt('Choose a card to return to your deck');
        });

        it('should let you pick a card that has a copy in play', function() {
            this.player1.clickCard(this.sight);
            this.player1.clickCard(this.spiritcaller);
            this.player2.pass();
            this.player1.clickCard(this.spiritcaller);
            expect(this.player1).toBeAbleToSelect(this.toshimoko2);
            expect(this.player1).toBeAbleToSelect(this.challenger2);
            expect(this.player1).toBeAbleToSelect(this.mystic2);
            expect(this.player1).not.toBeAbleToSelect(this.whisperer);
            expect(this.player1).not.toBeAbleToSelect(this.storehouse);
        });

        it('should let you pick a card with the same name as the card you picked', function() {
            this.player1.clickCard(this.sight);
            this.player1.clickCard(this.spiritcaller);
            this.player2.pass();
            this.player1.clickCard(this.spiritcaller);
            this.player1.clickCard(this.toshimoko2);
            expect(this.player1).toBeAbleToSelect(this.toshimoko);
            expect(this.player1).toBeAbleToSelect(this.toshimoko3);
            expect(this.player1).not.toBeAbleToSelect(this.challenger);
            expect(this.player1).not.toBeAbleToSelect(this.mystic);
            expect(this.player1).not.toBeAbleToSelect(this.spiritcaller);
        });

        it('should put a fate on the selected character from your pool', function() {
            let pfate = this.player1.fate;
            let fate = this.toshimoko.fate;
            this.player1.clickCard(this.sight);
            this.player1.clickCard(this.spiritcaller);
            this.player2.pass();
            this.player1.clickCard(this.spiritcaller);
            this.player1.clickCard(this.toshimoko2);
            this.player1.clickCard(this.toshimoko);

            expect(this.player1.fate).toBe(pfate - 1);
            expect(this.toshimoko.fate).toBe(fate + 1);
            expect(this.toshimoko2.location).toBe('dynasty deck');
            expect(this.player1.player.dynastyDeck.last()).toBe(this.toshimoko2);
            expect(this.getChatLogs(5)).toContain('player1 uses Kitsu Spiritcaller\'s gained ability from Ancestral Sight, returning Kakita Toshimoko to the bottom of the dynasty deck to place 1 fate on Kakita Toshimoko');
        });

        it('should not be usable if there are no characters in play who are valid targets', function() {
            this.player1.moveCard(this.toshimoko, 'dynasty discard pile');
            this.player1.moveCard(this.challenger, 'dynasty discard pile');
            this.player2.moveCard(this.mystic, 'dynasty discard pile');
            this.player2.moveCard(this.toshimoko3, 'dynasty discard pile');
            this.game.checkGameState(true);

            this.player1.clickCard(this.sight);
            this.player1.clickCard(this.spiritcaller);
            this.player2.pass();
            this.player1.clickCard(this.spiritcaller);
            expect(this.player1).toHavePrompt('Action Window');
        });
    });
});
