describe('Bayushi Kotaro', function () {
    integration(function () {
        beforeEach(function () {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['bayushi-kotaro'],
                    dynastyDeck: ['shiba-tsukune', 'cursecatcher', 'yogo-outcast']
                }
            });
            this.kotaro = this.player1.findCardByName('bayushi-kotaro');
            this.shibaTsukune = this.player1.placeCardInProvince('shiba-tsukune', 'province 1');
            this.cursecatcher = this.player1.placeCardInProvince('cursecatcher', 'province 2');
            this.outcast = this.player1.placeCardInProvince('yogo-outcast', 'province 3');
            this.outcast.facedown = true;
            this.cursecatcher.facedown = false;
            this.shibaTsukune.facedown = false;
        });

        it('reveals all the cards in scorp provinces and put a scorp character in play', function () {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.kotaro],
                defenders: [],
                type: 'military'
            });

            this.player2.pass();
            this.player1.clickCard(this.kotaro);

            expect(this.outcast.facedown).toBe(false);
            expect(this.cursecatcher.facedown).toBe(false);
            expect(this.shibaTsukune.facedown).toBe(false);

            expect(this.player1).toHavePrompt('Choose a character to put into the conflict');
            expect(this.player1).not.toBeAbleToSelect(this.shibaTsukune);
            expect(this.player1).toBeAbleToSelect(this.cursecatcher);
            expect(this.player1).toBeAbleToSelect(this.outcast);

            this.player1.clickCard(this.cursecatcher);
            expect(this.cursecatcher.location).toBe('play area');
            expect(this.game.currentConflict.attackers).toContain(this.cursecatcher);

            this.noMoreActions();
            this.player1.clickPrompt('Yes');
            this.player1.clickPrompt('Gain 2 Honor');
            expect(this.cursecatcher.location).toBe('dynasty deck');
        });
    });
});